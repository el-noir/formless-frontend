'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface OrgSummary {
    id: string;
    name: string;
    plan: string;
    myRole: 'owner' | 'admin' | 'member';
    memberCount: number;
}

interface OrgState {
    organizations: OrgSummary[];
    currentOrgId: string | null;

    setOrganizations: (orgs: OrgSummary[]) => void;
    setCurrentOrg: (orgId: string) => void;
    addOrganization: (org: OrgSummary) => void;
    removeOrganization: (orgId: string) => void;
    clearOrgs: () => void;

    // Derived helpers
    getCurrentOrg: () => OrgSummary | null;
    getUserRoleInCurrentOrg: () => OrgSummary['myRole'] | null;
    isAdminOfCurrentOrg: () => boolean;
}

export const useOrgStore = create<OrgState>()(
    persist(
        (set, get) => ({
            organizations: [],
            currentOrgId: null,

            setOrganizations: (orgs) => {
                const current = String(get().currentOrgId || '');
                // Auto-select first org if none selected, or keep existing if still valid
                const validCurrent = orgs.find((o) => String(o.id) === current);
                set({
                    organizations: orgs,
                    currentOrgId: validCurrent ? String(validCurrent.id) : (orgs[0] ? String(orgs[0].id) : null),
                });
            },

            setCurrentOrg: (orgId) => set({ currentOrgId: orgId ? String(orgId) : null }),

            addOrganization: (org) =>
                set((state) => ({
                    organizations: [...state.organizations, org],
                    currentOrgId: state.currentOrgId ?? org.id,
                })),

            removeOrganization: (orgId) =>
                set((state) => {
                    const remaining = state.organizations.filter((o) => o.id !== orgId);
                    return {
                        organizations: remaining,
                        currentOrgId: state.currentOrgId === orgId ? (remaining[0]?.id ?? null) : state.currentOrgId,
                    };
                }),

            clearOrgs: () => set({ organizations: [], currentOrgId: null }),

            getCurrentOrg: () => {
                const { organizations, currentOrgId } = get();
                return organizations.find((o) => o.id === currentOrgId) ?? null;
            },

            getUserRoleInCurrentOrg: () => {
                return get().getCurrentOrg()?.myRole ?? null;
            },

            isAdminOfCurrentOrg: () => {
                const role = get().getUserRoleInCurrentOrg();
                return role === 'owner' || role === 'admin';
            },
        }),
        {
            name: 'org-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                organizations: state.organizations,
                currentOrgId: state.currentOrgId,
            }),
        }
    )
);
