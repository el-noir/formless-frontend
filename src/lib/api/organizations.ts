import { apiFetch } from "./apiFetch";
import type {
    CreateFormPayload,
    CreateFromTemplatePayload,
    AiGeneratePayload,
    AiRefinePayload,
    AiSavePayload,
    UpdateFormPayload,
    ToneOption,
    TemplateSummary,
    FormResponse,
    AiGeneratedFormPreview,
    EmbedMode,
    EmbedSnippetResponse,
} from "@/app/types/Form";

const BASE = (orgId: string) => `/organizations/${orgId}`;

// ─── Organizations ────────────────────────────────────────────────────────────

export const getMyOrganizations = async () => {
    const res = await apiFetch('/organizations');
    if (!res.ok) throw new Error('Failed to fetch organizations');
    const data = await res.json();
    return data.organizations || [];
};

export const getOrganization = async (orgId: string) => {
    const res = await apiFetch(`/organizations/${orgId}`);
    if (!res.ok) throw new Error('Failed to fetch organization');
    const data = await res.json();
    return data.organization;
};

export const createOrganization = async (body: {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    description?: string;
}) => {
    const res = await apiFetch('/organizations', {
        method: 'POST',
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create organization');
    }
    const data = await res.json();
    return data.organization;
};

export const updateOrganization = async (orgId: string, body: Record<string, any>) => {
    const res = await apiFetch(`/organizations/${orgId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update organization');
    }
    const data = await res.json();
    return data.organization;
};

export const deleteOrganization = async (orgId: string) => {
    const res = await apiFetch(`/organizations/${orgId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete organization');
    return res.json();
};

// ─── Members ──────────────────────────────────────────────────────────────────

export const getOrgMembers = async (orgId: string) => {
    const res = await apiFetch(`${BASE(orgId)}/members`);
    if (!res.ok) throw new Error('Failed to fetch members');
    const data = await res.json();
    return data.members || [];
};

export const inviteMember = async (orgId: string, email: string, role: 'admin' | 'member' = 'member') => {
    const res = await apiFetch(`${BASE(orgId)}/members`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to invite member');
    }
    return res.json();
};

export const removeMember = async (orgId: string, userId: string) => {
    const res = await apiFetch(`${BASE(orgId)}/members/${userId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove member');
    return res.json();
};

export const changeMemberRole = async (orgId: string, userId: string, role: 'admin' | 'member') => {
    const res = await apiFetch(`${BASE(orgId)}/members/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Failed to change role');
    return res.json();
};

// ─── Org-scoped Forms ─────────────────────────────────────────────────────────

export const getOrgForms = async (orgId: string, params?: { search?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query}` : '';
    const res = await apiFetch(`${BASE(orgId)}/forms${qs}`);
    if (!res.ok) throw new Error('Failed to fetch org forms');
    const data = await res.json();
    return data;
};

export const getOrgForm = async (orgId: string, formId: string) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}`);
    if (!res.ok) throw new Error('Failed to fetch form');
    const data = await res.json();
    return data.data;
};

export const importOrgForm = async (orgId: string, formIdOrUrl: string) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/import`, {
        method: 'POST',
        body: JSON.stringify({ formIdOrUrl }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to import form');
    }
    return res.json();
};

export const deleteOrgForm = async (orgId: string, formId: string) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete form');
    return res.json();
};

export const syncOrgForm = async (orgId: string, formId: string) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/sync`, {
        method: 'POST',
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to sync form');
    }
    return res.json();
};

export const generateChatLink = async (orgId: string, formId: string) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/chat-link`, {
        method: 'POST',
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to generate chat link');
    }
    return res.json();
};

export const getEmbedSnippets = async (
    orgId: string,
    formId: string,
    params?: {
        mode?: EmbedMode;
        position?: 'bottom-right' | 'bottom-left';
        autoOpenDelayMs?: number;
        themeInherit?: boolean;
        hostDomain?: string;
    }
): Promise<EmbedSnippetResponse> => {
    const query = new URLSearchParams();
    if (params?.mode) query.set('mode', params.mode);
    if (params?.position) query.set('position', params.position);
    if (typeof params?.autoOpenDelayMs === 'number') query.set('autoOpenDelayMs', String(params.autoOpenDelayMs));
    if (typeof params?.themeInherit === 'boolean') query.set('themeInherit', String(params.themeInherit));
    if (params?.hostDomain) query.set('hostDomain', params.hostDomain);

    const qs = query.toString() ? `?${query}` : '';
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/embed-snippets${qs}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err?.error?.message || 'Failed to generate embed snippets');
    }
    const data = await res.json();
    return data.data;
};

export const getFormResponses = async (orgId: string, formId: string) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/responses`);
    if (!res.ok) throw new Error('Failed to fetch form responses');
    const data = await res.json();
    return data.data;
};

// ─── Config (Tones & Templates) ──────────────────────────────────────────────

export const getFormTones = async (orgId: string): Promise<ToneOption[]> => {
    const res = await apiFetch(`${BASE(orgId)}/forms/config/tones`);
    if (!res.ok) throw new Error('Failed to fetch tones');
    const data = await res.json();
    return data.data;
};

export const getFormTemplates = async (
    orgId: string,
    params?: { objective?: string; niche?: string; complexity?: string; featured?: boolean },
): Promise<TemplateSummary[]> => {
    const query = new URLSearchParams();
    if (params?.objective && params.objective !== 'all') query.set('objective', params.objective);
    if (params?.niche && params.niche !== 'all') query.set('niche', params.niche);
    if (params?.complexity && params.complexity !== 'all') query.set('complexity', params.complexity);
    if (typeof params?.featured === 'boolean') query.set('featured', String(params.featured));
    
    const qs = query.toString() ? `?${query}` : '';
    const res = await apiFetch(`${BASE(orgId)}/forms/config/templates${qs}`);
    if (!res.ok) throw new Error('Failed to fetch templates');
    const data = await res.json();
    return data.data;
};

// ─── Create Forms ─────────────────────────────────────────────────────────────

export const createForm = async (orgId: string, payload: CreateFormPayload): Promise<FormResponse> => {
    const res = await apiFetch(`${BASE(orgId)}/forms/create`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create form');
    }
    const data = await res.json();
    return data.data;
};

export const createFormFromTemplate = async (orgId: string, payload: CreateFromTemplatePayload): Promise<FormResponse> => {
    const res = await apiFetch(`${BASE(orgId)}/forms/create-from-template`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create form from template');
    }
    const data = await res.json();
    return data.data;
};

export const aiGenerateForm = async (orgId: string, payload: AiGeneratePayload): Promise<AiGeneratedFormPreview> => {
    const res = await apiFetch(`${BASE(orgId)}/forms/ai-generate`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to generate form');
    }
    const data = await res.json();
    return data.data;
};

export const aiRefineForm = async (orgId: string, payload: AiRefinePayload): Promise<AiGeneratedFormPreview> => {
    const res = await apiFetch(`${BASE(orgId)}/forms/ai-refine`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to refine form');
    }
    const data = await res.json();
    return data.data;
};

export const aiSaveForm = async (orgId: string, payload: AiSavePayload): Promise<FormResponse> => {
    const res = await apiFetch(`${BASE(orgId)}/forms/ai-save`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save AI form');
    }
    const data = await res.json();
    return data.data;
};

// ─── Update & Lifecycle ───────────────────────────────────────────────────────

export const updateForm = async (orgId: string, formId: string, payload: UpdateFormPayload): Promise<FormResponse> => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update form');
    }
    const data = await res.json();
    return data.data;
};

export const publishForm = async (orgId: string, formId: string) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/publish`, { method: 'POST' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to publish form');
    }
    return res.json();
};

export const unpublishForm = async (orgId: string, formId: string) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/unpublish`, { method: 'POST' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to unpublish form');
    }
    return res.json();
};

export const duplicateForm = async (orgId: string, formId: string): Promise<FormResponse> => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/duplicate`, { method: 'POST' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to duplicate form');
    }
    const data = await res.json();
    return data.data;
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getFormAnalyticsOverview = async (
    orgId: string,
    formId: string,
    params?: { period?: 'day' | 'week' | 'month'; days?: number },
) => {
    const query = new URLSearchParams();
    if (params?.period) query.set('period', params.period);
    if (params?.days) query.set('days', String(params.days));
    const qs = query.toString() ? `?${query}` : '';
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/analytics${qs}`);
    if (!res.ok) throw new Error('Failed to fetch analytics overview');
    const data = await res.json();
    return data.data;
};

export const getFormAnalyticsFields = async (orgId: string, formId: string) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/analytics/fields`);
    if (!res.ok) throw new Error('Failed to fetch field analytics');
    const data = await res.json();
    return data.data;
};

export const getFormAnalyticsFieldDetail = async (
    orgId: string,
    formId: string,
    fieldId: string,
    params?: { page?: number; pageSize?: number },
) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    const qs = query.toString() ? `?${query}` : '';
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/analytics/fields/${fieldId}${qs}`);
    if (!res.ok) throw new Error('Failed to fetch field detail');
    const data = await res.json();
    return data.data;
};

export const saveChatConfig = async (
    orgId: string,
    formId: string,
    config: {
        aiName?: string;
        tone?: string;
        avatar?: string;
        welcomeMessage?: string;
        allowedDomains?: string[];
        embedMode?: 'inline_iframe' | 'popup_launcher' | 'floating_bubble';
        embedPosition?: 'bottom-right' | 'bottom-left';
        embedAutoOpenDelayMs?: number;
        embedThemeInherit?: boolean;
    },
) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/chat-config`, {
        method: 'PATCH',
        body: JSON.stringify(config),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save chat config');
    }
    return res.json();
};

export const setLinkExpiry = async (
    orgId: string,
    formId: string,
    expiresAt: string | null,   // ISO date string or null to clear
) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/link-expiry`, {
        method: 'PATCH',
        body: JSON.stringify({ expiresAt }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to set link expiry');
    }
    return res.json();
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardStats = async (orgId: string, params?: { days?: number }) => {
    const query = new URLSearchParams();
    if (params?.days) query.set('days', String(params.days));
    const qs = query.toString() ? `?${query}` : '';
    const res = await apiFetch(`${BASE(orgId)}/dashboard/stats${qs}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    const data = await res.json();
    return data.data;
};

export const getDashboardActivity = async (
    orgId: string,
    params?: { page?: number; pageSize?: number; action?: string; event?: string },
) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.action) query.set('action', params.action);
    if (params?.event) query.set('event', params.event);
    const qs = query.toString() ? `?${query}` : '';
    const res = await apiFetch(`${BASE(orgId)}/dashboard/activity${qs}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard activity');
    const data = await res.json();
    return data.data;
};

export const getDashboardWidgetHandshakeTelemetry = async (
    orgId: string,
    params?: { days?: number; limit?: number },
) => {
    const query = new URLSearchParams();
    if (params?.days) query.set('days', String(params.days));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query}` : '';
    const res = await apiFetch(`${BASE(orgId)}/dashboard/telemetry/widget-handshake${qs}`);
    if (!res.ok) throw new Error('Failed to fetch widget handshake telemetry');
    const data = await res.json();
    return data.data;
};

// ─── Automations ─────────────────────────────────────────────────────────────

export const getFormAutomations = async (orgId: string, formId: string) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/automations`);
    if (!res.ok) throw new Error('Failed to fetch automations');
    return res.json();
};

export const syncFormAutomations = async (orgId: string, formId: string, automations: any[]) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/automations/sync`, {
        method: 'POST',
        body: JSON.stringify({ automations }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to sync automations');
    }
    return res.json();
};

export const updateOrgForm = async (orgId: string, formId: string, payload: any) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update form');
    }
    return res.json();
};

// ─── Billing & Stripe ─────────────────────────────────────────────────────────

export const createStripeCheckoutSession = async (orgId: string, priceId: string, successUrl: string, cancelUrl: string) => {
    const res = await apiFetch('/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ organizationId: orgId, priceId, successUrl, cancelUrl }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create checkout session');
    }
    return res.json();
};

export const createStripePortalSession = async (orgId: string, returnUrl: string) => {
    const res = await apiFetch('/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ organizationId: orgId, returnUrl }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create portal session');
    }
    return res.json();
};
