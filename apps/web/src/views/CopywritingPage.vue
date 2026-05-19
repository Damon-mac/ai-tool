<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppTopbar from '../components/AppTopbar.vue';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';

interface CopywritingItem {
  content: string;
  styleTag: string;
}

interface FavoriteRecord {
  id: string;
  content: string;
  styleTag: string;
  createdAt: string;
}

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const errorMessage = ref('');
const favorites = ref<FavoriteRecord[]>([]);
const copyResult = ref<{ historyId: string; items: CopywritingItem[] } | null>(null);
const favoritesVisible = ref(false);

const copyForm = reactive({
  topic: '',
  platform: 'xiaohongshu',
  contentType: 'video',
});

const platformOptions = [
  { label: '小红书', value: 'xiaohongshu' },
  { label: '抖音', value: 'douyin' },
  { label: '朋友圈', value: 'moments' },
];

const contentTypeOptions = [
  { label: '视频', value: 'video' },
  { label: '图文', value: 'image_text' },
  { label: '产品广告', value: 'product_ad' },
];

async function initialize() {
  if (!authStore.token) {
    await router.push('/auth');
    return;
  }
  await authStore.fetchProfile();
  await loadFavorites();
}

async function loadFavorites() {
  const token = authStore.token;
  if (!token) {
    return;
  }
  favorites.value = await apiFetch<FavoriteRecord[]>('/copywriting/favorites', {}, token);
}

async function generateCopywriting() {
  const token = authStore.token;
  if (!token) {
    return;
  }
  loading.value = true;
  errorMessage.value = '';
  try {
    copyResult.value = await apiFetch('/copywriting/generate', {
      method: 'POST',
      body: JSON.stringify(copyForm),
    }, token);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '生成失败';
  } finally {
    loading.value = false;
  }
}

async function favoriteItem(item: CopywritingItem, index: number) {
  const token = authStore.token;
  if (!token || !copyResult.value) {
    return;
  }
  await apiFetch('/copywriting/favorites', {
    method: 'POST',
    body: JSON.stringify({
      historyId: copyResult.value.historyId,
      itemIndex: index,
      content: item.content,
      styleTag: item.styleTag,
    }),
  }, token);
  await loadFavorites();
  favoritesVisible.value = true;
}

async function removeFavorite(id: string) {
  const token = authStore.token;
  if (!token) {
    return;
  }
  await apiFetch(`/copywriting/favorites/${id}`, { method: 'DELETE' }, token);
  await loadFavorites();
}

async function copyText(content: string) {
  await navigator.clipboard.writeText(content);
}

onMounted(() => {
  initialize();
});
</script>

<template>
  <div class="dashboard-shell tool-page-shell">
    <AppTopbar
      title="文案推荐"
      subtitle="专注做一个功能：围绕你的主题，生成 10 条可直接使用的中文爆款开头。"
      back-to="/"
      compact
    />

    <section class="page-stack plain-page-stack">
      <div class="plain-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Copywriting Lab</p>
            <h2>先输入，再一键生成</h2>
            <p class="helper-text">围绕你的主题生成 10 条不同风格文案，结果直接展示在下方。</p>
          </div>
          <el-button class="ghost-btn ui-btn" plain @click="favoritesVisible = true">
            收藏夹（{{ favorites.length }}）
          </el-button>
        </div>

        <div class="form-stack">
          <label class="input-group">
            <span>主题</span>
            <el-input v-model="copyForm.topic" size="large" placeholder="例如：夏季防晒新品上市" />
          </label>

          <div class="inline-fields">
            <label class="input-group">
              <span>平台</span>
              <div class="tag-picker-group">
                <button
                  v-for="option in platformOptions"
                  :key="option.value"
                  type="button"
                  :class="['picker-tag', { active: copyForm.platform === option.value }]"
                  @click="copyForm.platform = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </label>

            <label class="input-group">
              <span>内容类型</span>
              <div class="tag-picker-group">
                <button
                  v-for="option in contentTypeOptions"
                  :key="option.value"
                  type="button"
                  :class="['picker-tag', { active: copyForm.contentType === option.value }]"
                  @click="copyForm.contentType = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </label>
          </div>

          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
          <div class="section-actions">
            <el-button class="primary-btn ui-btn" type="primary" size="large" :loading="loading" :disabled="!copyForm.topic.trim()" @click="generateCopywriting">
              {{ loading ? '生成中...' : '一键生成 10 条文案' }}
            </el-button>
          </div>
        </div>
      </div>

      <div class="plain-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Results</p>
            <h2>生成结果</h2>
          </div>
        </div>

        <div v-if="copyResult?.items?.length" class="plain-result-list">
          <article v-for="(item, index) in copyResult.items" :key="`${item.styleTag}-${index}`" class="result-row">
            <div class="result-row-top">
              <div class="result-row-meta">
                <el-tag class="tag-chip ui-tag" effect="dark" round>{{ item.styleTag }}</el-tag>
                <span class="muted-index">#{{ index + 1 }}</span>
              </div>
              <div class="card-actions">
                <el-button class="ghost-btn ui-btn" plain @click="copyText(item.content)">复制</el-button>
                <el-button class="ghost-btn ui-btn" plain @click="favoriteItem(item, index)">收藏</el-button>
              </div>
            </div>
            <p class="result-row-content">{{ item.content }}</p>
          </article>
        </div>
        <div v-else class="empty-state simple-empty-state">
          输入主题、平台和内容类型后，这里会展示 10 条不同风格结果。
        </div>
      </div>
    </section>

    <el-dialog v-model="favoritesVisible" title="收藏夹" width="720px" class="favorites-dialog">
      <div v-if="favorites.length" class="dialog-list">
        <article v-for="item in favorites" :key="item.id" class="dialog-item">
          <div class="result-row-top">
            <el-tag class="tag-chip ui-tag" effect="dark" round>{{ item.styleTag }}</el-tag>
            <el-button class="text-btn ui-text-btn" text @click="removeFavorite(item.id)">删除</el-button>
          </div>
          <p class="result-row-content">{{ item.content }}</p>
        </article>
      </div>
      <div v-else class="empty-state simple-empty-state compact">你收藏的文案会显示在这里。</div>
    </el-dialog>
  </div>
</template>
