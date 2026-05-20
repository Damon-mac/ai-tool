import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { apiFetch } from '../lib/api';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role?: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'ai-lab-token';
const USER_KEY = 'ai-lab-user';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const user = ref<AuthUser | null>(JSON.parse(localStorage.getItem(USER_KEY) || 'null'));
  const loading = ref(false);
  const isLoggedIn = computed(() => Boolean(token.value));
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setAuth(payload: AuthResponse) {
    token.value = payload.token;
    user.value = payload.user;
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const payload = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuth(payload);
    } finally {
      loading.value = false;
    }
  }

  async function register(email: string, password: string, name: string) {
    loading.value = true;
    try {
      const payload = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      setAuth(payload);
    } finally {
      loading.value = false;
    }
  }

  async function fetchProfile() {
    if (!token.value) {
      return;
    }
    loading.value = true;
    try {
      const profile = await apiFetch<AuthUser>('/auth/me', {}, token.value);
      user.value = profile;
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    } catch {
      logout();
    } finally {
      loading.value = false;
    }
  }

  return {
    token,
    user,
    loading,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    fetchProfile,
  };
});
