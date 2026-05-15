import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import AppTopbar from '../components/AppTopbar.vue';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const stats = reactive({
    copyHistory: 0,
    favorites: 0,
    trackedStocks: 0,
});
const featureCards = [
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
        apiFetch('/copywriting/history', {}, token),
        apiFetch('/copywriting/favorites', {}, token),
        apiFetch('/stocks/tracked', {}, token),
    ]);
    stats.copyHistory = history.length;
    stats.favorites = favorites.length;
    stats.trackedStocks = tracked.length;
}
function openFeature(path) {
    router.push(path);
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
    title: "你的 AI 工具入口页",
    subtitle: "首页只放功能卡片，点击卡片进入独立功能页。后续新增能力时，继续在这里增加卡片即可。",
}));
const __VLS_1 = __VLS_0({
    title: "你的 AI 工具入口页",
    subtitle: "首页只放功能卡片，点击卡片进入独立功能页。后续新增能力时，继续在这里增加卡片即可。",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "summary-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-card glass-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.stats.copyHistory);
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-card glass-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.stats.favorites);
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-card glass-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.stats.trackedStocks);
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "feature-card-grid" },
});
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.featureCards))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openFeature(card.path);
            } },
        key: (card.path),
        ...{ class: "entry-card glass-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "eyebrow" },
    });
    (card.eyebrow);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (card.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "hero-copy" },
    });
    (card.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "entry-card-list" },
    });
    for (const [point] of __VLS_getVForSourceType((card.points))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (point),
        });
        (point);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "entry-card-foot" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openFeature(card.path);
            } },
        ...{ class: "primary-btn" },
    });
    (card.cta);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "helper-text" },
    });
}
/** @type {__VLS_StyleScopedClasses['dashboard-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-card-list']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-card-foot']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppTopbar: AppTopbar,
            stats: stats,
            featureCards: featureCards,
            openFeature: openFeature,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
