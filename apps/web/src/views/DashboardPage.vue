<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { apiFetch } from '../lib/api';

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

interface StockLookupResult {
  symbol: string;
  shortName: string;
  market?: string;
}

interface TrackedStockRecord {
  id: string;
  code: string;
  name: string;
  market: string;
  latestPrice?: number;
  lastAnalyzedAt?: string;
  analyses: Array<{
    id: string;
    summary: string;
    recommendation: string;
    riskLevel: string;
    createdAt: string;
  }>;
}

interface AnalyzeResult {
  trackedStock: TrackedStockRecord;
  analysis: {
    id: string;
    summary: string;
    trend: string;
    valuation: string;
    sentiment: string;
    riskLevel: string;
    recommendation: string;
    reasons: string[];
    weekPrediction: { low: number; high: number; confidence: number };
    monthPrediction: { low: number; high: number; confidence: number };
    yearPrediction: { low: number; high: number; confidence: number };
    positionSuggestion: string;
    createdAt: string;
  };
}

interface CompareResult {
  id: string;
  overview: string;
  allocations: Array<{ symbol: string; name: string; ratio: number; reason: string }>;
  conclusion: string;
}

const router = useRouter();
const authStore = useAuthStore();
const token = authStore.token;
const activeTab = ref<'copywriting' | 'stocks'>('copywriting');
const loadingCopy = ref(false);
const loadingStocks = ref(false);
const copyError = ref('');
const stockError = ref('');
const copyHistory = ref<CopyHistoryRecord[]>([]);
const favorites = ref<FavoriteRecord[]>([]);
const trackedStocks = ref<TrackedStockRecord[]>([]);
const stockSearchResults = ref<StockLookupResult[]>([]);
const latestAnalysis = ref<AnalyzeResult | null>(null);
const latestCompare = ref<CompareResult | null>(null);

const copyForm = reactive({
  topic: '',
  platform: 'xiaohongshu',
  contentType: 'video',
});
const copyResult = ref<{ historyId: string; items: CopywritingItem[] } | null>(null);

const stockState = reactive({
  keyword: '',
  selectedSymbols: [] as string[],
});

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
  await Promise.all([loadCopyCollections(), loadTrackedStocks()]);
}

async function loadCopyCollections() {
  if (!token) return;
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

async function loadTrackedStocks() {
  if (!token) return;
  trackedStocks.value = await apiFetch<TrackedStockRecord[]>('/stocks/tracked', {}, token);
}

async function generateCopywriting() {
  if (!token) return;
  loadingCopy.value = true;
  copyError.value = '';
  try {
    copyResult.value = await apiFetch('/copywriting/generate', {
      method: 'POST',
      body: JSON.stringify(copyForm),
    }, token);
    await loadCopyCollections();
  } catch (error) {
    copyError.value = error instanceof Error ? error.message : '生成失败';
  } finally {
    loadingCopy.value = false;
  }
}

async function favoriteItem(item: CopywritingItem, index: number) {
  if (!token || !copyResult.value) return;
  await apiFetch('/copywriting/favorites', {
    method: 'POST',
    body: JSON.stringify({
      historyId: copyResult.value.historyId,
      itemIndex: index,
      content: item.content,
      styleTag: item.styleTag,
    }),
  }, token);
  await loadCopyCollections();
}

async function removeFavorite(id: string) {
  if (!token) return;
  await apiFetch(`/copywriting/favorites/${id}`, { method: 'DELETE' }, token);
  await loadCopyCollections();
}

async function searchStocks() {
  if (!token || !stockState.keyword.trim()) return;
  loadingStocks.value = true;
  stockError.value = '';
  try {
    const encoded = encodeURIComponent(stockState.keyword.trim());
    stockSearchResults.value = await apiFetch<StockLookupResult[]>(`/stocks/search?keyword=${encoded}`, {}, token);
  } catch (error) {
    stockError.value = error instanceof Error ? error.message : '搜索失败';
  } finally {
    loadingStocks.value = false;
  }
}

async function analyzeStock(symbol: string, displayName?: string) {
  if (!token) return;
  loadingStocks.value = true;
  stockError.value = '';
  try {
    latestAnalysis.value = await apiFetch<AnalyzeResult>('/stocks/analyze', {
      method: 'POST',
      body: JSON.stringify({ symbol, displayName }),
    }, token);
    await loadTrackedStocks();
  } catch (error) {
    stockError.value = error instanceof Error ? error.message : '分析失败';
  } finally {
    loadingStocks.value = false;
  }
}

async function compareStocks() {
  if (!token || stockState.selectedSymbols.length < 2) return;
  loadingStocks.value = true;
  stockError.value = '';
  try {
    latestCompare.value = await apiFetch<CompareResult>('/stocks/compare', {
      method: 'POST',
      body: JSON.stringify({ symbols: stockState.selectedSymbols }),
    }, token);
  } catch (error) {
    stockError.value = error instanceof Error ? error.message : '对比失败';
  } finally {
    loadingStocks.value = false;
  }
}

function toggleCompare(symbol: string) {
  if (stockState.selectedSymbols.includes(symbol)) {
    stockState.selectedSymbols = stockState.selectedSymbols.filter((item) => item !== symbol);
    return;
  }
  if (stockState.selectedSymbols.length >= 3) {
    return;
  }
  stockState.selectedSymbols = [...stockState.selectedSymbols, symbol];
}

async function deleteTracked(id: string) {
  if (!token) return;
  await apiFetch(`/stocks/tracked/${id}`, { method: 'DELETE' }, token);
  await loadTrackedStocks();
}

async function copyText(content: string) {
  await navigator.clipboard.writeText(content);
}

function logout() {
  authStore.logout();
  router.push('/auth');
}

onMounted(() => {
  initialize();
});
</script>

<template>
  <div class="dashboard-shell">
    <header class="topbar glass-card">
      <div>
        <p class="eyebrow">AI Lab</p>
        <h1>你的 AI 内容与投资实验室</h1>
      </div>
      <div class="topbar-actions">
        <div class="user-meta">
          <span>{{ authStore.user?.name || authStore.user?.email }}</span>
          <small>{{ authStore.user?.email }}</small>
        </div>
        <button class="ghost-btn" @click="logout">退出</button>
      </div>
    </header>

    <section class="summary-grid">
      <div class="summary-card glass-card">
        <span>文案历史</span>
        <strong>{{ copyHistory.length }}</strong>
        <small>累计生成记录</small>
      </div>
      <div class="summary-card glass-card">
        <span>已收藏文案</span>
        <strong>{{ favorites.length }}</strong>
        <small>随时复用</small>
      </div>
      <div class="summary-card glass-card">
        <span>跟踪股票</span>
        <strong>{{ trackedStocks.length }}</strong>
        <small>持续关注中</small>
      </div>
    </section>

    <section class="tab-bar glass-card">
      <button :class="['tab-btn', { active: activeTab === 'copywriting' }]" @click="activeTab = 'copywriting'">文案推荐</button>
      <button :class="['tab-btn', { active: activeTab === 'stocks' }]" @click="activeTab = 'stocks'">股票诊断</button>
    </section>

    <section v-if="activeTab === 'copywriting'" class="feature-grid">
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
            <input v-model="copyForm.topic" placeholder="例如：夏季防晒新品上市" />
          </label>

          <div class="inline-fields">
            <label class="input-group">
              <span>平台</span>
              <select v-model="copyForm.platform">
                <option value="xiaohongshu">小红书</option>
                <option value="douyin">抖音</option>
                <option value="moments">朋友圈</option>
              </select>
            </label>

            <label class="input-group">
              <span>内容类型</span>
              <select v-model="copyForm.contentType">
                <option value="video">视频</option>
                <option value="image_text">图文</option>
                <option value="product_ad">产品广告</option>
              </select>
            </label>
          </div>

          <p v-if="copyError" class="error-text">{{ copyError }}</p>
          <button class="primary-btn" :disabled="loadingCopy || !copyForm.topic.trim()" @click="generateCopywriting">
            {{ loadingCopy ? '生成中...' : '一键生成 10 条文案' }}
          </button>
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
              <span class="tag-chip">{{ item.styleTag }}</span>
              <span class="muted-index">#{{ index + 1 }}</span>
            </div>
            <p>{{ item.content }}</p>
            <div class="card-actions">
              <button class="ghost-btn" @click="copyText(item.content)">复制</button>
              <button class="ghost-btn" @click="favoriteItem(item, index)">收藏</button>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">
          输入主题、平台和内容类型后，右侧会展示 10 条不同风格结果。
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
              <span class="tag-chip">{{ item.styleTag }}</span>
              <button class="text-btn" @click="removeFavorite(item.id)">删除</button>
            </div>
            <p>{{ item.content }}</p>
          </article>
          <div v-if="!favorites.length" class="empty-state compact">你收藏的文案会显示在这里。</div>
        </div>
      </div>
    </section>

    <section v-else class="feature-grid stocks-grid">
      <div class="glass-card feature-panel form-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Stock Lab</p>
            <h2>股票诊断与仓位建议</h2>
          </div>
        </div>

        <div class="form-stack">
          <label class="input-group">
            <span>股票代码或名称</span>
            <div class="search-row">
              <input v-model="stockState.keyword" placeholder="例如：600519 或 贵州茅台" @keyup.enter="searchStocks" />
              <button class="primary-btn small" :disabled="loadingStocks" @click="searchStocks">搜索</button>
            </div>
          </label>
          <p v-if="stockError" class="error-text">{{ stockError }}</p>
          <div class="search-result-list">
            <article v-for="item in stockSearchResults" :key="item.symbol" class="search-result-card">
              <div>
                <strong>{{ item.shortName }}</strong>
                <small>{{ item.symbol }} · {{ item.market }}</small>
              </div>
              <div class="card-actions">
                <button class="ghost-btn" @click="analyzeStock(item.symbol, item.shortName)">诊断</button>
                <button class="ghost-btn" @click="toggleCompare(item.symbol)">
                  {{ stockState.selectedSymbols.includes(item.symbol) ? '已选中' : '加入对比' }}
                </button>
              </div>
            </article>
          </div>

          <div class="compare-strip" v-if="stockState.selectedSymbols.length">
            <span>对比池：{{ stockState.selectedSymbols.join(' / ') }}</span>
            <button class="primary-btn small" :disabled="stockState.selectedSymbols.length < 2 || loadingStocks" @click="compareStocks">
              生成仓位建议
            </button>
          </div>
          <p class="helper-text">说明：本页面结论为 AI 辅助分析，不构成投资建议，请结合公开信息独立判断。</p>
        </div>
      </div>

      <div class="glass-card feature-panel result-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Analysis</p>
            <h2>最新诊断结果</h2>
          </div>
        </div>

        <div v-if="latestAnalysis" class="analysis-stack">
          <div class="analysis-headline">
            <div>
              <h3>{{ latestAnalysis.trackedStock.name }}</h3>
              <small>{{ latestAnalysis.trackedStock.code }} · {{ latestAnalysis.trackedStock.market }}</small>
            </div>
            <div class="signal-badges">
              <span class="tag-chip">{{ latestAnalysis.analysis.recommendation }}</span>
              <span class="tag-chip warning">{{ latestAnalysis.analysis.riskLevel }}</span>
            </div>
          </div>
          <p>{{ latestAnalysis.analysis.summary }}</p>
          <div class="metric-grid">
            <article class="metric-card">
              <span>趋势判断</span>
              <p>{{ latestAnalysis.analysis.trend }}</p>
            </article>
            <article class="metric-card">
              <span>估值判断</span>
              <p>{{ latestAnalysis.analysis.valuation }}</p>
            </article>
            <article class="metric-card">
              <span>市场情绪</span>
              <p>{{ latestAnalysis.analysis.sentiment }}</p>
            </article>
            <article class="metric-card">
              <span>仓位建议</span>
              <p>{{ latestAnalysis.analysis.positionSuggestion }}</p>
            </article>
          </div>
          <div class="prediction-grid">
            <article class="prediction-card">
              <span>未来一周</span>
              <strong>{{ latestAnalysis.analysis.weekPrediction.low }} - {{ latestAnalysis.analysis.weekPrediction.high }}</strong>
            </article>
            <article class="prediction-card">
              <span>未来一月</span>
              <strong>{{ latestAnalysis.analysis.monthPrediction.low }} - {{ latestAnalysis.analysis.monthPrediction.high }}</strong>
            </article>
            <article class="prediction-card">
              <span>未来一年</span>
              <strong>{{ latestAnalysis.analysis.yearPrediction.low }} - {{ latestAnalysis.analysis.yearPrediction.high }}</strong>
            </article>
          </div>
          <ul class="reason-list">
            <li v-for="(reason, idx) in latestAnalysis.analysis.reasons" :key="idx">{{ reason }}</li>
          </ul>
        </div>
        <div v-else class="empty-state">搜索并分析股票后，这里会显示趋势、估值、预测和建议。</div>
      </div>

      <div class="glass-card feature-panel history-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Tracked</p>
            <h2>已跟踪股票</h2>
          </div>
        </div>

        <div class="mini-list">
          <article v-for="item in trackedStocks" :key="item.id" class="mini-card">
            <div class="result-card-header">
              <div>
                <strong>{{ item.name }}</strong>
                <small>{{ item.code }} · {{ item.market }}</small>
              </div>
              <button class="text-btn" @click="deleteTracked(item.id)">删除</button>
            </div>
            <p>最新价：{{ item.latestPrice?.toFixed(2) ?? '--' }}</p>
            <p>{{ item.analyses?.[0]?.summary || '暂无诊断摘要' }}</p>
          </article>
          <div v-if="!trackedStocks.length" class="empty-state compact">搜索并诊断过的股票会长期保留在这里。</div>
        </div>
      </div>

      <div class="glass-card feature-panel history-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Compare</p>
            <h2>仓位配置建议</h2>
          </div>
        </div>

        <div v-if="latestCompare" class="analysis-stack compact-stack">
          <p>{{ latestCompare.overview }}</p>
          <article v-for="item in latestCompare.allocations" :key="item.symbol" class="mini-card">
            <strong>{{ item.name }} · {{ item.symbol }}</strong>
            <p>建议仓位：{{ Math.round(item.ratio * 100) }}%</p>
            <small>{{ item.reason }}</small>
          </article>
          <p class="helper-text">{{ latestCompare.conclusion }}</p>
        </div>
        <div v-else class="empty-state compact">加入 2-3 只股票到对比池后，即可生成配置比例建议。</div>
      </div>
    </section>
  </div>
</template>
