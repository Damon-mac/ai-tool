import { Injectable, Logger } from '@nestjs/common';
import { ModelConfigService, RuntimeModelConfig } from '../model-config/model-config.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly modelConfigService: ModelConfigService) {}

  async testConnection(runtimeConfig: RuntimeModelConfig) {
    const { baseUrl, apiKey, model } = runtimeConfig;

    if (!baseUrl || !apiKey || !model) {
      return {
        success: false,
        message: '模型配置不完整，无法测试连接',
      };
    }

    try {
      const response = await this.requestChatCompletion(
        {
          systemPrompt: 'You are a connection probe.',
          userPrompt: 'Return a short acknowledgement.',
          fallback: { ok: true },
        },
        runtimeConfig,
        false,
      );

      if (!response.ok) {
        const detail = await this.readResponseText(response);
        return {
          success: false,
          status: response.status,
          message: detail || `连接失败，状态码 ${response.status}`,
        };
      }

      return {
        success: true,
        status: response.status,
        message: `连接成功：${runtimeConfig.model}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接测试失败',
      };
    }
  }

  async chatJson<T>(params: {
    systemPrompt: string;
    userPrompt: string;
    fallback: T;
  }): Promise<T> {
    const runtimeConfig = await this.modelConfigService.getRuntimeConfig();
    const { baseUrl, apiKey, model } = runtimeConfig;

    if (!baseUrl || !apiKey || !model) {
      this.logger.warn(`AI config missing, returning fallback content (source=${runtimeConfig.source}, baseUrl=${baseUrl || '<empty>'}, model=${model || '<empty>'})`);
      return params.fallback;
    }

    try {
      const response = await this.requestChatCompletion(params, runtimeConfig, true);

      if (!response.ok) {
        await this.logFailedResponse('Primary AI request failed', response);
        const fallbackResponse = await this.requestChatCompletion(params, runtimeConfig, false);
        if (!fallbackResponse.ok) {
          await this.logFailedResponse('Fallback AI request failed', fallbackResponse);
          return params.fallback;
        }

        return this.parseResponse<T>(fallbackResponse, runtimeConfig, params.fallback);
      }

      return this.parseResponse<T>(response, runtimeConfig, params.fallback);
    } catch (error) {
      this.logger.error('AI request failed unexpectedly', error instanceof Error ? error.stack : undefined);
      return params.fallback;
    }
  }

  private async requestChatCompletion<T>(
    params: {
      systemPrompt: string;
      userPrompt: string;
      fallback: T;
    },
    runtimeConfig: RuntimeModelConfig,
    useJsonFormat: boolean,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), runtimeConfig.timeoutMs);
    const provider = runtimeConfig.provider;
    const { apiKey, model } = runtimeConfig;
    const requestUrl = provider === 'anthropic'
      ? this.resolveAnthropicMessagesUrl(runtimeConfig.baseUrl)
      : this.resolveChatCompletionsUrl(runtimeConfig.baseUrl);

    try {
      if (provider === 'anthropic') {
        return await fetch(requestUrl, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: runtimeConfig.maxTokens,
            system: `${params.systemPrompt}\n\n请只输出严格 JSON，不要输出额外解释。`,
            messages: [
              {
                role: 'user',
                content: [{ type: 'text', text: params.userPrompt }],
              },
            ],
          }),
          signal: controller.signal,
        });
      }

      const body: Record<string, unknown> = {
        model,
        temperature: 0.8,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userPrompt },
        ],
      };

      if (useJsonFormat) {
        body.response_format = { type: 'json_object' };
      }

      return await fetch(requestUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async parseResponse<T>(response: Response, runtimeConfig: RuntimeModelConfig, fallback: T): Promise<T> {
    const raw = await response.text();
    const json = this.parseJsonObject(raw);
    if (!json) {
      this.logger.warn('AI response was not valid JSON');
      return fallback;
    }

    const provider = runtimeConfig.provider;

    if (provider === 'anthropic') {
      const anthropicContent = this.extractAnthropicText(json);
      if (anthropicContent) {
        return this.safeParseJson<T>(anthropicContent, fallback);
      }
    }

    const genericContent = this.extractGenericText(json);
    if (genericContent) {
      return this.safeParseJson<T>(genericContent, fallback);
    }

    const anthropicContent = this.extractAnthropicText(json);
    if (anthropicContent) {
      return this.safeParseJson<T>(anthropicContent, fallback);
    }

    this.logger.warn('AI response did not contain parseable content, returning fallback');
    return fallback;
  }

  private resolveChatCompletionsUrl(baseUrl: string): string {

    if (baseUrl.includes('api.deepseek.com')) {
      return `${baseUrl.replace(/\/v1$/, '')}/chat/completions`;
    }

    if (baseUrl.endsWith('/chat/completions')) {
      return baseUrl;
    }

    if (baseUrl.endsWith('/v1')) {
      return `${baseUrl}/chat/completions`;
    }

    return `${baseUrl}/v1/chat/completions`;
  }

  private resolveAnthropicMessagesUrl(baseUrl: string): string {

    if (baseUrl.endsWith('/messages')) {
      return baseUrl;
    }

    if (baseUrl.endsWith('/v1')) {
      return `${baseUrl}/messages`;
    }

    return `${baseUrl}/v1/messages`;
  }

  private async logFailedResponse(prefix: string, response: Response) {
    const compactBody = await this.readResponseText(response);
    this.logger.warn(`${prefix} with status ${response.status} on ${response.url}${compactBody ? `: ${compactBody.slice(0, 500)}` : ''}`);
  }

  private async readResponseText(response: Response) {
    const body = await response.clone().text();
    return body.replace(/\s+/g, ' ').trim();
  }

  private parseJsonObject(content: string): Record<string, any> | null {
    try {
      return JSON.parse(content) as Record<string, any>;
    } catch {
      return null;
    }
  }

  private extractAnthropicText(json: Record<string, any>): string | null {
    const candidates = [json.content, json.message?.content, json.choices?.[0]?.message?.content];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }

      if (!Array.isArray(candidate)) {
        continue;
      }

      const textBlocks = candidate
        .filter((item) => item?.type === 'text' && typeof item.text === 'string')
        .map((item) => item.text.trim())
        .filter((item) => Boolean(item));

      if (textBlocks.length) {
        return textBlocks.join('\n');
      }

      const thinkingBlocks = candidate
        .filter((item) => item?.type === 'thinking' && typeof item.thinking === 'string')
        .map((item) => item.thinking.trim())
        .filter((item) => Boolean(item));

      if (thinkingBlocks.length) {
        return thinkingBlocks.join('\n');
      }
    }

    return null;
  }

  private extractGenericText(json: Record<string, any>): string | null {
    const content = json.choices?.[0]?.message?.content;

    if (typeof content === 'string' && content.trim()) {
      return content.trim();
    }

    if (Array.isArray(content)) {
      const textBlocks = content
        .filter((item) => typeof item?.text === 'string')
        .map((item) => item.text.trim())
        .filter((item) => Boolean(item));

      if (textBlocks.length) {
        return textBlocks.join('\n');
      }
    }

    return null;
  }

  private safeParseJson<T>(content: string, fallback: T): T {
    const normalized = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      return JSON.parse(normalized) as T;
    } catch {
      const match = normalized.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!match) {
        this.logger.warn('AI content could not be parsed into JSON, returning fallback');
        return fallback;
      }
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        this.logger.warn('AI extracted JSON fragment could not be parsed, returning fallback');
        return fallback;
      }
    }
  }
}
