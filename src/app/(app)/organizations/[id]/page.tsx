"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Background } from "@/components/Background";
import {
    Loader2, ArrowLeft, Building2, FileText, Users, Settings,
    Plus, Trash2, ExternalLink, Crown, Shield, User as UserIcon,
    UserPlus, Check
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { useOrgStore } from "@/stores/orgStore";
import {
    getOrganization, getOrgForms, getOrgMembers,
    inviteMember, removeMember, deleteOrgForm
} from "@/lib/api/organizations";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const ROLE_CONFIG = {
    owner: { label: 'Owner', icon: Crown, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    admin: { label: 'Admin', icon: Shield, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    member: { label: 'Member', icon: UserIcon, color: 'text-gray-400 bg-gray-800 border-gray-700' },
};

type Tab = 'forms' | 'members' | 'settings';

export default function OrganizationDetailPage() {
    const { id: orgId } = useParams() as { id: string };
    const router = useRouter();
    const { isLoading } = useRequireAuth();
    const { accessToken } = useAuthStore();
    const { currentOrgId, setCurrentOrg } = useOrgStore();

    const [org, setOrg] = useState<any>(null);
    const [forms, setForms] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('forms');

    // Invite state
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken || !orgId) return;
        (async () => {
            setLoading(true);
            try {
                const [orgData, formsData, membersData] = await Promise.all([
                    getOrganization(orgId),
                    getOrgForms(orgId),
                    getOrgMembers(orgId),
                ]);
                setOrg(orgData);
                setForms(formsData.forms || []);
                setMembers(membersData);
            } catch (e: any) {
                setError(e.message || 'Failed to load organization');
            } finally {
                setLoading(false);
            }
        })();
    }, [accessToken, orgId]);

    const isAdmin = org?.myRole === 'owner' || org?.myRole === 'admin';

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        setInviting(true);
        setInviteError(null);
        try {
            await inviteMember(orgId, inviteEmail, inviteRole);
            const updated = await getOrgMembers(orgId);
            setMembers(updated);
            setInviteEmail('');
        } catch (e: any) {
            setInviteError(e.message || 'Invite failed');
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm('Remove this member?')) return;
        try {
            await removeMember(orgId, userId);
            setMembers(members.filter((m) => m.userId !== userId));
        } catch (e: any) { alert(e.message); }
    };

    const handleDeleteForm = async (formId: string) => {
        if (!confirm('Delete this form from the organization?')) return;
        try {
            await deleteOrgForm(orgId, formId);
            setForms(forms.filter((f) => f.id !== formId));
        } catch (e: any) { alert(e.message); }
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
                <Background />
                <div className="text-center relative z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF] mx-auto mb-4" />
                    <p className="text-gray-400">Loading organization...</p>
                </div>
            </div>
        );
    }

    if (error || !org) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative">
                <Background />
                <div className="max-w-3xl mx-auto relative z-10 text-center">
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl mb-6">
                        <p>{error || 'Organization not found'}</p>
                    </div>
                    <button onClick={() => router.push('/organizations')} className="text-[#9A6BFF] hover:underline">
                        ← Back to organizations
                    </button>
                </div>
            </div>
        );
    }

    const roleConf = ROLE_CONFIG[org.myRole as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.member;
    const RoleIcon = roleConf.icon;
    const tabs = [
        { id: 'forms', label: 'Forms', icon: FileText, count: forms.length },
        { id: 'members', label: 'Members', icon: Users, count: members.length },
        { id: 'settings', label: 'Settings', icon: Settings, count: null },
    ];

    return (
        <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative">
            <Background />
            <div className="max-w-5xl mx-auto relative z-10">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/organizations')}
                        className="flex items-center text-gray-400 hover:text-white transition-colors mb-5 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> All organizations
                    </button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#9A6BFF]/20 to-[#9A6BFF]/20 border border-[#9A6BFF]/20 flex items-center justify-center">
                                <Building2 className="w-7 h-7 text-[#9A6BFF]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-white">{org.name}</h1>
                                    <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${roleConf.color}`}>
                                        <RoleIcon className="w-3 h-3" />
                                        {roleConf.label}
                                    </span>
                                    {currentOrgId !== orgId && (
                                        <button
                                            onClick={() => setCurrentOrg(orgId)}
                                            className="text-xs text-[#9A6BFF] hover:underline"
                                        >
                                            Set active
                                        </button>
                                    )}
                                    {currentOrgId === orgId && (
                                        <span className="flex items-center gap-1 text-xs text-green-400">
                                            <Check className="w-3 h-3" /> Active org
                                        </span>
                                    )}
                                </div>
                                {org.description && (
                                    <p className="text-gray-400 text-sm mt-0.5">{org.description}</p>
                                )}
                            </div>
                        </div>

                        {isAdmin && (
                            <Link
                                href={`/organizations/${orgId}/import`}
                                className="flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#5a72e0] text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Import Form
                            </Link>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 border-b border-gray-800 mb-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition-colors relative ${activeTab === tab.id ? 'text-[#9A6BFF]' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== null && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-[#9A6BFF]/20 text-[#9A6BFF]' : 'bg-gray-800 text-gray-500'}`}>
                                        {tab.count}
                                    </span>
                                )}
                                {activeTab === tab.id && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#9A6BFF]" />}
                            </button>
                        );
                    })}
                </div>

                {/* ── Forms Tab ─────────────────────────────────────────────── */}
                {activeTab === 'forms' && (
                    <div>
                        {forms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {forms.map((form) => (
                                    <div key={form.id} className="bg-[#0f0f14] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 bg-[#9A6BFF]/10 rounded-lg">
                                                <FileText className="w-5 h-5 text-[#9A6BFF]" />
                                            </div>
                                            {form.status === 'ACTIVE' && (
                                                <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Active</span>
                                            )}
                                        </div>
                                        <h3 className="text-base font-semibold text-white mb-1 line-clamp-1">{form.title}</h3>
                                        <p className="text-gray-500 text-xs mb-3 flex-grow">{form.questionCount} questions</p>
                                        <div className="flex items-center gap-2 mt-auto">
                                            <Link
                                                href={`/organizations/${orgId}/forms/${form.id}`}
                                                className="flex-1 text-center text-sm bg-white/5 hover:bg-white/10 text-white py-2 px-3 rounded-lg transition-colors"
                                            >
                                                View
                                            </Link>
                                            {form.sourceUrl && (
                                                <a href={form.sourceUrl} target="_blank" rel="noreferrer"
                                                    className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteForm(form.id)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-800 rounded-xl p-12 text-center">
                                <FileText className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                                <h3 className="text-white font-medium mb-2">No forms yet</h3>
                                <p className="text-gray-500 text-sm mb-5">Import a Google Form into this organization to get started.</p>
                                {isAdmin && (
                                    <Link href={`/organizations/${orgId}/import`}
                                        className="inline-flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#5a72e0] text-white text-sm font-medium py-2 px-5 rounded-lg transition-colors">
                                        <Plus className="w-4 h-4" /> Import Form
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Members Tab ───────────────────────────────────────────── */}
                {activeTab === 'members' && (
                    <div className="space-y-4">
                        {/* Invite form — admin only */}
                        {isAdmin && (
                            <form onSubmit={handleInvite} className="bg-[#0f0f14] border border-gray-800 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-[#9A6BFF]" /> Invite Member
                                </h3>
                                {inviteError && (
                                    <p className="text-red-400 text-sm mb-3">{inviteError}</p>
                                )}
                                <div className="flex gap-3">
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="teammate@company.com"
                                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#9A6BFF]"
                                    />
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                                        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#9A6BFF]"
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={inviting || !inviteEmail}
                                        className="bg-[#9A6BFF] hover:bg-[#5a72e0] disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                                    >
                                        {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Members list */}
                        <div className="bg-[#0f0f14] border border-gray-800 rounded-xl overflow-hidden">
                            {members.map((member, i) => {
                                const conf = ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.member;
                                const MIcon = conf.icon;
                                const canRemove = isAdmin && member.role !== 'owner';
                                return (
                                    <div key={member.userId} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-gray-800' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center">
                                                <UserIcon className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-medium">{member.userId}</p>
                                                <p className="text-xs text-gray-500">
                                                    Joined {member.joinedAt ? formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true }) : '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${conf.color}`}>
                                                <MIcon className="w-3 h-3" />
                                                {conf.label}
                                            </span>
                                            {canRemove && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.userId)}
                                                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Settings Tab ──────────────────────────────────────────── */}
                {activeTab === 'settings' && (
                    <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-5">Organization Settings</h3>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-gray-500 mb-1">Plan</dt>
                                <dd className="text-white capitalize font-medium">{org.plan}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500 mb-1">Form limit</dt>
                                <dd className="text-white">{org.limits?.maxForms ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500 mb-1">Member limit</dt>
                                <dd className="text-white">{org.limits?.maxMembers ?? '—'}</dd>
                            </div>
                        </dl>
                    </div>
                )}
            </div>
        </div>
    );
}
