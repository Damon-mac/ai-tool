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
const deletingId = ref('');
const togglingId = ref('');
const errorMessage = ref('');
const units = ref([]);
const editingId = ref(null);
const managingAccessId = ref(null);
const accessUsers = ref([]);
const accessLoading = ref(false);
const accessGrantEmail = ref('');
const form = reactive({
    name: '',
    slug: '',
    description: '',
    icon: '',
    route: '',
    eyebrow: '',
    cta: '',
    pointsText: '',
    enabled: true,
    sortOrder: 0,
});
function resetForm() {
    form.name = '';
    form.slug = '';
    form.description = '';
    form.icon = '';
    form.route = '/';
    form.eyebrow = '';
    form.cta = '';
    form.pointsText = '';
    form.enabled = true;
    form.sortOrder = units.value.length;
    editingId.value = null;
}
function startEdit(item) {
    editingId.value = item.id;
    form.name = item.name;
    form.slug = item.slug;
    form.description = item.description || '';
    form.icon = item.icon || '';
    form.route = item.route;
    form.eyebrow = item.eyebrow || '';
    form.cta = item.cta || '';
    form.pointsText = item.points.join('\n');
    form.enabled = item.enabled;
    form.sortOrder = item.sortOrder;
}
async function initialize() {
    if (!authStore.token) {
        await router.push('/auth');
        return;
    }
    await authStore.fetchProfile();
    if (!authStore.isAdmin) {
        await router.push('/');
        return;
    }
    await loadUnits();
}
async function loadUnits() {
    const token = authStore.token;
    if (!token)
        return;
    loading.value = true;
    errorMessage.value = '';
    try {
        units.value = await apiFetch('/units', {}, token);
        if (!editingId.value) {
            form.sortOrder = units.value.length;
        }
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '加载失败';
    }
    finally {
        loading.value = false;
    }
}
async function saveUnit() {
    const token = authStore.token;
    if (!token)
        return;
    saving.value = true;
    errorMessage.value = '';
    const points = form.pointsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    const body = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        icon: form.icon || undefined,
        route: form.route,
        eyebrow: form.eyebrow || undefined,
        cta: form.cta || undefined,
        points,
        enabled: form.enabled,
        sortOrder: form.sortOrder,
    };
    const isEditing = Boolean(editingId.value);
    try {
        if (editingId.value) {
            await apiFetch(`/units/${editingId.value}`, {
                method: 'PUT',
                body: JSON.stringify(body),
            }, token);
        }
        else {
            await apiFetch('/units', {
                method: 'POST',
                body: JSON.stringify(body),
            }, token);
        }
        ElMessage.success(isEditing ? '单元已更新' : '单元已创建');
        resetForm();
        await loadUnits();
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '保存失败';
    }
    finally {
        saving.value = false;
    }
}
async function toggleUnit(id) {
    const token = authStore.token;
    if (!token)
        return;
    togglingId.value = id;
    try {
        await apiFetch(`/units/${id}/toggle`, { method: 'PATCH' }, token);
        await loadUnits();
        ElMessage.success('状态已切换');
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '切换失败';
    }
    finally {
        togglingId.value = '';
    }
}
async function deleteUnit(id) {
    const token = authStore.token;
    if (!token)
        return;
    if (!window.confirm('删除后该功能单元将从首页移除，确定继续吗？')) {
        return;
    }
    deletingId.value = id;
    errorMessage.value = '';
    try {
        await apiFetch(`/units/${id}`, { method: 'DELETE' }, token);
        if (editingId.value === id) {
            resetForm();
        }
        ElMessage.success('单元已删除');
        await loadUnits();
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '删除失败';
    }
    finally {
        deletingId.value = '';
    }
}
async function loadAccessUsers(unitId) {
    const token = authStore.token;
    if (!token)
        return;
    managingAccessId.value = unitId;
    accessLoading.value = true;
    accessGrantEmail.value = '';
    try {
        accessUsers.value = await apiFetch(`/units/${unitId}/access`, {}, token);
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '加载权限列表失败';
    }
    finally {
        accessLoading.value = false;
    }
}
async function grantAccess() {
    const token = authStore.token;
    if (!token || !managingAccessId.value || !accessGrantEmail.value.trim())
        return;
    try {
        await apiFetch(`/units/${managingAccessId.value}/access`, {
            method: 'POST',
            body: JSON.stringify({ userId: accessGrantEmail.value.trim() }),
        }, token);
        ElMessage.success('权限已授予');
        accessGrantEmail.value = '';
        await loadAccessUsers(managingAccessId.value);
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '授予权限失败';
    }
}
async function revokeAccess(userId) {
    const token = authStore.token;
    if (!token || !managingAccessId.value)
        return;
    try {
        await apiFetch(`/units/${managingAccessId.value}/access/${userId}`, {
            method: 'DELETE',
        }, token);
        ElMessage.success('权限已撤销');
        await loadAccessUsers(managingAccessId.value);
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '撤销权限失败';
    }
}
function closeAccessDialog() {
    managingAccessId.value = null;
    accessUsers.value = [];
    accessGrantEmail.value = '';
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
    title: "功能单元管理",
    subtitle: "管理首页展示的功能模块：创建、编辑、启用/禁用、排序和访问权限控制。",
    backTo: "/",
    compact: true,
}));
const __VLS_1 = __VLS_0({
    title: "功能单元管理",
    subtitle: "管理首页展示的功能模块：创建、编辑、启用/禁用、排序和访问权限控制。",
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
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "error-text settings-error" },
    });
    (__VLS_ctx.errorMessage);
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state simple-empty-state" },
    });
}
else if (__VLS_ctx.units.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plain-result-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.units))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (item.id),
            ...{ class: (['result-row', 'unit-row', { 'unit-disabled': !item.enabled }]) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.units.length))
                        return;
                    __VLS_ctx.startEdit(item);
                } },
            ...{ class: "result-row-top unit-row-top" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-row-meta model-row-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tag-chip" },
        });
        (item.slug);
        if (item.enabled) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "tag-chip" },
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "tag-chip warning" },
            });
        }
        if (item._count.userUnits > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "tag-chip" },
            });
            (item._count.userUnits);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "settings-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.units.length))
                        return;
                    __VLS_ctx.toggleUnit(item.id);
                } },
            ...{ class: "ghost-btn" },
            disabled: (__VLS_ctx.togglingId === item.id),
        });
        (item.enabled ? '禁用' : '启用');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.units.length))
                        return;
                    __VLS_ctx.loadAccessUsers(item.id);
                } },
            ...{ class: "ghost-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.units.length))
                        return;
                    __VLS_ctx.deleteUnit(item.id);
                } },
            ...{ class: "ghost-btn danger-btn" },
            disabled: (__VLS_ctx.deletingId === item.id),
        });
        (__VLS_ctx.deletingId === item.id ? '删除中...' : '删除');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "result-row-content" },
        });
        (item.description || '暂无描述');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-row-meta compact-copy" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
        (item.route);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
        (item.sortOrder);
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
(__VLS_ctx.editingId ? '编辑单元' : '新建单元');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-stack settings-form" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "inline-fields" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "例如：文案推荐",
});
(__VLS_ctx.form.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "例如：copywriting",
});
(__VLS_ctx.form.slug);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "功能描述",
});
(__VLS_ctx.form.description);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "inline-fields" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "例如：/copywriting",
});
(__VLS_ctx.form.route);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
});
(__VLS_ctx.form.sortOrder);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "inline-fields" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "例如：Copywriting Lab",
});
(__VLS_ctx.form.eyebrow);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "例如：进入文案推荐",
});
(__VLS_ctx.form.cta);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.form.pointsText),
    rows: "3",
    placeholder: "10 条不同风格结果&#10;支持收藏与历史&#10;适配小红书 / 抖音 / 朋友圈",
    ...{ class: "unit-textarea" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "input-group unit-checkbox-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
    ...{ class: "unit-checkbox" },
});
(__VLS_ctx.form.enabled);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.saveUnit) },
    ...{ class: "primary-btn" },
    disabled: (__VLS_ctx.saving || !__VLS_ctx.form.name || !__VLS_ctx.form.slug || !__VLS_ctx.form.route),
});
(__VLS_ctx.saving ? '保存中...' : __VLS_ctx.editingId ? '保存修改' : '创建单元');
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.resetForm) },
    ...{ class: "ghost-btn" },
});
if (__VLS_ctx.managingAccessId) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeAccessDialog) },
        ...{ class: "unit-access-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "unit-access-dialog glass-card" },
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeAccessDialog) },
        ...{ class: "ghost-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "access-grant-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "输入用户 ID",
        ...{ class: "access-input" },
    });
    (__VLS_ctx.accessGrantEmail);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.grantAccess) },
        ...{ class: "primary-btn small" },
        disabled: (!__VLS_ctx.accessGrantEmail.trim()),
    });
    if (__VLS_ctx.accessLoading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state simple-empty-state" },
        });
    }
    else if (__VLS_ctx.accessUsers.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "plain-result-list" },
        });
        for (const [user] of __VLS_getVForSourceType((__VLS_ctx.accessUsers))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                key: (user.id),
                ...{ class: "result-row dialog-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "result-row-top" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "result-row-meta" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (user.name || user.email);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
            (user.email);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.managingAccessId))
                            return;
                        if (!!(__VLS_ctx.accessLoading))
                            return;
                        if (!(__VLS_ctx.accessUsers.length))
                            return;
                        __VLS_ctx.revokeAccess(user.id);
                    } },
                ...{ class: "ghost-btn danger-btn" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({
                ...{ class: "result-row-content" },
            });
            (new Date(user.grantedAt).toLocaleString());
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state simple-empty-state" },
        });
    }
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
/** @type {__VLS_StyleScopedClasses['error-text']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-error']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-result-list']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-top']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-row-top']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['model-row-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-actions']} */ ;
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
/** @type {__VLS_StyleScopedClasses['inline-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-checkbox-row']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-access-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-access-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-text']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['access-grant-row']} */ ;
/** @type {__VLS_StyleScopedClasses['access-input']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-result-list']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-item']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-top']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['result-row-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-empty-state']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppTopbar: AppTopbar,
            loading: loading,
            saving: saving,
            deletingId: deletingId,
            togglingId: togglingId,
            errorMessage: errorMessage,
            units: units,
            editingId: editingId,
            managingAccessId: managingAccessId,
            accessUsers: accessUsers,
            accessLoading: accessLoading,
            accessGrantEmail: accessGrantEmail,
            form: form,
            resetForm: resetForm,
            startEdit: startEdit,
            saveUnit: saveUnit,
            toggleUnit: toggleUnit,
            deleteUnit: deleteUnit,
            loadAccessUsers: loadAccessUsers,
            grantAccess: grantAccess,
            revokeAccess: revokeAccess,
            closeAccessDialog: closeAccessDialog,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
