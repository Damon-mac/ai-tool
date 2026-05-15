import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly baseUrl = process.env.MODEL_BASE_URL?.replace(/\/$/, '') || '';
  private readonly apiKey = process.env.MODEL_API_KEY || '';
  private readonly model = process.env.MODEL_NAME || '';
  private readonly explicitProvider = process.env.MODEL_PROVIDER?.trim().toLowerCase() || '';
  private readonly maxTokens = Number(process.env.MODEL_MAX_TOKENS || '2200');
  private readonly timeoutMs = Number(process.env.MODEL_TIMEOUT_MS || '20000');

  async chatJson<T>(params: {
    systemPrompt: string;
    userPrompt: string;
    fallback: T;
  }): Promise<T> {
    if (!this.baseUrl || !this.apiKey || !this.model) {
      return params.fallback;
    }

    try {
      const response = await this.requestChatCompletion(params, true);

      if (!response.ok) {
        const fallbackResponse = await this.requestChatCompletion(params, false);
        if (!fallbackResponse.ok) {
          return params.fallback;
        }

        return this.parseResponse<T>(fallbackResponse, params.fallback);
      }

      return this.parseResponse<T>(response, params.fallback);
    } catch {
      return params.fallback;
    }
  }

  private async requestChatCompletion<T>(
    params: {
      systemPrompt: string;
      userPrompt: string;
      fallback: T;
    },
    useJsonFormat: boolean,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const provider = this.resolveProvider();

    try {
      if (provider === 'anthropic') {
        return await fetch(this.resolveAnthropicMessagesUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: this.maxTokens,
            system: `${params.systemPrompt}\n\n请只输出严格 JSON，不要输出额外解释。`,
            messages: [{ role: 'user', content: params.userPrompt }],
          }),
          signal: controller.signal,
        });
      }

      const body: Record<string, unknown> = {
        model: this.model,
        temperature: 0.8,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userPrompt },
        ],
      };

      if (useJsonFormat) {
        body.response_format = { type: 'json_object' };
      }

      return await fetch(this.resolveChatCompletionsUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async parseResponse<T>(response: Response, fallback: T): Promise<T> {
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      content?: Array<{ type?: string; text?: string; thinking?: string }>;
    };
    const provider = this.resolveProvider();

    if (provider === 'anthropic') {
      const textBlocks = json.content
        ?.filter((item) => item.type === 'text' && typeof item.text === 'string')
        .map((item) => item.text?.trim())
        .filter((item): item is string => Boolean(item));

      if (textBlocks?.length) {
        return this.safeParseJson<T>(textBlocks.join('\n'), fallback);
      }

      const thinkingBlocks = json.content
        ?.filter((item) => item.type === 'thinking' && typeof item.thinking === 'string')
        .map((item) => item.thinking?.trim())
        .filter((item): item is string => Boolean(item));

      if (thinkingBlocks?.length) {
        return this.safeParseJson<T>(thinkingBlocks.join('\n'), fallback);
      }

      return fallback;
    }

    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      return fallback;
    }

    return this.safeParseJson<T>(content, fallback);
  }

  private resolveProvider(): 'openai' | 'anthropic' {
    if (this.explicitProvider === 'anthropic') {
      return 'anthropic';
    }

    if (this.explicitProvider === 'openai') {
      return 'openai';
    }

    return this.baseUrl.toLowerCase().includes('anthropic') ? 'anthropic' : 'openai';
  }

  private resolveChatCompletionsUrl(): string {
    if (this.baseUrl.endsWith('/chat/completions')) {
      return this.baseUrl;
    }

    if (this.baseUrl.endsWith('/v1')) {
      return `${this.baseUrl}/chat/completions`;
    }

    return `${this.baseUrl}/v1/chat/completions`;
  }

  private resolveAnthropicMessagesUrl(): string {
    if (this.baseUrl.endsWith('/messages')) {
      return this.baseUrl;
    }

    if (this.baseUrl.endsWith('/v1')) {
      return `${this.baseUrl}/messages`;
    }

    return `${this.baseUrl}/v1/messages`;
  }

  private safeParseJson<T>(content: string, fallback: T): T {
    try {
      return JSON.parse(content) as T;
    } catch {
      const match = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!match) {
        return fallback;
      }
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return fallback;
      }
    }
  }
}
