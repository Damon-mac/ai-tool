import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from './views/AuthPage.vue';
import CopywritingPage from './views/CopywritingPage.vue';
import HomePage from './views/HomePage.vue';
import ModelConfigPage from './views/ModelConfigPage.vue';
import StocksPage from './views/StocksPage.vue';
import UnitsPage from './views/UnitsPage.vue';
import { useAuthStore } from './stores/auth';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/auth', name: 'auth', component: AuthPage },
    { path: '/', name: 'home', component: HomePage },
    { path: '/copywriting', name: 'copywriting', component: CopywritingPage },
    { path: '/model-config', name: 'model-config', component: ModelConfigPage },
    { path: '/stocks', name: 'stocks', component: StocksPage },
    { path: '/units', name: 'units', component: UnitsPage },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.name !== 'auth' && !authStore.token) {
    return { name: 'auth' };
  }
  if (to.name === 'auth' && authStore.token) {
    return { name: 'home' };
  }
  return true;
});
