import { apiFetch } from "./apiFetch";

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
