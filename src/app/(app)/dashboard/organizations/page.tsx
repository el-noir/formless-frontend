"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2, Plus, Building2, Users, ChevronRight,
    Crown, Shield, User, Zap
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { useOrgStore } from "@/stores/orgStore";
import { getMyOrganizations } from "@/lib/api/organizations";
import Link from "next/link";

const ROLE_CONFIG = {
    owner: { label: 'Owner', icon: Crown, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    admin: { label: 'Admin', icon: Shield, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    member: { label: 'Member', icon: User, color: 'text-gray-400 bg-gray-800 border-gray-700' },
};

export default function OrganizationsPage() {
    const router = useRouter();
    const { isLoading } = useRequireAuth();
    const { accessToken } = useAuthStore();
    const { setOrganizations, setCurrentOrg, currentOrgId } = useOrgStore();
    const [orgs, setOrgs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) return;
        (async () => {
            try {
                const data = await getMyOrganizations();
                setOrgs(data);
                setOrganizations(data.map((o: any) => ({
                    id: o.id,
                    name: o.name,
                    plan: o.plan,
                    myRole: o.myRole,
                    memberCount: o.memberCount,
                })));
            } catch (e: any) {
                setError(e.message || 'Failed to load organizations');
            } finally {
                setLoading(false);
            }
        })();
    }, [accessToken]);

    if (isLoading || loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF] mx-auto mb-4" />
                    <p className="text-gray-400">Loading your organizations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <div className="max-w-5xl">

                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Organizations</h1>
                        <p className="text-gray-400">Manage your teams and their form libraries</p>
                    </div>
                    <Link
                        href="/dashboard/organizations/new"
                        className="flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#5a72e0] text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" /> New Organization
                    </Link>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">{error}</div>
                )}

                {/* List */}
                {orgs.length > 0 ? (
                    <div className="space-y-3">
                        {orgs.map((org) => {
                            const roleConf = ROLE_CONFIG[org.myRole as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.member;
                            const RoleIcon = roleConf.icon;
                            const isActive = currentOrgId === org.id;

                            return (
                                <div
                                    key={org.id}
                                    className={`bg-[#0f0f14] border rounded-xl p-5 hover:border-gray-700 transition-all cursor-pointer ${isActive ? 'border-[#9A6BFF]/50 ring-1 ring-[#9A6BFF]/20' : 'border-gray-800'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9A6BFF]/20 to-[#9A6BFF]/20 border border-[#9A6BFF]/20 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-[#9A6BFF]" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                                                    {isActive && (
                                                        <span className="text-xs bg-[#9A6BFF]/10 text-[#9A6BFF] border border-[#9A6BFF]/20 px-2 py-0.5 rounded-full">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Zap className="w-3.5 h-3.5" />
                                                        {org.plan}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${roleConf.color}`}>
                                                <RoleIcon className="w-3 h-3" />
                                                {roleConf.label}
                                            </span>
                                            {!isActive && (
                                                <button
                                                    onClick={() => setCurrentOrg(org.id)}
                                                    className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Switch
                                                </button>
                                            )}
                                            <Link
                                                href={`/dashboard/organizations/${org.id}`}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-800 rounded-xl p-16 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#9A6BFF]/10 to-[#9A6BFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-8 h-8 text-[#9A6BFF]" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No organizations yet</h3>
                        <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                            Create your first organization to start managing forms and collaborating with your team.
                        </p>
                        <Link
                            href="/dashboard/organizations/new"
                            className="inline-flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#5a72e0] text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Create Organization
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
