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

interface CopyHistoryRecord {
  id: string;
  topic: string;
  platform: string;
  contentType: string;
  results: CopywritingItem[];
  createdAt: string;
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
const copyHistory = ref<CopyHistoryRecord[]>([]);
const favorites = ref<FavoriteRecord[]>([]);
const copyResult = ref<{ historyId: string; items: CopywritingItem[] } | null>(null);

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

const platformLabels: Record<string, string> = {
  xiaohongshu: '小红书',
  douyin: '抖音',
  moments: '朋友圈',
};

const contentTypeLabels: Record<string, string> = {
  video: '视频',
  image_text: '图文',
  product_ad: '产品广告',
};

async function initialize() {
  if (!authStore.token) {
    await router.push('/auth');
    return;
  }
  await authStore.fetchProfile();
  await loadCollections();
}

async function loadCollections() {
  const token = authStore.token;
  if (!token) {
    return;
  }
  const [history, favs] = await Promise.all([
    apiFetch<CopyHistoryRecord[]>('/copywriting/history', {}, token),
    apiFetch<FavoriteRecord[]>('/copywriting/favorites', {}, token),
  ]);
  copyHistory.value = history.map((item) => ({
    ...item,
    results: Array.isArray(item.results) ? item.results : [],
  }));
  favorites.value = favs;
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
    await loadCollections();
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
  await loadCollections();
}

async function removeFavorite(id: string) {
  const token = authStore.token;
  if (!token) {
    return;
  }
  await apiFetch(`/copywriting/favorites/${id}`, { method: 'DELETE' }, token);
  await loadCollections();
}

async function copyText(content: string) {
  await navigator.clipboard.writeText(content);
}

onMounted(() => {
  initialize();
});
</script>

<template>
  <div class="dashboard-shell">
    <AppTopbar
      title="文案推荐"
      subtitle="专注做一个功能：围绕你的主题，生成 10 条可直接使用的中文爆款开头。"
      back-to="/"
    />

    <section class="summary-grid two-up-grid">
      <div class="summary-card glass-card">
        <span>文案历史</span>
        <strong>{{ copyHistory.length }}</strong>
        <small>累计生成记录</small>
      </div>
      <div class="summary-card glass-card">
        <span>收藏夹</span>
        <strong>{{ favorites.length }}</strong>
        <small>高价值文案沉淀</small>
      </div>
    </section>

    <section class="feature-grid">
      <div class="glass-card feature-panel form-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Copywriting Lab</p>
            <h2>生成 10 条不同风格爆款开头</h2>
          </div>
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
          <el-button class="primary-btn ui-btn" type="primary" size="large" :loading="loading" :disabled="!copyForm.topic.trim()" @click="generateCopywriting">
            {{ loading ? '生成中...' : '一键生成 10 条文案' }}
          </el-button>
        </div>
      </div>

      <div class="glass-card feature-panel result-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Results</p>
            <h2>本次生成结果</h2>
          </div>
        </div>

        <div v-if="copyResult?.items?.length" class="result-list">
          <article v-for="(item, index) in copyResult.items" :key="`${item.styleTag}-${index}`" class="result-card">
            <div class="result-card-header">
              <el-tag class="tag-chip ui-tag" effect="dark" round>{{ item.styleTag }}</el-tag>
              <span class="muted-index">#{{ index + 1 }}</span>
            </div>
            <p>{{ item.content }}</p>
            <div class="card-actions">
              <el-button class="ghost-btn ui-btn" plain @click="copyText(item.content)">复制</el-button>
              <el-button class="ghost-btn ui-btn" plain @click="favoriteItem(item, index)">收藏</el-button>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">
          输入主题、平台和内容类型后，这里会展示 10 条不同风格结果。
        </div>
      </div>

      <div class="glass-card feature-panel history-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">History</p>
            <h2>历史记录</h2>
          </div>
        </div>

        <div class="mini-list">
          <article v-for="item in copyHistory" :key="item.id" class="mini-card">
            <strong>{{ item.topic }}</strong>
            <small>{{ platformLabels[item.platform] }} · {{ contentTypeLabels[item.contentType] }}</small>
            <p>{{ item.results?.[0]?.content || '暂无内容' }}</p>
          </article>
          <div v-if="!copyHistory.length" class="empty-state compact">还没有生成历史。</div>
        </div>
      </div>

      <div class="glass-card feature-panel history-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Favorites</p>
            <h2>收藏夹</h2>
          </div>
        </div>

        <div class="mini-list">
          <article v-for="item in favorites" :key="item.id" class="mini-card">
            <div class="result-card-header">
              <el-tag class="tag-chip ui-tag" effect="dark" round>{{ item.styleTag }}</el-tag>
              <el-button class="text-btn ui-text-btn" text @click="removeFavorite(item.id)">删除</el-button>
            </div>
            <p>{{ item.content }}</p>
          </article>
          <div v-if="!favorites.length" class="empty-state compact">你收藏的文案会显示在这里。</div>
        </div>
      </div>
    </section>
  </div>
</template>
