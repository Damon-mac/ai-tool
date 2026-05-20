<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppTopbar from '../components/AppTopbar.vue';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';
import type { UnitSummary } from '@ai-lab/shared';

interface CopyHistoryRecord {
  id: string;
}

interface FavoriteRecord {
  id: string;
}

interface TrackedStockRecord {
  id: string;
}

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const units = ref<UnitSummary[]>([]);
const stats = reactive({
  copyHistory: 0,
  favorites: 0,
  trackedStocks: 0,
});

async function initialize() {
  if (!authStore.token) {
    await router.push('/auth');
    return;
  }
  await authStore.fetchProfile();
  await Promise.all([loadUnits(), loadSummary()]);
}

async function loadUnits() {
  const token = authStore.token;
  if (!token) {
    return;
  }

  loading.value = true;
  try {
    units.value = await apiFetch<UnitSummary[]>('/units/enabled', {}, token);
  } catch {
    units.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadSummary() {
  const token = authStore.token;
  if (!token) {
    return;
  }
  try {
    const [history, favorites, tracked] = await Promise.all([
      apiFetch<CopyHistoryRecord[]>('/copywriting/history', {}, token),
      apiFetch<FavoriteRecord[]>('/copywriting/favorites', {}, token),
      apiFetch<TrackedStockRecord[]>('/stocks/tracked', {}, token),
    ]);
    stats.copyHistory = history.length;
    stats.favorites = favorites.length;
    stats.trackedStocks = tracked.length;
  } catch {
    // ignore summary errors
  }
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

    <section v-if="authStore.isAdmin" class="admin-actions">
      <button class="ghost-btn" @click="router.push('/units')">管理功能单元</button>
    </section>

    <section v-if="loading" class="feature-card-grid">
      <div class="empty-state">正在加载功能模块...</div>
    </section>

    <section v-else-if="units.length" class="feature-card-grid">
      <article
        v-for="unit in units"
        :key="unit.id"
        class="entry-card glass-card"
        @click="openFeature(unit.route)"
      >
        <div>
          <p class="eyebrow">{{ unit.eyebrow || unit.slug }}</p>
          <h2>{{ unit.name }}</h2>
          <p class="hero-copy">{{ unit.description }}</p>
        </div>

        <ul class="entry-card-list">
          <li v-for="point in unit.points" :key="point">{{ point }}</li>
        </ul>

        <div class="entry-card-foot">
          <button class="primary-btn" @click.stop="openFeature(unit.route)">
            {{ unit.cta || `进入${unit.name}` }}
          </button>
          <span class="helper-text">点击卡片进入新页面</span>
        </div>
      </article>
    </section>

    <section v-else class="feature-card-grid">
      <div class="empty-state">暂无可用的功能模块。</div>
    </section>
  </div>
</template>
