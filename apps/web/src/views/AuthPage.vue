<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const mode = ref<'login' | 'register'>('login');
const form = reactive({
  name: '',
  email: '',
  password: '',
});
const errorMessage = ref('');

const title = computed(() => (mode.value === 'login' ? '欢迎回来' : '创建你的 AI Lab')); 

async function submit() {
  errorMessage.value = '';
  try {
    if (mode.value === 'login') {
      await authStore.login(form.email, form.password);
    } else {
      await authStore.register(form.email, form.password, form.name);
    }
    await router.push('/');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '操作失败';
  }
}
</script>

<template>
  <div class="auth-shell">
    <div class="auth-hero glass-card">
      <p class="eyebrow">AI Lab</p>
      <h1>高质感 AI 增长工具台</h1>
      <p class="hero-copy">
        一站式完成文案灵感生成、股票诊断、追踪与对比，让你的内容与投资研究效率同时升级。
      </p>
      <div class="hero-pills">
        <span>10 条爆款开头</span>
        <span>A 股诊断</span>
        <span>仓位建议</span>
      </div>
    </div>

    <div class="auth-card glass-card">
      <div class="auth-tabs">
        <button :class="['tab-btn', { active: mode === 'login' }]" @click="mode = 'login'">登录</button>
        <button :class="['tab-btn', { active: mode === 'register' }]" @click="mode = 'register'">注册</button>
      </div>

      <div class="form-header">
        <h2>{{ title }}</h2>
        <p>使用邮箱登录，开始你的 AI 工作流。</p>
      </div>

      <form class="form-stack" @submit.prevent="submit">
        <label v-if="mode === 'register'" class="input-group">
          <span>昵称</span>
          <input v-model="form.name" placeholder="比如：Zoe" />
        </label>

        <label class="input-group">
          <span>邮箱</span>
          <input v-model="form.email" type="email" placeholder="name@example.com" />
        </label>

        <label class="input-group">
          <span>密码</span>
          <input v-model="form.password" type="password" placeholder="至少 6 位" />
        </label>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <button class="primary-btn" type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? '处理中...' : mode === 'login' ? '登录 AI Lab' : '注册并进入' }}
        </button>
      </form>
    </div>
  </div>
</template>
