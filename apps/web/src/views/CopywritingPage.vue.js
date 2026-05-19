import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppTopbar from '../components/AppTopbar.vue';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const errorMessage = ref('');
const favorites = ref([]);
const copyResult = ref(null);
const favoritesVisible = ref(false);
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
async function initialize() {
    if (!authStore.token) {
        await router.push('/auth');
        return;
    }
    await authStore.fetchProfile();
    await loadFavorites();
}
async function loadFavorites() {
    const token = authStore.token;
    if (!token) {
        return;
    }
    favorites.value = await apiFetch('/copywriting/favorites', {}, token);
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
    await loadFavorites();
    favoritesVisible.value = true;
}
async function removeFavorite(id) {
    const token = authStore.token;
    if (!token) {
        return;
    }
    await apiFetch(`/copywriting/favorites/${id}`, { method: 'DELETE' }, token);
    await loadFavorites();
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
    ...{ class: "dashboard-shell tool-page-shell" },
});
/** @type {[typeof AppTopbar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppTopbar, new AppTopbar({
    title: "文案推荐",
    subtitle: "专注做一个功能：围绕你的主题，生成 10 条可直接使用的中文爆款开头。",
    backTo: "/",
    compact: true,
}));
const __VLS_1 = __VLS_0({
    title: "文案推荐",
    subtitle: "专注做一个功能：围绕你的主题，生成 10 条可直接使用的中文爆款开头。",
    backTo: "/",
    compact: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-stack plain-page-stack" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "plain-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-heading" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "helper-text" },
});
const __VLS_3 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
    ...{ 'onClick': {} },
    ...{ class: "ghost-btn ui-btn" },
    plain: true,
}));
const __VLS_5 = __VLS_4({
    ...{ 'onClick': {} },
    ...{ class: "ghost-btn ui-btn" },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
let __VLS_7;
let __VLS_8;
let __VLS_9;
const __VLS_10 = {
    onClick: (...[$event]) => {
        __VLS_ctx.favoritesVisible = true;
    }
};
__VLS_6.slots.default;
(__VLS_ctx.favorites.length);
var __VLS_6;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-stack" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_11 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    modelValue: (__VLS_ctx.copyForm.topic),
    size: "large",
    placeholder: "例如：夏季防晒新品上市",
}));
const __VLS_13 = __VLS_12({
    modelValue: (__VLS_ctx.copyForm.topic),
    size: "large",
    placeholder: "例如：夏季防晒新品上市",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions" },
});
const __VLS_15 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    ...{ 'onClick': {} },
    ...{ class: "primary-btn ui-btn" },
    type: "primary",
    size: "large",
    loading: (__VLS_ctx.loading),
    disabled: (!__VLS_ctx.copyForm.topic.trim()),
}));
const __VLS_17 = __VLS_16({
    ...{ 'onClick': {} },
    ...{ class: "primary-btn ui-btn" },
    type: "primary",
    size: "large",
    loading: (__VLS_ctx.loading),
    disabled: (!__VLS_ctx.copyForm.topic.trim()),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_19;
let __VLS_20;
let __VLS_21;
const __VLS_22 = {
    onClick: (__VLS_ctx.generateCopywriting)
};
__VLS_18.slots.default;
(__VLS_ctx.loading ? '生成中...' : '一键生成 10 条文案');
var __VLS_18;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "plain-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-heading compact-heading" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
if (__VLS_ctx.copyResult?.items?.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plain-result-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.copyResult.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (`${item.styleTag}-${index}`),
            ...{ class: "result-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-row-top" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-row-meta" },
        });
        const __VLS_23 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
            ...{ class: "tag-chip ui-tag" },
            effect: "dark",
            round: true,
        }));
        const __VLS_25 = __VLS_24({
            ...{ class: "tag-chip ui-tag" },
            effect: "dark",
            round: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        __VLS_26.slots.default;
        (item.styleTag);
        var __VLS_26;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "muted-index" },
        });
        (index + 1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-actions" },
        });
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
                __VLS_ctx.copyText(item.content);
            }
        };
        __VLS_30.slots.default;
        var __VLS_30;
        const __VLS_35 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
            ...{ 'onClick': {} },
            ...{ class: "ghost-btn ui-btn" },
            plain: true,
        }));
        const __VLS_37 = __VLS_36({
            ...{ 'onClick': {} },
            ...{ class: "ghost-btn ui-btn" },
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        let __VLS_39;
        let __VLS_40;
        let __VLS_41;
        const __VLS_42 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.copyResult?.items?.length))
                    return;
                __VLS_ctx.favoriteItem(item, index);
            }
        };
        __VLS_38.slots.default;
        var __VLS_38;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "result-row-content" },
        });
        (item.content);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state simple-empty-state" },
    });
}
const __VLS_43 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    modelValue: (__VLS_ctx.favoritesVisible),
    title: "收藏夹",
    width: "720px",
    ...{ class: "favorites-dialog" },
}));
const __VLS_45 = __VLS_44({
    modelValue: (__VLS_ctx.favoritesVisible),
    title: "收藏夹",
    width: "720px",
    ...{ class: "favorites-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_46.slots.default;
if (__VLS_ctx.favorites.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.favorites))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (item.id),
            ...{ class: "dialog-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-row-top" },
        });
        const __VLS_47 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
            ...{ class: "tag-chip ui-tag" },
            effect: "dark",
            round: true,
        }));
        const __VLS_49 = __VLS_48({
            ...{ class: "tag-chip ui-tag" },
            effect: "dark",
            round: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        __VLS_50.slots.default;
        (item.styleTag);
        var __VLS_50;
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
                if (!(__VLS_ctx.favorites.length))
                    return;
                __VLS_ctx.removeFavorite(item.id);
            }
        };
        __VLS_54.slots.default;
        var __VLS_54;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "result-row-content" },
        });
        (item.content);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state simple-empty-state compact" },
    });
}
var __VLS_46;
/** @type {__VLS_StyleScopedClasses['dashboard-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-text']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['form-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-picker-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-picker-group']} */ ;
/** @type {__VLS_StyleScopedClasses['error-text']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-result-list']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-top']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['muted-index']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['favorites-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-list']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-item']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-top']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['text-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-text-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppTopbar: AppTopbar,
            loading: loading,
            errorMessage: errorMessage,
            favorites: favorites,
            copyResult: copyResult,
            favoritesVisible: favoritesVisible,
            copyForm: copyForm,
            platformOptions: platformOptions,
            contentTypeOptions: contentTypeOptions,
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
