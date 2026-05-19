<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import AppTopbar from '../components/AppTopbar.vue';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';

interface CopyHistoryRecord {
  id: string;
}

interface FavoriteRecord {
  id: string;
}

interface TrackedStockRecord {
  id: string;
}

interface FeatureCard {
  title: string;
  eyebrow: string;
  description: string;
  path: string;
  cta: string;
  points: string[];
}

const router = useRouter();
const authStore = useAuthStore();
const stats = reactive({
  copyHistory: 0,
  favorites: 0,
  trackedStocks: 0,
});

const featureCards: FeatureCard[] = [
  {
    title: '文案推荐',
    eyebrow: 'Copywriting Lab',
    description: '输入主题、平台和内容类型，一次生成 10 条不同风格的爆款开头，支持复制、收藏与历史回看。',
    path: '/copywriting',
    cta: '进入文案推荐',
    points: ['10 条不同风格结果', '支持收藏与历史', '适配小红书 / 抖音 / 朋友圈'],
  },
  {
    title: '股票诊断',
    eyebrow: 'Stock Lab',
    description: '搜索股票代码或名称，获得趋势、估值、情绪、预测区间与仓位建议，并持续跟踪分析。',
    path: '/stocks',
    cta: '进入股票诊断',
    points: ['单股诊断与跟踪', '2-3 只股票仓位对比', '后续可继续扩展更多功能卡片'],
  },
  {
    title: '模型配置',
    eyebrow: 'Model Config',
    description: '统一管理当前生效的大模型地址、API Key、模型名称和 Provider，避免混用多份 env。',
    path: '/model-config',
    cta: '进入模型配置',
    points: ['页面配置优先于 env', '支持恢复 env 默认值', '适合切换 DeepSeek / Anthropic / OpenAI 兼容模型'],
  },
];

async function initialize() {
  if (!authStore.token) {
    await router.push('/auth');
    return;
  }
  await authStore.fetchProfile();
  await loadSummary();
}

async function loadSummary() {
  const token = authStore.token;
  if (!token) {
    return;
  }
  const [history, favorites, tracked] = await Promise.all([
    apiFetch<CopyHistoryRecord[]>('/copywriting/history', {}, token),
    apiFetch<FavoriteRecord[]>('/copywriting/favorites', {}, token),
    apiFetch<TrackedStockRecord[]>('/stocks/tracked', {}, token),
  ]);
  stats.copyHistory = history.length;
  stats.favorites = favorites.length;
  stats.trackedStocks = tracked.length;
}

function openFeature(path: string) {
  router.push(path);
}

onMounted(() => {
  initialize();
});
</script>

<template>
  <div class="dashboard-shell">
    <AppTopbar
      title="你的 AI 工具入口页"
      subtitle="首页只放功能卡片，点击卡片进入独立功能页。后续新增能力时，继续在这里增加卡片即可。"
    />

    <section class="summary-grid">
      <div class="summary-card glass-card">
        <span>文案历史</span>
        <strong>{{ stats.copyHistory }}</strong>
        <small>累计生成记录</small>
      </div>
      <div class="summary-card glass-card">
        <span>已收藏文案</span>
        <strong>{{ stats.favorites }}</strong>
        <small>沉淀可复用素材</small>
      </div>
      <div class="summary-card glass-card">
        <span>跟踪股票</span>
        <strong>{{ stats.trackedStocks }}</strong>
        <small>持续跟踪与观察</small>
      </div>
    </section>

    <section class="feature-card-grid">
      <article
        v-for="card in featureCards"
        :key="card.path"
        class="entry-card glass-card"
        @click="openFeature(card.path)"
      >
        <div>
          <p class="eyebrow">{{ card.eyebrow }}</p>
          <h2>{{ card.title }}</h2>
          <p class="hero-copy">{{ card.description }}</p>
        </div>

        <ul class="entry-card-list">
          <li v-for="point in card.points" :key="point">{{ point }}</li>
        </ul>

        <div class="entry-card-foot">
          <button class="primary-btn" @click.stop="openFeature(card.path)">{{ card.cta }}</button>
          <span class="helper-text">点击卡片进入新页面</span>
        </div>
      </article>
    </section>
  </div>
</template>
