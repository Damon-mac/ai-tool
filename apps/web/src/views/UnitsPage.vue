<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppTopbar from '../components/AppTopbar.vue';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';

interface UnitItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  route: string;
  enabled: boolean;
  sortOrder: number;
  points: string[];
  cta: string | null;
  eyebrow: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { userUnits: number };
}

interface AccessUser {
  id: string;
  email: string;
  name: string | null;
  grantedAt: string;
}

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const saving = ref(false);
const deletingId = ref('');
const togglingId = ref('');
const errorMessage = ref('');
const units = ref<UnitItem[]>([]);
const editingId = ref<string | null>(null);
const managingAccessId = ref<string | null>(null);
const accessUsers = ref<AccessUser[]>([]);
const accessLoading = ref(false);
const accessGrantEmail = ref('');

const form = reactive({
  name: '',
  slug: '',
  description: '',
  icon: '',
  route: '',
  eyebrow: '',
  cta: '',
  pointsText: '',
  enabled: true,
  sortOrder: 0,
});

function resetForm() {
  form.name = '';
  form.slug = '';
  form.description = '';
  form.icon = '';
  form.route = '/';
  form.eyebrow = '';
  form.cta = '';
  form.pointsText = '';
  form.enabled = true;
  form.sortOrder = units.value.length;
  editingId.value = null;
}

function startEdit(item: UnitItem) {
  editingId.value = item.id;
  form.name = item.name;
  form.slug = item.slug;
  form.description = item.description || '';
  form.icon = item.icon || '';
  form.route = item.route;
  form.eyebrow = item.eyebrow || '';
  form.cta = item.cta || '';
  form.pointsText = item.points.join('\n');
  form.enabled = item.enabled;
  form.sortOrder = item.sortOrder;
}

async function initialize() {
  if (!authStore.token) {
    await router.push('/auth');
    return;
  }
  await authStore.fetchProfile();
  if (!authStore.isAdmin) {
    await router.push('/');
    return;
  }
  await loadUnits();
}

async function loadUnits() {
  const token = authStore.token;
  if (!token) return;

  loading.value = true;
  errorMessage.value = '';
  try {
    units.value = await apiFetch<UnitItem[]>('/units', {}, token);
    if (!editingId.value) {
      form.sortOrder = units.value.length;
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

async function saveUnit() {
  const token = authStore.token;
  if (!token) return;

  saving.value = true;
  errorMessage.value = '';

  const points = form.pointsText
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const body = {
    name: form.name,
    slug: form.slug,
    description: form.description || undefined,
    icon: form.icon || undefined,
    route: form.route,
    eyebrow: form.eyebrow || undefined,
    cta: form.cta || undefined,
    points,
    enabled: form.enabled,
    sortOrder: form.sortOrder,
  };

  const isEditing = Boolean(editingId.value);

  try {
    if (editingId.value) {
      await apiFetch(`/units/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }, token);
    } else {
      await apiFetch('/units', {
        method: 'POST',
        body: JSON.stringify(body),
      }, token);
    }
    ElMessage.success(isEditing ? '单元已更新' : '单元已创建');
    resetForm();
    await loadUnits();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存失败';
  } finally {
    saving.value = false;
  }
}

async function toggleUnit(id: string) {
  const token = authStore.token;
  if (!token) return;

  togglingId.value = id;
  try {
    await apiFetch(`/units/${id}/toggle`, { method: 'PATCH' }, token);
    await loadUnits();
    ElMessage.success('状态已切换');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '切换失败';
  } finally {
    togglingId.value = '';
  }
}

async function deleteUnit(id: string) {
  const token = authStore.token;
  if (!token) return;

  if (!window.confirm('删除后该功能单元将从首页移除，确定继续吗？')) {
    return;
  }

  deletingId.value = id;
  errorMessage.value = '';

  try {
    await apiFetch(`/units/${id}`, { method: 'DELETE' }, token);
    if (editingId.value === id) {
      resetForm();
    }
    ElMessage.success('单元已删除');
    await loadUnits();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '删除失败';
  } finally {
    deletingId.value = '';
  }
}

async function loadAccessUsers(unitId: string) {
  const token = authStore.token;
  if (!token) return;

  managingAccessId.value = unitId;
  accessLoading.value = true;
  accessGrantEmail.value = '';
  try {
    accessUsers.value = await apiFetch<AccessUser[]>(`/units/${unitId}/access`, {}, token);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载权限列表失败';
  } finally {
    accessLoading.value = false;
  }
}

async function grantAccess() {
  const token = authStore.token;
  if (!token || !managingAccessId.value || !accessGrantEmail.value.trim()) return;

  try {
    await apiFetch(`/units/${managingAccessId.value}/access`, {
      method: 'POST',
      body: JSON.stringify({ userId: accessGrantEmail.value.trim() }),
    }, token);
    ElMessage.success('权限已授予');
    accessGrantEmail.value = '';
    await loadAccessUsers(managingAccessId.value);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '授予权限失败';
  }
}

async function revokeAccess(userId: string) {
  const token = authStore.token;
  if (!token || !managingAccessId.value) return;

  try {
    await apiFetch(`/units/${managingAccessId.value}/access/${userId}`, {
      method: 'DELETE',
    }, token);
    ElMessage.success('权限已撤销');
    await loadAccessUsers(managingAccessId.value);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '撤销权限失败';
  }
}

function closeAccessDialog() {
  managingAccessId.value = null;
  accessUsers.value = [];
  accessGrantEmail.value = '';
}

onMounted(() => {
  initialize();
});
</script>

<template>
  <div class="dashboard-shell tool-page-shell">
    <AppTopbar
      title="功能单元管理"
      subtitle="管理首页展示的功能模块：创建、编辑、启用/禁用、排序和访问权限控制。"
      back-to="/"
      compact
    />

    <section class="page-stack plain-page-stack">
      <div class="plain-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Unit List</p>
            <h2>所有功能单元</h2>
            <p class="helper-text">启用的单元会显示在首页，禁用的则隐藏。点击单元行可编辑。</p>
          </div>
        </div>

        <p v-if="errorMessage" class="error-text settings-error">{{ errorMessage }}</p>

        <div v-if="loading" class="empty-state simple-empty-state">正在加载...</div>

        <div v-else-if="units.length" class="plain-result-list">
          <article
            v-for="item in units"
            :key="item.id"
            :class="['result-row', 'unit-row', { 'unit-disabled': !item.enabled }]"
          >
            <div class="result-row-top unit-row-top" @click="startEdit(item)">
              <div class="result-row-meta model-row-meta">
                <span class="tag-chip">{{ item.slug }}</span>
                <span v-if="item.enabled" class="tag-chip">已启用</span>
                <span v-else class="tag-chip warning">已禁用</span>
                <span v-if="item._count.userUnits > 0" class="tag-chip">
                  {{ item._count.userUnits }} 人有权限
                </span>
                <strong>{{ item.name }}</strong>
              </div>
              <div class="settings-actions">
                <button
                  class="ghost-btn"
                  :disabled="togglingId === item.id"
                  @click.stop="toggleUnit(item.id)"
                >
                  {{ item.enabled ? '禁用' : '启用' }}
                </button>
                <button class="ghost-btn" @click.stop="loadAccessUsers(item.id)">权限</button>
                <button class="ghost-btn danger-btn" :disabled="deletingId === item.id" @click.stop="deleteUnit(item.id)">
                  {{ deletingId === item.id ? '删除中...' : '删除' }}
                </button>
              </div>
            </div>
            <p class="result-row-content">{{ item.description || '暂无描述' }}</p>
            <div class="result-row-meta compact-copy">
              <small>路由：{{ item.route }}</small>
              <small>排序：{{ item.sortOrder }}</small>
              <small>更新时间：{{ new Date(item.updatedAt).toLocaleString() }}</small>
            </div>
          </article>
        </div>
        <div v-else class="empty-state simple-empty-state">还没有任何功能单元，下面新建第一个即可。</div>
      </div>

      <div class="plain-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Manage</p>
            <h2>{{ editingId ? '编辑单元' : '新建单元' }}</h2>
          </div>
        </div>

        <div class="form-stack settings-form">
          <div class="inline-fields">
            <label class="input-group">
              <span>名称</span>
              <input v-model="form.name" placeholder="例如：文案推荐" />
            </label>
            <label class="input-group">
              <span>Slug（唯一标识）</span>
              <input v-model="form.slug" placeholder="例如：copywriting" />
            </label>
          </div>

          <label class="input-group">
            <span>描述</span>
            <input v-model="form.description" placeholder="功能描述" />
          </label>

          <div class="inline-fields">
            <label class="input-group">
              <span>路由路径</span>
              <input v-model="form.route" placeholder="例如：/copywriting" />
            </label>
            <label class="input-group">
              <span>排序权重</span>
              <input v-model.number="form.sortOrder" type="number" />
            </label>
          </div>

          <div class="inline-fields">
            <label class="input-group">
              <span>标签文案（eyebrow）</span>
              <input v-model="form.eyebrow" placeholder="例如：Copywriting Lab" />
            </label>
            <label class="input-group">
              <span>按钮文案（CTA）</span>
              <input v-model="form.cta" placeholder="例如：进入文案推荐" />
            </label>
          </div>

          <label class="input-group">
            <span>功能要点（每行一条）</span>
            <textarea
              v-model="form.pointsText"
              rows="3"
              placeholder="10 条不同风格结果&#10;支持收藏与历史&#10;适配小红书 / 抖音 / 朋友圈"
              class="unit-textarea"
            />
          </label>

          <label class="input-group unit-checkbox-row">
            <input v-model="form.enabled" type="checkbox" class="unit-checkbox" />
            <span>启用（显示在首页）</span>
          </label>

          <div class="settings-actions">
            <button class="primary-btn" :disabled="saving || !form.name || !form.slug || !form.route" @click="saveUnit">
              {{ saving ? '保存中...' : editingId ? '保存修改' : '创建单元' }}
            </button>
            <button class="ghost-btn" @click="resetForm">清空表单</button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="managingAccessId" class="unit-access-overlay" @click.self="closeAccessDialog">
      <div class="unit-access-dialog glass-card">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Access Control</p>
            <h2>访问权限管理</h2>
            <p class="helper-text">
              为该单元配置用户访问权限。输入用户 ID 授予权限。
              如果未配置任何用户，则所有已认证用户均可访问。
            </p>
          </div>
          <button class="ghost-btn" @click="closeAccessDialog">关闭</button>
        </div>

        <div class="access-grant-row">
          <input v-model="accessGrantEmail" placeholder="输入用户 ID" class="access-input" />
          <button class="primary-btn small" :disabled="!accessGrantEmail.trim()" @click="grantAccess">授予权限</button>
        </div>

        <div v-if="accessLoading" class="empty-state simple-empty-state">正在加载...</div>
        <div v-else-if="accessUsers.length" class="plain-result-list">
          <article v-for="user in accessUsers" :key="user.id" class="result-row dialog-item">
            <div class="result-row-top">
              <div class="result-row-meta">
                <strong>{{ user.name || user.email }}</strong>
                <small>{{ user.email }}</small>
              </div>
              <button class="ghost-btn danger-btn" @click="revokeAccess(user.id)">撤销</button>
            </div>
            <small class="result-row-content">授予时间：{{ new Date(user.grantedAt).toLocaleString() }}</small>
          </article>
        </div>
        <div v-else class="empty-state simple-empty-state">该单元当前所有用户均可访问（未配置限制）。</div>
      </div>
    </div>
  </div>
</template>
