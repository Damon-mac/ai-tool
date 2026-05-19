<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppTopbar from '../components/AppTopbar.vue';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';

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
const loading = ref(false);
const errorMessage = ref('');
const stockSearchResults = ref<StockLookupResult[]>([]);
const latestAnalysis = ref<AnalyzeResult | null>(null);
const latestCompare = ref<CompareResult | null>(null);

const stockState = reactive({
  keyword: '',
  selectedSymbols: [] as string[],
});

async function initialize() {
  if (!authStore.token) {
    await router.push('/auth');
    return;
  }
  await authStore.fetchProfile();
}

async function searchStocks() {
  const token = authStore.token;
  if (!token || !stockState.keyword.trim()) {
    return;
  }
  loading.value = true;
  errorMessage.value = '';
  try {
    const encoded = encodeURIComponent(stockState.keyword.trim());
    stockSearchResults.value = await apiFetch<StockLookupResult[]>(`/stocks/search?keyword=${encoded}`, {}, token);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '搜索失败';
  } finally {
    loading.value = false;
  }
}

async function analyzeStock(symbol: string, displayName?: string) {
  const token = authStore.token;
  if (!token) {
    return;
  }
  loading.value = true;
  errorMessage.value = '';
  try {
    latestAnalysis.value = await apiFetch<AnalyzeResult>('/stocks/analyze', {
      method: 'POST',
      body: JSON.stringify({ symbol, displayName }),
    }, token);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '分析失败';
  } finally {
    loading.value = false;
  }
}

async function compareStocks() {
  const token = authStore.token;
  if (!token || stockState.selectedSymbols.length < 2) {
    return;
  }
  loading.value = true;
  errorMessage.value = '';
  try {
    latestCompare.value = await apiFetch<CompareResult>('/stocks/compare', {
      method: 'POST',
      body: JSON.stringify({ symbols: stockState.selectedSymbols }),
    }, token);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '对比失败';
  } finally {
    loading.value = false;
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

onMounted(() => {
  initialize();
});
</script>

<template>
  <div class="dashboard-shell tool-page-shell">
    <AppTopbar
      title="股票诊断"
      subtitle="搜索股票、做单股诊断，并对 2-3 只股票生成仓位配置建议。"
      back-to="/"
      compact
    />

    <section class="page-stack plain-page-stack">
      <div class="plain-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Stock Lab</p>
            <h2>先搜索，再诊断</h2>
            <p class="helper-text">用户输入在上，诊断结论和仓位建议统一在下方展示。</p>
          </div>
        </div>

        <div class="form-stack">
          <label class="input-group">
            <span>股票代码或名称</span>
            <div class="search-row">
              <el-input v-model="stockState.keyword" size="large" placeholder="例如：600519 或 贵州茅台" @keyup.enter="searchStocks" />
              <el-button class="primary-btn ui-btn" type="primary" size="large" :loading="loading" @click="searchStocks">搜索</el-button>
            </div>
          </label>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

          <div v-if="stockSearchResults.length" class="search-result-list plain-result-list">
            <article v-for="item in stockSearchResults" :key="item.symbol" class="result-row">
              <div class="result-row-top">
                <div>
                  <strong>{{ item.shortName }}</strong>
                  <small>{{ item.symbol }} · {{ item.market }}</small>
                </div>
                <div class="card-actions">
                  <el-button class="ghost-btn ui-btn" plain @click="analyzeStock(item.symbol, item.shortName)">诊断</el-button>
                  <el-button class="ghost-btn ui-btn" plain @click="toggleCompare(item.symbol)">
                    {{ stockState.selectedSymbols.includes(item.symbol) ? '已选中' : '加入对比' }}
                  </el-button>
                </div>
              </div>
            </article>
          </div>

          <div v-if="stockState.selectedSymbols.length" class="compare-strip inline-strip">
            <span>对比池：{{ stockState.selectedSymbols.join(' / ') }}</span>
            <el-button class="primary-btn ui-btn" type="primary" size="large" :disabled="stockState.selectedSymbols.length < 2 || loading" @click="compareStocks">
              生成仓位建议
            </el-button>
          </div>
          <p class="helper-text">说明：本页面结论为 AI 辅助分析，不构成投资建议，请结合公开信息独立判断。</p>
        </div>
      </div>

      <div class="plain-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Analysis</p>
            <h2>最新诊断结果</h2>
          </div>
        </div>

        <div v-if="latestAnalysis" class="analysis-stack plain-analysis-stack">
          <div class="analysis-headline">
            <div>
              <h3>{{ latestAnalysis.trackedStock.name }}</h3>
              <small>{{ latestAnalysis.trackedStock.code }} · {{ latestAnalysis.trackedStock.market }}</small>
            </div>
            <div class="signal-badges">
              <el-tag class="tag-chip ui-tag" effect="dark" round>{{ latestAnalysis.analysis.recommendation }}</el-tag>
              <el-tag class="tag-chip ui-tag warning" effect="dark" round>{{ latestAnalysis.analysis.riskLevel }}</el-tag>
            </div>
          </div>
          <p class="result-row-content">{{ latestAnalysis.analysis.summary }}</p>
          <div class="metric-grid">
            <article class="metric-card soft-block">
              <span>趋势判断</span>
              <p>{{ latestAnalysis.analysis.trend }}</p>
            </article>
            <article class="metric-card soft-block">
              <span>估值判断</span>
              <p>{{ latestAnalysis.analysis.valuation }}</p>
            </article>
            <article class="metric-card soft-block">
              <span>市场情绪</span>
              <p>{{ latestAnalysis.analysis.sentiment }}</p>
            </article>
            <article class="metric-card soft-block">
              <span>仓位建议</span>
              <p>{{ latestAnalysis.analysis.positionSuggestion }}</p>
            </article>
          </div>
          <div class="prediction-grid">
            <article class="prediction-card soft-block">
              <span>未来一周</span>
              <strong>{{ latestAnalysis.analysis.weekPrediction.low }} - {{ latestAnalysis.analysis.weekPrediction.high }}</strong>
            </article>
            <article class="prediction-card soft-block">
              <span>未来一月</span>
              <strong>{{ latestAnalysis.analysis.monthPrediction.low }} - {{ latestAnalysis.analysis.monthPrediction.high }}</strong>
            </article>
            <article class="prediction-card soft-block">
              <span>未来一年</span>
              <strong>{{ latestAnalysis.analysis.yearPrediction.low }} - {{ latestAnalysis.analysis.yearPrediction.high }}</strong>
            </article>
          </div>
          <ul class="reason-list">
            <li v-for="(reason, idx) in latestAnalysis.analysis.reasons" :key="idx">{{ reason }}</li>
          </ul>
        </div>
        <div v-else class="empty-state simple-empty-state">搜索并分析股票后，这里会显示趋势、估值、预测和建议。</div>
      </div>

      <div class="plain-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Compare</p>
            <h2>仓位配置建议</h2>
          </div>
        </div>

        <div v-if="latestCompare" class="analysis-stack plain-analysis-stack compact-stack">
          <p class="result-row-content">{{ latestCompare.overview }}</p>
          <article v-for="item in latestCompare.allocations" :key="item.symbol" class="result-row soft-block">
            <div class="result-row-top">
              <strong>{{ item.name }} · {{ item.symbol }}</strong>
              <span class="compare-ratio">建议仓位：{{ Math.round(item.ratio * 100) }}%</span>
            </div>
            <p class="result-row-content compact-copy">{{ item.reason }}</p>
          </article>
          <p class="helper-text">{{ latestCompare.conclusion }}</p>
        </div>
        <div v-else class="empty-state simple-empty-state compact">加入 2-3 只股票到对比池后，即可生成配置比例建议。</div>
      </div>
    </section>
  </div>
</template>
