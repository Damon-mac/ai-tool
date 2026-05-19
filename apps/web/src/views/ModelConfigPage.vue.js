import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppTopbar from '../components/AppTopbar.vue';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const saving = ref(false);
const switching = ref(false);
const resetting = ref(false);
const deletingId = ref('');
const testingId = ref('');
const errorMessage = ref('');
const currentConfig = ref(null);
const editingModelId = ref(null);
const form = reactive({
    baseUrl: '',
    apiKey: '',
    model: '',
    provider: 'openai',
});
const providerOptions = [
    { label: 'OpenAI Compatible', value: 'openai' },
    { label: 'Anthropic Compatible', value: 'anthropic' },
];
function resetForm() {
    form.baseUrl = currentConfig.value?.runtime.baseUrl || currentConfig.value?.envDefault.baseUrl || '';
    form.model = currentConfig.value?.runtime.model || currentConfig.value?.envDefault.model || '';
    form.provider = currentConfig.value?.runtime.provider || currentConfig.value?.envDefault.provider || 'openai';
    form.apiKey = '';
    editingModelId.value = null;
}
function startCreate() {
    resetForm();
}
function startEdit(item) {
    editingModelId.value = item.id;
    form.baseUrl = item.baseUrl;
    form.model = item.model;
    form.provider = item.provider;
    form.apiKey = '';
}
async function initialize() {
    if (!authStore.token) {
        await router.push('/auth');
        return;
    }
    await authStore.fetchProfile();
    await loadConfig();
}
async function loadConfig() {
    const token = authStore.token;
    if (!token) {
        return;
    }
    loading.value = true;
    errorMessage.value = '';
    try {
        const config = await apiFetch('/model-config', {}, token);
        currentConfig.value = config;
        resetForm();
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '加载模型配置失败';
    }
    finally {
        loading.value = false;
    }
}
async function saveConfig() {
    const token = authStore.token;
    if (!token) {
        return;
    }
    saving.value = true;
    errorMessage.value = '';
    const isEditing = Boolean(editingModelId.value);
    try {
        currentConfig.value = await apiFetch(editingModelId.value ? `/model-config/models/${editingModelId.value}` : '/model-config/models', {
            method: editingModelId.value ? 'PUT' : 'POST',
            body: JSON.stringify({
                baseUrl: form.baseUrl,
                apiKey: form.apiKey || undefined,
                model: form.model,
                provider: form.provider,
            }),
        }, token);
        resetForm();
        ElMessage.success(isEditing ? '模型已更新' : '模型已添加');
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '保存失败';
    }
    finally {
        saving.value = false;
    }
}
async function setActiveModel(modelId) {
    const token = authStore.token;
    if (!token) {
        return;
    }
    switching.value = true;
    errorMessage.value = '';
    try {
        currentConfig.value = await apiFetch(`/model-config/active/${modelId}`, {
            method: 'PUT',
        }, token);
        resetForm();
        ElMessage.success('已切换当前模型');
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '切换模型失败';
    }
    finally {
        switching.value = false;
    }
}
async function resetToEnv() {
    const token = authStore.token;
    if (!token) {
        return;
    }
    resetting.value = true;
    errorMessage.value = '';
    try {
        currentConfig.value = await apiFetch('/model-config/active', {
            method: 'DELETE',
        }, token);
        resetForm();
        ElMessage.success('已恢复为 env 默认模型');
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '恢复默认失败';
    }
    finally {
        resetting.value = false;
    }
}
async function deleteModel(modelId) {
    const token = authStore.token;
    if (!token) {
        return;
    }
    if (!window.confirm('删除后该模型将从列表移除，确定继续吗？')) {
        return;
    }
    deletingId.value = modelId;
    errorMessage.value = '';
    try {
        currentConfig.value = await apiFetch(`/model-config/models/${modelId}`, {
            method: 'DELETE',
        }, token);
        if (editingModelId.value === modelId) {
            resetForm();
        }
        ElMessage.success('模型已删除');
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '删除失败';
    }
    finally {
        deletingId.value = '';
    }
}
async function testModel(modelId) {
    const token = authStore.token;
    if (!token) {
        return;
    }
    testingId.value = modelId;
    errorMessage.value = '';
    try {
        const result = await apiFetch(`/model-config/models/${modelId}/test`, {
            method: 'POST',
        }, token);
        if (result.success) {
            ElMessage.success(result.message);
            return;
        }
        ElMessage.error(result.message);
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '测试连接失败';
    }
    finally {
        testingId.value = '';
    }
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
    title: "模型管理",
    subtitle: "把你添加过的模型都管理起来，并选择当前真正生效的那个。页面保存的模型列表优先于 env 默认值。",
    backTo: "/",
    compact: true,
}));
const __VLS_1 = __VLS_0({
    title: "模型管理",
    subtitle: "把你添加过的模型都管理起来，并选择当前真正生效的那个。页面保存的模型列表优先于 env 默认值。",
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
    ...{ class: "section-heading compact-heading" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "helper-text" },
});
if (__VLS_ctx.currentConfig) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "model-config-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tag-chip" },
    });
    (__VLS_ctx.currentConfig.runtime.source === 'file' ? '已选模型' : 'env 默认值');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tag-chip" },
    });
    (__VLS_ctx.currentConfig.runtime.provider);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tag-chip" },
    });
    (__VLS_ctx.currentConfig.runtime.model || '未设置');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tag-chip" },
    });
    (__VLS_ctx.currentConfig.runtime.hasApiKey ? __VLS_ctx.currentConfig.runtime.apiKeyHint : '未设置');
}
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "error-text settings-error" },
    });
    (__VLS_ctx.errorMessage);
}
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "helper-text" },
});
if (__VLS_ctx.currentConfig?.models.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plain-result-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.currentConfig.models))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (item.id),
            ...{ class: "result-row model-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-row-top model-row-top" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-row-meta model-row-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tag-chip" },
        });
        (item.provider);
        if (item.isActive) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "tag-chip warning" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.model);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "settings-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentConfig?.models.length))
                        return;
                    __VLS_ctx.setActiveModel(item.id);
                } },
            ...{ class: "ghost-btn" },
            disabled: (item.isActive || __VLS_ctx.switching),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentConfig?.models.length))
                        return;
                    __VLS_ctx.testModel(item.id);
                } },
            ...{ class: "ghost-btn" },
            disabled: (__VLS_ctx.testingId === item.id),
        });
        (__VLS_ctx.testingId === item.id ? '测试中...' : '测试连接');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentConfig?.models.length))
                        return;
                    __VLS_ctx.startEdit(item);
                } },
            ...{ class: "ghost-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentConfig?.models.length))
                        return;
                    __VLS_ctx.deleteModel(item.id);
                } },
            ...{ class: "ghost-btn danger-btn" },
            disabled: (__VLS_ctx.deletingId === item.id),
        });
        (__VLS_ctx.deletingId === item.id ? '删除中...' : '删除');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "result-row-content" },
        });
        (item.baseUrl);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-row-meta compact-copy" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
        (item.apiKeyHint);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
        (new Date(item.updatedAt).toLocaleString());
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state simple-empty-state" },
    });
}
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
(__VLS_ctx.editingModelId ? '编辑模型' : '新增模型');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-stack settings-form" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_3 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
    modelValue: (__VLS_ctx.form.baseUrl),
    size: "large",
    placeholder: "例如：https://api.deepseek.com/v1",
}));
const __VLS_5 = __VLS_4({
    modelValue: (__VLS_ctx.form.baseUrl),
    size: "large",
    placeholder: "例如：https://api.deepseek.com/v1",
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_7 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
    modelValue: (__VLS_ctx.form.model),
    size: "large",
    placeholder: "例如：deepseek-chat",
}));
const __VLS_9 = __VLS_8({
    modelValue: (__VLS_ctx.form.model),
    size: "large",
    placeholder: "例如：deepseek-chat",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-picker-group" },
});
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.providerOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.form.provider = option.value;
            } },
        key: (option.value),
        type: "button",
        ...{ class: (['picker-tag', { active: __VLS_ctx.form.provider === option.value }]) },
    });
    (option.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_11 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    modelValue: (__VLS_ctx.form.apiKey),
    size: "large",
    type: "password",
    showPassword: true,
    placeholder: (__VLS_ctx.editingModelId ? '留空则保留该模型当前 API Key' : '输入新的 API Key'),
}));
const __VLS_13 = __VLS_12({
    modelValue: (__VLS_ctx.form.apiKey),
    size: "large",
    type: "password",
    showPassword: true,
    placeholder: (__VLS_ctx.editingModelId ? '留空则保留该模型当前 API Key' : '输入新的 API Key'),
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings-actions" },
});
const __VLS_15 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    ...{ 'onClick': {} },
    ...{ class: "primary-btn ui-btn" },
    type: "primary",
    size: "large",
    loading: (__VLS_ctx.saving),
}));
const __VLS_17 = __VLS_16({
    ...{ 'onClick': {} },
    ...{ class: "primary-btn ui-btn" },
    type: "primary",
    size: "large",
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_19;
let __VLS_20;
let __VLS_21;
const __VLS_22 = {
    onClick: (__VLS_ctx.saveConfig)
};
__VLS_18.slots.default;
(__VLS_ctx.editingModelId ? '保存修改' : '添加模型');
var __VLS_18;
const __VLS_23 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    ...{ 'onClick': {} },
    ...{ class: "ghost-btn ui-btn" },
    plain: true,
    size: "large",
}));
const __VLS_25 = __VLS_24({
    ...{ 'onClick': {} },
    ...{ class: "ghost-btn ui-btn" },
    plain: true,
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
let __VLS_27;
let __VLS_28;
let __VLS_29;
const __VLS_30 = {
    onClick: (__VLS_ctx.startCreate)
};
__VLS_26.slots.default;
var __VLS_26;
const __VLS_31 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    ...{ 'onClick': {} },
    ...{ class: "ghost-btn ui-btn" },
    plain: true,
    size: "large",
    loading: (__VLS_ctx.resetting),
}));
const __VLS_33 = __VLS_32({
    ...{ 'onClick': {} },
    ...{ class: "ghost-btn ui-btn" },
    plain: true,
    size: "large",
    loading: (__VLS_ctx.resetting),
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
let __VLS_35;
let __VLS_36;
let __VLS_37;
const __VLS_38 = {
    onClick: (__VLS_ctx.resetToEnv)
};
__VLS_34.slots.default;
var __VLS_34;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plain-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state simple-empty-state" },
    });
}
/** @type {__VLS_StyleScopedClasses['dashboard-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-text']} */ ;
/** @type {__VLS_StyleScopedClasses['model-config-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['error-text']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-error']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-text']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-result-list']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row']} */ ;
/** @type {__VLS_StyleScopedClasses['model-row']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-top']} */ ;
/** @type {__VLS_StyleScopedClasses['model-row-top']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['model-row-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-content']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['form-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-form']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-picker-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ui-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-section']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-empty-state']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppTopbar: AppTopbar,
            loading: loading,
            saving: saving,
            switching: switching,
            resetting: resetting,
            deletingId: deletingId,
            testingId: testingId,
            errorMessage: errorMessage,
            currentConfig: currentConfig,
            editingModelId: editingModelId,
            form: form,
            providerOptions: providerOptions,
            startCreate: startCreate,
            startEdit: startEdit,
            saveConfig: saveConfig,
            setActiveModel: setActiveModel,
            resetToEnv: resetToEnv,
            deleteModel: deleteModel,
            testModel: testModel,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
