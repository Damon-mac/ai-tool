<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppTopbar from '../components/AppTopbar.vue';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';

interface ModelListItem {
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

interface ModelConfigResponse {
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
  models: ModelListItem[];
}

interface ModelTestResponse {
  success: boolean;
  status?: number;
  message: string;
}

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const saving = ref(false);
const switching = ref(false);
const resetting = ref(false);
const deletingId = ref('');
const testingId = ref('');
const errorMessage = ref('');
const currentConfig = ref<ModelConfigResponse | null>(null);
const editingModelId = ref<string | null>(null);

const form = reactive({
  baseUrl: '',
  apiKey: '',
  model: '',
  provider: 'openai' as 'openai' | 'anthropic',
});

const providerOptions = [
  { label: 'OpenAI Compatible', value: 'openai' as const },
  { label: 'Anthropic Compatible', value: 'anthropic' as const },
];

function resetForm() {
  form.baseUrl = currentConfig.value?.runtime.baseUrl || currentConfig.value?.envDefault.baseUrl || '';
  form.model = currentConfig.value?.runtime.model || currentConfig.value?.envDefault.model || '';
  form.provider = currentConfig.value?.runtime.provider || currentConfig.value?.envDefault.provider || 'openai';
  form.apiKey = '';
  editingModelId.value = null;
}

function startCreate() {
  resetForm();
}

function startEdit(item: ModelListItem) {
  editingModelId.value = item.id;
  form.baseUrl = item.baseUrl;
  form.model = item.model;
  form.provider = item.provider;
  form.apiKey = '';
}

async function initialize() {
  if (!authStore.token) {
    await router.push('/auth');
    return;
  }

  await authStore.fetchProfile();
  await loadConfig();
}

async function loadConfig() {
  const token = authStore.token;
  if (!token) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const config = await apiFetch<ModelConfigResponse>('/model-config', {}, token);
    currentConfig.value = config;
    resetForm();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载模型配置失败';
  } finally {
    loading.value = false;
  }
}

async function saveConfig() {
  const token = authStore.token;
  if (!token) {
    return;
  }

  saving.value = true;
  errorMessage.value = '';
  const isEditing = Boolean(editingModelId.value);

  try {
    currentConfig.value = await apiFetch<ModelConfigResponse>(editingModelId.value ? `/model-config/models/${editingModelId.value}` : '/model-config/models', {
      method: editingModelId.value ? 'PUT' : 'POST',
      body: JSON.stringify({
        baseUrl: form.baseUrl,
        apiKey: form.apiKey || undefined,
        model: form.model,
        provider: form.provider,
      }),
    }, token);
    resetForm();
    ElMessage.success(isEditing ? '模型已更新' : '模型已添加');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存失败';
  } finally {
    saving.value = false;
  }
}

async function setActiveModel(modelId: string) {
  const token = authStore.token;
  if (!token) {
    return;
  }

  switching.value = true;
  errorMessage.value = '';

  try {
    currentConfig.value = await apiFetch<ModelConfigResponse>(`/model-config/active/${modelId}`, {
      method: 'PUT',
    }, token);
    resetForm();
    ElMessage.success('已切换当前模型');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '切换模型失败';
  } finally {
    switching.value = false;
  }
}

async function resetToEnv() {
  const token = authStore.token;
  if (!token) {
    return;
  }

  resetting.value = true;
  errorMessage.value = '';

  try {
    currentConfig.value = await apiFetch<ModelConfigResponse>('/model-config/active', {
      method: 'DELETE',
    }, token);
    resetForm();
    ElMessage.success('已恢复为 env 默认模型');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '恢复默认失败';
  } finally {
    resetting.value = false;
  }
}

async function deleteModel(modelId: string) {
  const token = authStore.token;
  if (!token) {
    return;
  }

  if (!window.confirm('删除后该模型将从列表移除，确定继续吗？')) {
    return;
  }

  deletingId.value = modelId;
  errorMessage.value = '';

  try {
    currentConfig.value = await apiFetch<ModelConfigResponse>(`/model-config/models/${modelId}`, {
      method: 'DELETE',
    }, token);
    if (editingModelId.value === modelId) {
      resetForm();
    }
    ElMessage.success('模型已删除');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '删除失败';
  } finally {
    deletingId.value = '';
  }
}

async function testModel(modelId: string) {
  const token = authStore.token;
  if (!token) {
    return;
  }

  testingId.value = modelId;
  errorMessage.value = '';

  try {
    const result = await apiFetch<ModelTestResponse>(`/model-config/models/${modelId}/test`, {
      method: 'POST',
    }, token);

    if (result.success) {
      ElMessage.success(result.message);
      return;
    }

    ElMessage.error(result.message);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '测试连接失败';
  } finally {
    testingId.value = '';
  }
}

onMounted(() => {
  initialize();
});
</script>

<template>
  <div class="dashboard-shell tool-page-shell">
    <AppTopbar
      title="模型管理"
      subtitle="把你添加过的模型都管理起来，并选择当前真正生效的那个。页面保存的模型列表优先于 env 默认值。"
      back-to="/"
      compact
    />

    <section class="page-stack plain-page-stack">
      <div class="plain-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Runtime Model</p>
            <h2>当前生效配置</h2>
            <p class="helper-text">你可以从模型列表中切换当前使用的模型；如果没有激活模型，会自动回退到根目录 env 默认值。</p>
          </div>
        </div>

        <div v-if="currentConfig" class="model-config-meta">
          <span class="tag-chip">来源：{{ currentConfig.runtime.source === 'file' ? '已选模型' : 'env 默认值' }}</span>
          <span class="tag-chip">Provider：{{ currentConfig.runtime.provider }}</span>
          <span class="tag-chip">模型：{{ currentConfig.runtime.model || '未设置' }}</span>
          <span class="tag-chip">Key：{{ currentConfig.runtime.hasApiKey ? currentConfig.runtime.apiKeyHint : '未设置' }}</span>
        </div>

        <p v-if="errorMessage" class="error-text settings-error">{{ errorMessage }}</p>
      </div>

      <div class="plain-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Model List</p>
            <h2>已添加模型</h2>
            <p class="helper-text">你可以保存多个模型，然后自由切换当前使用哪个。</p>
          </div>
        </div>

        <div v-if="currentConfig?.models.length" class="plain-result-list">
          <article v-for="item in currentConfig.models" :key="item.id" class="result-row model-row">
            <div class="result-row-top model-row-top">
              <div class="result-row-meta model-row-meta">
                <span class="tag-chip">{{ item.provider }}</span>
                <span v-if="item.isActive" class="tag-chip warning">当前使用</span>
                <strong>{{ item.model }}</strong>
              </div>
              <div class="settings-actions">
                <button
                  class="ghost-btn"
                  :disabled="item.isActive || switching"
                  @click="setActiveModel(item.id)"
                >
                  设为当前
                </button>
                <button class="ghost-btn" :disabled="testingId === item.id" @click="testModel(item.id)">
                  {{ testingId === item.id ? '测试中...' : '测试连接' }}
                </button>
                <button class="ghost-btn" @click="startEdit(item)">编辑</button>
                <button class="ghost-btn danger-btn" :disabled="deletingId === item.id" @click="deleteModel(item.id)">
                  {{ deletingId === item.id ? '删除中...' : '删除' }}
                </button>
              </div>
            </div>
            <p class="result-row-content">{{ item.baseUrl }}</p>
            <div class="result-row-meta compact-copy">
              <small>Key：{{ item.apiKeyHint }}</small>
              <small>更新时间：{{ new Date(item.updatedAt).toLocaleString() }}</small>
            </div>
          </article>
        </div>
        <div v-else class="empty-state simple-empty-state">还没有添加任何模型，下面新增第一条即可。</div>
      </div>

      <div class="plain-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Manage</p>
            <h2>{{ editingModelId ? '编辑模型' : '新增模型' }}</h2>
          </div>
        </div>

        <div class="form-stack settings-form">
          <label class="input-group">
            <span>MODEL_BASE_URL</span>
            <el-input v-model="form.baseUrl" size="large" placeholder="例如：https://api.deepseek.com/v1" />
          </label>

          <label class="input-group">
            <span>MODEL_NAME</span>
            <el-input v-model="form.model" size="large" placeholder="例如：deepseek-chat" />
          </label>

          <label class="input-group">
            <span>MODEL_PROVIDER</span>
            <div class="tag-picker-group">
              <button
                v-for="option in providerOptions"
                :key="option.value"
                type="button"
                :class="['picker-tag', { active: form.provider === option.value }]"
                @click="form.provider = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </label>

          <label class="input-group">
            <span>MODEL_API_KEY</span>
            <el-input
              v-model="form.apiKey"
              size="large"
              type="password"
              show-password
              :placeholder="editingModelId ? '留空则保留该模型当前 API Key' : '输入新的 API Key'"
            />
          </label>

          <div class="settings-actions">
            <el-button class="primary-btn ui-btn" type="primary" size="large" :loading="saving" @click="saveConfig">
              {{ editingModelId ? '保存修改' : '添加模型' }}
            </el-button>
            <el-button class="ghost-btn ui-btn" plain size="large" @click="startCreate">
              清空表单
            </el-button>
            <el-button class="ghost-btn ui-btn" plain size="large" :loading="resetting" @click="resetToEnv">
              恢复 env 默认值
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="plain-section">
        <div class="empty-state simple-empty-state">正在加载模型配置...</div>
      </div>
    </section>
  </div>
</template>
