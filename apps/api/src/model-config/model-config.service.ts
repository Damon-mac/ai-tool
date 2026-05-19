import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UpdateModelConfigDto } from './dto/update-model-config.dto';

interface StoredModelItem {
  id: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  provider: 'openai' | 'anthropic';
  createdAt: string;
  updatedAt: string;
}

interface StoredModelState {
  activeModelId: string | null;
  models: StoredModelItem[];
}

export interface RuntimeModelConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  provider: 'openai' | 'anthropic';
  maxTokens: number;
  timeoutMs: number;
  source: 'file' | 'env';
  updatedAt: string | null;
  modelId: string | null;
}

interface PublicModelItem {
  id: string;
  baseUrl: string;
  model: string;
  provider: 'openai' | 'anthropic';
  hasApiKey: boolean;
  apiKeyHint: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ModelConfigManagerState {
  source: 'file' | 'env';
  activeModelId: string | null;
  runtime: {
    modelId: string | null;
    baseUrl: string;
    model: string;
    provider: 'openai' | 'anthropic';
    hasApiKey: boolean;
    apiKeyHint: string;
    updatedAt: string | null;
    source: 'file' | 'env';
  };
  envDefault: {
    baseUrl: string;
    model: string;
    provider: 'openai' | 'anthropic';
    hasApiKey: boolean;
    apiKeyHint: string;
  };
  models: PublicModelItem[];
}

@Injectable()
export class ModelConfigService {
  private readonly filePath = resolve(process.cwd(), '..', '..', '.model-config.local.json');

  constructor(private readonly configService: ConfigService) {}

  async getRuntimeConfig(): Promise<RuntimeModelConfig> {
    const state = await this.readStoredState();
    const envDefault = this.getEnvDefault();
    const activeModel = state.activeModelId ? state.models.find((item) => item.id === state.activeModelId) : null;

    const resolved = activeModel
      ? {
          baseUrl: activeModel.baseUrl,
          apiKey: activeModel.apiKey,
          model: activeModel.model,
          provider: activeModel.provider,
          source: 'file' as const,
          updatedAt: activeModel.updatedAt,
          modelId: activeModel.id,
        }
      : {
          ...envDefault,
          source: 'env' as const,
          updatedAt: null,
          modelId: null,
        };

    return {
      baseUrl: resolved.baseUrl,
      apiKey: resolved.apiKey,
      model: resolved.model,
      provider: resolved.provider,
      maxTokens: Number(this.configService.get<string>('MODEL_MAX_TOKENS', '2200')),
      timeoutMs: Number(this.configService.get<string>('MODEL_TIMEOUT_MS', '20000')),
      source: resolved.source,
      updatedAt: resolved.updatedAt,
      modelId: resolved.modelId,
    };
  }

  async getManagerState(): Promise<ModelConfigManagerState> {
    const state = await this.readStoredState();
    const runtime = await this.getRuntimeConfig();
    const envDefault = this.getEnvDefault();

    return {
      source: runtime.source,
      activeModelId: runtime.modelId,
      runtime: {
        modelId: runtime.modelId,
        baseUrl: runtime.baseUrl,
        model: runtime.model,
        provider: runtime.provider,
        hasApiKey: Boolean(runtime.apiKey),
        apiKeyHint: this.maskSecret(runtime.apiKey),
        updatedAt: runtime.updatedAt,
        source: runtime.source,
      },
      envDefault: {
        baseUrl: envDefault.baseUrl,
        model: envDefault.model,
        provider: envDefault.provider,
        hasApiKey: Boolean(envDefault.apiKey),
        apiKeyHint: this.maskSecret(envDefault.apiKey),
      },
      models: state.models.map((item) => ({
        id: item.id,
        baseUrl: item.baseUrl,
        model: item.model,
        provider: item.provider,
        hasApiKey: Boolean(item.apiKey),
        apiKeyHint: this.maskSecret(item.apiKey),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        isActive: item.id === state.activeModelId,
      })),
    };
  }

  async createModel(dto: UpdateModelConfigDto) {
    const state = await this.readStoredState();
    const now = new Date().toISOString();
    const apiKey = dto.apiKey?.trim() || '';

    if (!apiKey) {
      throw new BadRequestException('请填写 API Key');
    }

    state.models.unshift({
      id: randomUUID(),
      baseUrl: dto.baseUrl.trim().replace(/\/$/, ''),
      apiKey,
      model: dto.model.trim(),
      provider: this.normalizeProvider(dto.provider, dto.baseUrl),
      createdAt: now,
      updatedAt: now,
    });

    if (!state.activeModelId) {
      state.activeModelId = state.models[0].id;
    }

    await this.writeStoredState(state);
    return this.getManagerState();
  }

  async updateModel(modelId: string, dto: UpdateModelConfigDto) {
    const state = await this.readStoredState();
    const target = state.models.find((item) => item.id === modelId);

    if (!target) {
      throw new NotFoundException('模型不存在');
    }

    const apiKey = dto.apiKey?.trim() || target.apiKey;
    if (!apiKey) {
      throw new BadRequestException('请填写 API Key');
    }

    target.baseUrl = dto.baseUrl.trim().replace(/\/$/, '');
    target.apiKey = apiKey;
    target.model = dto.model.trim();
    target.provider = this.normalizeProvider(dto.provider, dto.baseUrl);
    target.updatedAt = new Date().toISOString();

    await this.writeStoredState(state);
    return this.getManagerState();
  }

  async setActiveModel(modelId: string) {
    const state = await this.readStoredState();
    const exists = state.models.some((item) => item.id === modelId);

    if (!exists) {
      throw new NotFoundException('模型不存在');
    }

    state.activeModelId = modelId;
    await this.writeStoredState(state);
    return this.getManagerState();
  }

  async clearActiveModel() {
    const state = await this.readStoredState();
    state.activeModelId = null;
    await this.writeStoredState(state);
    return this.getManagerState();
  }

  async deleteModel(modelId: string) {
    const state = await this.readStoredState();
    const nextModels = state.models.filter((item) => item.id !== modelId);

    if (nextModels.length === state.models.length) {
      throw new NotFoundException('模型不存在');
    }

    state.models = nextModels;
    if (state.activeModelId === modelId) {
      state.activeModelId = null;
    }

    await this.writeStoredState(state);
    return this.getManagerState();
  }

  async getRuntimeConfigForModel(modelId: string): Promise<RuntimeModelConfig> {
    const state = await this.readStoredState();
    const target = state.models.find((item) => item.id === modelId);

    if (!target) {
      throw new NotFoundException('模型不存在');
    }

    return {
      baseUrl: target.baseUrl,
      apiKey: target.apiKey,
      model: target.model,
      provider: target.provider,
      maxTokens: Number(this.configService.get<string>('MODEL_MAX_TOKENS', '2200')),
      timeoutMs: Number(this.configService.get<string>('MODEL_TIMEOUT_MS', '20000')),
      source: 'file',
      updatedAt: target.updatedAt,
      modelId: target.id,
    };
  }

  private getEnvDefault() {
    const baseUrl = this.configService.get<string>('MODEL_BASE_URL', '')?.trim().replace(/\/$/, '') || '';
    const apiKey = this.configService.get<string>('MODEL_API_KEY', '')?.trim() || '';
    const model = this.configService.get<string>('MODEL_NAME', '')?.trim() || '';
    const provider = this.normalizeProvider(this.configService.get<string>('MODEL_PROVIDER', '') || '', baseUrl);

    return {
      baseUrl,
      apiKey,
      model,
      provider,
    };
  }

  private async readStoredState(): Promise<StoredModelState> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<StoredModelState & UpdateModelConfigDto & { updatedAt?: string }>;

      if (Array.isArray(parsed.models)) {
        return {
          activeModelId: typeof parsed.activeModelId === 'string' ? parsed.activeModelId : null,
          models: parsed.models
            .map((item) => this.normalizeStoredModelItem(item))
            .filter((item): item is StoredModelItem => Boolean(item)),
        };
      }

      const legacyItem = this.normalizeLegacyModel(parsed);
      if (legacyItem) {
        return {
          activeModelId: legacyItem.id,
          models: [legacyItem],
        };
      }

      return { activeModelId: null, models: [] };
    } catch {
      return { activeModelId: null, models: [] };
    }
  }

  private async writeStoredState(state: StoredModelState) {
    await fs.writeFile(this.filePath, JSON.stringify(state, null, 2), 'utf8');
  }

  private normalizeStoredModelItem(item: unknown): StoredModelItem | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const candidate = item as Partial<StoredModelItem>;
    if (!candidate.id || !candidate.baseUrl || !candidate.apiKey || !candidate.model) {
      return null;
    }

    return {
      id: candidate.id,
      baseUrl: candidate.baseUrl.trim().replace(/\/$/, ''),
      apiKey: candidate.apiKey.trim(),
      model: candidate.model.trim(),
      provider: this.normalizeProvider(candidate.provider || '', candidate.baseUrl),
      createdAt: typeof candidate.createdAt === 'string' && candidate.createdAt ? candidate.createdAt : new Date(0).toISOString(),
      updatedAt: typeof candidate.updatedAt === 'string' && candidate.updatedAt ? candidate.updatedAt : new Date(0).toISOString(),
    };
  }

  private normalizeLegacyModel(item: Partial<UpdateModelConfigDto> & { updatedAt?: string }): StoredModelItem | null {
    if (!item.baseUrl || !item.apiKey || !item.model) {
      return null;
    }

    const timestamp = typeof item.updatedAt === 'string' && item.updatedAt ? item.updatedAt : new Date(0).toISOString();

    return {
      id: randomUUID(),
      baseUrl: item.baseUrl.trim().replace(/\/$/, ''),
      apiKey: item.apiKey.trim(),
      model: item.model.trim(),
      provider: this.normalizeProvider(item.provider || '', item.baseUrl),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  private normalizeProvider(provider: string, baseUrl: string): 'openai' | 'anthropic' {
    const normalized = provider.trim().toLowerCase();

    if (normalized === 'anthropic') {
      return 'anthropic';
    }

    if (normalized === 'openai') {
      return 'openai';
    }

    return baseUrl.toLowerCase().includes('anthropic') ? 'anthropic' : 'openai';
  }

  private maskSecret(value: string) {
    if (!value) {
      return '';
    }

    if (value.length <= 8) {
      return `${value.slice(0, 2)}****`;
    }

    return `${value.slice(0, 4)}****${value.slice(-4)}`;
  }
}
