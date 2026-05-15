import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppTopbar from '../components/AppTopbar.vue';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const errorMessage = ref('');
const copyHistory = ref([]);
const favorites = ref([]);
const copyResult = ref(null);
const copyForm = reactive({
    topic: '',
    platform: 'xiaohongshu',
    contentType: 'video',
});
const platformOptions = [
    { label: '小红书', value: 'xiaohongshu' },
    { label: '抖音', value: 'douyin' },
    { label: '朋友圈', value: 'moments' },
];
const contentTypeOptions = [
    { label: '视频', value: 'video' },
    { label: '图文', value: 'image_text' },
    { label: '产品广告', value: 'product_ad' },
];
const platformLabels = {
    xiaohongshu: '小红书',
    douyin: '抖音',
    moments: '朋友圈',
};
const contentTypeLabels = {
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
    await loadCollections();
}
async function loadCollections() {
    const token = authStore.token;
    if (!token) {
        return;
    }
    const [history, favs] = await Promise.all([
        apiFetch('/copywriting/history', {}, token),
        apiFetch('/copywriting/favorites', {}, token),
    ]);
    copyHistory.value = history.map((item) => ({
        ...item,
        results: Array.isArray(item.results) ? item.results : [],
    }));
    favorites.value = favs;
}
async function generateCopywriting() {
    const token = authStore.token;
    if (!token) {
        return;
    }
    loading.value = true;
    errorMessage.value = '';
    try {
        copyResult.value = await apiFetch('/copywriting/generate', {
            method: 'POST',
            body: JSON.stringify(copyForm),
        }, token);
        await loadCollections();
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '生成失败';
    }
    finally {
        loading.value = false;
    }
}
async function favoriteItem(item, index) {
    const token = authStore.token;
    if (!token || !copyResult.value) {
        return;
    }
    await apiFetch('/copywriting/favorites', {
        method: 'POST',
        body: JSON.stringify({
            historyId: copyResult.value.historyId,
            itemIndex: index,
            content: item.content,
            styleTag: item.styleTag,
        }),
    }, token);
    await loadCollections();
}
async function removeFavorite(id) {
    const token = authStore.token;
    if (!token) {
        return;
    }
    await apiFetch(`/copywriting/favorites/${id}`, { method: 'DELETE' }, token);
    await loadCollections();
}
async function copyText(content) {
    await navigator.clipboard.writeText(content);
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
    title: "文案推荐",
    subtitle: "专注做一个功能：围绕你的主题，生成 10 条可直接使用的中文爆款开头。",
    backTo: "/",
}));
const __VLS_1 = __VLS_0({
    title: "文案推荐",
    subtitle: "专注做一个功能：围绕你的主题，生成 10 条可直接使用的中文爆款开头。",
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
(__VLS_ctx.copyHistory.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-card glass-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.favorites.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "feature-grid" },
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
const __VLS_3 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
    modelValue: (__VLS_ctx.copyForm.topic),
    size: "large",
    placeholder: "例如：夏季防晒新品上市",
}));
const __VLS_5 = __VLS_4({
    modelValue: (__VLS_ctx.copyForm.topic),
    size: "large",
    placeholder: "例如：夏季防晒新品上市",
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "inline-fields" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-picker-group" },
});
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.platformOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.copyForm.platform = option.value;
            } },
        key: (option.value),
        type: "button",
        ...{ class: (['picker-tag', { active: __VLS_ctx.copyForm.platform === option.value }]) },
    });
    (option.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-picker-group" },
});
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.contentTypeOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.copyForm.contentType = option.value;
            } },
        key: (option.value),
        type: "button",
        ...{ class: (['picker-tag', { active: __VLS_ctx.copyForm.contentType === option.value }]) },
    });
    (option.label);
}
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "error-text" },
    });
    (__VLS_ctx.errorMessage);
}
const __VLS_7 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
    ...{ 'onClick': {} },
    ...{ class: "primary-btn ui-btn" },
    type: "primary",
    size: "large",
    loading: (__VLS_ctx.loading),
    disabled: (!__VLS_ctx.copyForm.topic.trim()),
}));
const __VLS_9 = __VLS_8({
    ...{ 'onClick': {} },
    ...{ class: "primary-btn ui-btn" },
    type: "primary",
    size: "large",
    loading: (__VLS_ctx.loading),
    disabled: (!__VLS_ctx.copyForm.topic.trim()),
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
let __VLS_11;
let __VLS_12;
let __VLS_13;
const __VLS_14 = {
    onClick: (__VLS_ctx.generateCopywriting)
};
__VLS_10.slots.default;
(__VLS_ctx.loading ? '生成中...' : '一键生成 10 条文案');
var __VLS_10;
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
if (__VLS_ctx.copyResult?.items?.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.copyResult.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (`${item.styleTag}-${index}`),
            ...{ class: "result-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-card-header" },
        });
        const __VLS_15 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
            ...{ class: "tag-chip ui-tag" },
            effect: "dark",
            round: true,
        }));
        const __VLS_17 = __VLS_16({
            ...{ class: "tag-chip ui-tag" },
            effect: "dark",
            round: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        __VLS_18.slots.default;
        (item.styleTag);
        var __VLS_18;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "muted-index" },
        });
        (index + 1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (item.content);
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
                if (!(__VLS_ctx.copyResult?.items?.length))
                    return;
                __VLS_ctx.copyText(item.content);
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
                if (!(__VLS_ctx.copyResult?.items?.length))
                    return;
                __VLS_ctx.favoriteItem(item, index);
            }
        };
        __VLS_30.slots.default;
        var __VLS_30;
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
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.copyHistory))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.id),
        ...{ class: "mini-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (item.topic);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (__VLS_ctx.platformLabels[item.platform]);
    (__VLS_ctx.contentTypeLabels[item.contentType]);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (item.results?.[0]?.content || '暂无内容');
}
if (!__VLS_ctx.copyHistory.length) {
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mini-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.favorites))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.id),
        ...{ class: "mini-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-card-header" },
    });
    const __VLS_35 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        ...{ class: "tag-chip ui-tag" },
        effect: "dark",
        round: true,
    }));
    const __VLS_37 = __VLS_36({
        ...{ class: "tag-chip ui-tag" },
        effect: "dark",
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    __VLS_38.slots.default;
    (item.styleTag);
    var __VLS_38;
    const __VLS_39 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
        ...{ 'onClick': {} },
        ...{ class: "text-btn ui-text-btn" },
        text: true,
    }));
    const __VLS_41 = __VLS_40({
        ...{ 'onClick': {} },
        ...{ class: "text-btn ui-text-btn" },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    let __VLS_43;
    let __VLS_44;
    let __VLS_45;
    const __VLS_46 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeFavorite(item.id);
        }
    };
    __VLS_42.slots.default;
    var __VLS_42;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (item.content);
}
if (!__VLS_ctx.favorites.length) {
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
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['form-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['form-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-picker-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-picker-group']} */ ;
/** @type {__VLS_StyleScopedClasses['error-text']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['result-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['result-list']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['muted-index']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['history-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-list']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-card']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['history-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-list']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['text-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-text-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppTopbar: AppTopbar,
            loading: loading,
            errorMessage: errorMessage,
            copyHistory: copyHistory,
            favorites: favorites,
            copyResult: copyResult,
            copyForm: copyForm,
            platformOptions: platformOptions,
            contentTypeOptions: contentTypeOptions,
            platformLabels: platformLabels,
            contentTypeLabels: contentTypeLabels,
            generateCopywriting: generateCopywriting,
            favoriteItem: favoriteItem,
            removeFavorite: removeFavorite,
            copyText: copyText,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
