import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppTopbar from '../components/AppTopbar.vue';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const errorMessage = ref('');
const trackedStocks = ref([]);
const stockSearchResults = ref([]);
const latestAnalysis = ref(null);
const latestCompare = ref(null);
const stockState = reactive({
    keyword: '',
    selectedSymbols: [],
});
async function initialize() {
    if (!authStore.token) {
        await router.push('/auth');
        return;
    }
    await authStore.fetchProfile();
    await loadTrackedStocks();
}
async function loadTrackedStocks() {
    const token = authStore.token;
    if (!token) {
        return;
    }
    trackedStocks.value = await apiFetch('/stocks/tracked', {}, token);
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
        stockSearchResults.value = await apiFetch(`/stocks/search?keyword=${encoded}`, {}, token);
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '搜索失败';
    }
    finally {
        loading.value = false;
    }
}
async function analyzeStock(symbol, displayName) {
    const token = authStore.token;
    if (!token) {
        return;
    }
    loading.value = true;
    errorMessage.value = '';
    try {
        latestAnalysis.value = await apiFetch('/stocks/analyze', {
            method: 'POST',
            body: JSON.stringify({ symbol, displayName }),
        }, token);
        await loadTrackedStocks();
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '分析失败';
    }
    finally {
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
        latestCompare.value = await apiFetch('/stocks/compare', {
            method: 'POST',
            body: JSON.stringify({ symbols: stockState.selectedSymbols }),
        }, token);
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '对比失败';
    }
    finally {
        loading.value = false;
    }
}
function toggleCompare(symbol) {
    if (stockState.selectedSymbols.includes(symbol)) {
        stockState.selectedSymbols = stockState.selectedSymbols.filter((item) => item !== symbol);
        return;
    }
    if (stockState.selectedSymbols.length >= 3) {
        return;
    }
    stockState.selectedSymbols = [...stockState.selectedSymbols, symbol];
}
async function deleteTracked(id) {
    const token = authStore.token;
    if (!token) {
        return;
    }
    await apiFetch(`/stocks/tracked/${id}`, { method: 'DELETE' }, token);
    await loadTrackedStocks();
}
onMounted(() => {
    initialize();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dashboard-shell" },
});
/** @type {[typeof AppTopbar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppTopbar, new AppTopbar({
    title: "股票诊断",
    subtitle: "搜索股票、做单股诊断、管理跟踪列表，并对 2-3 只股票生成仓位配置建议。",
    backTo: "/",
}));
const __VLS_1 = __VLS_0({
    title: "股票诊断",
    subtitle: "搜索股票、做单股诊断、管理跟踪列表，并对 2-3 只股票生成仓位配置建议。",
    backTo: "/",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "summary-grid two-up-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-card glass-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.trackedStocks.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-card glass-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.stockState.selectedSymbols.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "feature-grid stocks-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "glass-card feature-panel form-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-stack" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-row" },
});
const __VLS_3 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.stockState.keyword),
    size: "large",
    placeholder: "例如：600519 或 贵州茅台",
}));
const __VLS_5 = __VLS_4({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.stockState.keyword),
    size: "large",
    placeholder: "例如：600519 或 贵州茅台",
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
let __VLS_7;
let __VLS_8;
let __VLS_9;
const __VLS_10 = {
    onKeyup: (__VLS_ctx.searchStocks)
};
var __VLS_6;
const __VLS_11 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    ...{ 'onClick': {} },
    ...{ class: "primary-btn ui-btn" },
    type: "primary",
    size: "large",
    loading: (__VLS_ctx.loading),
}));
const __VLS_13 = __VLS_12({
    ...{ 'onClick': {} },
    ...{ class: "primary-btn ui-btn" },
    type: "primary",
    size: "large",
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
let __VLS_15;
let __VLS_16;
let __VLS_17;
const __VLS_18 = {
    onClick: (__VLS_ctx.searchStocks)
};
__VLS_14.slots.default;
var __VLS_14;
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "error-text" },
    });
    (__VLS_ctx.errorMessage);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-result-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.stockSearchResults))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.symbol),
        ...{ class: "search-result-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (item.shortName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (item.symbol);
    (item.market);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-actions" },
    });
    const __VLS_19 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
        ...{ 'onClick': {} },
        ...{ class: "ghost-btn ui-btn" },
        plain: true,
    }));
    const __VLS_21 = __VLS_20({
        ...{ 'onClick': {} },
        ...{ class: "ghost-btn ui-btn" },
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    let __VLS_23;
    let __VLS_24;
    let __VLS_25;
    const __VLS_26 = {
        onClick: (...[$event]) => {
            __VLS_ctx.analyzeStock(item.symbol, item.shortName);
        }
    };
    __VLS_22.slots.default;
    var __VLS_22;
    const __VLS_27 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        ...{ 'onClick': {} },
        ...{ class: "ghost-btn ui-btn" },
        plain: true,
    }));
    const __VLS_29 = __VLS_28({
        ...{ 'onClick': {} },
        ...{ class: "ghost-btn ui-btn" },
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_31;
    let __VLS_32;
    let __VLS_33;
    const __VLS_34 = {
        onClick: (...[$event]) => {
            __VLS_ctx.toggleCompare(item.symbol);
        }
    };
    __VLS_30.slots.default;
    (__VLS_ctx.stockState.selectedSymbols.includes(item.symbol) ? '已选中' : '加入对比');
    var __VLS_30;
}
if (__VLS_ctx.stockState.selectedSymbols.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-strip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.stockState.selectedSymbols.join(' / '));
    const __VLS_35 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        ...{ 'onClick': {} },
        ...{ class: "primary-btn ui-btn" },
        type: "primary",
        size: "large",
        disabled: (__VLS_ctx.stockState.selectedSymbols.length < 2 || __VLS_ctx.loading),
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onClick': {} },
        ...{ class: "primary-btn ui-btn" },
        type: "primary",
        size: "large",
        disabled: (__VLS_ctx.stockState.selectedSymbols.length < 2 || __VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_39;
    let __VLS_40;
    let __VLS_41;
    const __VLS_42 = {
        onClick: (__VLS_ctx.compareStocks)
    };
    __VLS_38.slots.default;
    var __VLS_38;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "helper-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "glass-card feature-panel result-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
if (__VLS_ctx.latestAnalysis) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-stack" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-headline" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.latestAnalysis.trackedStock.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (__VLS_ctx.latestAnalysis.trackedStock.code);
    (__VLS_ctx.latestAnalysis.trackedStock.market);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "signal-badges" },
    });
    const __VLS_43 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        ...{ class: "tag-chip ui-tag" },
        effect: "dark",
        round: true,
    }));
    const __VLS_45 = __VLS_44({
        ...{ class: "tag-chip ui-tag" },
        effect: "dark",
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    __VLS_46.slots.default;
    (__VLS_ctx.latestAnalysis.analysis.recommendation);
    var __VLS_46;
    const __VLS_47 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
        ...{ class: "tag-chip ui-tag warning" },
        effect: "dark",
        round: true,
    }));
    const __VLS_49 = __VLS_48({
        ...{ class: "tag-chip ui-tag warning" },
        effect: "dark",
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    __VLS_50.slots.default;
    (__VLS_ctx.latestAnalysis.analysis.riskLevel);
    var __VLS_50;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.latestAnalysis.analysis.summary);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "metric-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.latestAnalysis.analysis.trend);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "metric-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.latestAnalysis.analysis.valuation);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "metric-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.latestAnalysis.analysis.sentiment);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "metric-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.latestAnalysis.analysis.positionSuggestion);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "prediction-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "prediction-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.latestAnalysis.analysis.weekPrediction.low);
    (__VLS_ctx.latestAnalysis.analysis.weekPrediction.high);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "prediction-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.latestAnalysis.analysis.monthPrediction.low);
    (__VLS_ctx.latestAnalysis.analysis.monthPrediction.high);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "prediction-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.latestAnalysis.analysis.yearPrediction.low);
    (__VLS_ctx.latestAnalysis.analysis.yearPrediction.high);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "reason-list" },
    });
    for (const [reason, idx] of __VLS_getVForSourceType((__VLS_ctx.latestAnalysis.analysis.reasons))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (idx),
        });
        (reason);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "glass-card feature-panel history-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mini-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.trackedStocks))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.id),
        ...{ class: "mini-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (item.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (item.code);
    (item.market);
    const __VLS_51 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        ...{ 'onClick': {} },
        ...{ class: "text-btn ui-text-btn" },
        text: true,
    }));
    const __VLS_53 = __VLS_52({
        ...{ 'onClick': {} },
        ...{ class: "text-btn ui-text-btn" },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_55;
    let __VLS_56;
    let __VLS_57;
    const __VLS_58 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteTracked(item.id);
        }
    };
    __VLS_54.slots.default;
    var __VLS_54;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (item.latestPrice?.toFixed(2) ?? '--');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (item.analyses?.[0]?.summary || '暂无诊断摘要');
}
if (!__VLS_ctx.trackedStocks.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state compact" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "glass-card feature-panel history-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
if (__VLS_ctx.latestCompare) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-stack compact-stack" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.latestCompare.overview);
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.latestCompare.allocations))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (item.symbol),
            ...{ class: "mini-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.name);
        (item.symbol);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (Math.round(item.ratio * 100));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
        (item.reason);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "helper-text" },
    });
    (__VLS_ctx.latestCompare.conclusion);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state compact" },
    });
}
/** @type {__VLS_StyleScopedClasses['dashboard-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['two-up-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stocks-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['form-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['form-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['search-row']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['error-text']} */ ;
/** @type {__VLS_StyleScopedClasses['search-result-list']} */ ;
/** @type {__VLS_StyleScopedClasses['search-result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-text']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['result-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['signal-badges']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['prediction-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['prediction-card']} */ ;
/** @type {__VLS_StyleScopedClasses['prediction-card']} */ ;
/** @type {__VLS_StyleScopedClasses['prediction-card']} */ ;
/** @type {__VLS_StyleScopedClasses['reason-list']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['history-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-list']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['text-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-text-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['history-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-card']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-text']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppTopbar: AppTopbar,
            loading: loading,
            errorMessage: errorMessage,
            trackedStocks: trackedStocks,
            stockSearchResults: stockSearchResults,
            latestAnalysis: latestAnalysis,
            latestCompare: latestCompare,
            stockState: stockState,
            searchStocks: searchStocks,
            analyzeStock: analyzeStock,
            compareStocks: compareStocks,
            toggleCompare: toggleCompare,
            deleteTracked: deleteTracked,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
