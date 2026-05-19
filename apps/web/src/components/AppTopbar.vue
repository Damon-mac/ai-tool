<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    eyebrow?: string;
    backTo?: string;
    backLabel?: string;
    compact?: boolean;
  }>(),
  {
    subtitle: '',
    eyebrow: 'AI Lab',
    backTo: '',
    backLabel: '返回首页',
    compact: false,
  },
);

const router = useRouter();
const authStore = useAuthStore();

const displayName = computed(() => authStore.user?.name || authStore.user?.email || 'AI Lab User');
const email = computed(() => authStore.user?.email || '');

function goBack() {
  if (props.backTo) {
    router.push(props.backTo);
  }
}

function logout() {
  authStore.logout();
  router.push('/auth');
}
</script>

<template>
  <header :class="['topbar', 'glass-card', { 'topbar-compact': compact }]">
    <div class="topbar-copy">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="hero-copy topbar-subtitle">{{ subtitle }}</p>
    </div>

    <div class="topbar-actions">
      <div v-if="backTo" class="topbar-nav">
        <button class="ghost-btn" @click="goBack">{{ backLabel }}</button>
      </div>
      <div class="user-meta">
        <span>{{ displayName }}</span>
        <small>{{ email }}</small>
      </div>
      <button class="ghost-btn" @click="logout">退出</button>
    </div>
  </header>
</template>
