"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Settings, Building2, Users, Shield, Save,
    Loader2, Check, Crown, UserCog, User as UserIcon, Trash2
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import {
    getOrganization, updateOrganization, getOrgMembers, removeMember
} from "@/lib/api/organizations";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    owner: { label: "Owner", icon: Crown, color: "text-yellow-400" },
    admin: { label: "Admin", icon: UserCog, color: "text-[#9A6BFF]" },
    member: { label: "Member", icon: UserIcon, color: "text-gray-400" },
};

export default function OrgSettingsPage() {
    const { orgId } = useParams() as { orgId: string };
    const { isLoading } = useRequireAuth();
    const { accessToken, user } = useAuthStore();

    // Org state
    const [org, setOrg] = useState<any>(null);
    const [orgLoading, setOrgLoading] = useState(true);
    const [orgName, setOrgName] = useState("");
    const [orgEmail, setOrgEmail] = useState("");
    const [orgWebsite, setOrgWebsite] = useState("");
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    // Members state
    const [members, setMembers] = useState<any[]>([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    // Active section
    const [activeSection, setActiveSection] = useState<"general" | "members">("general");

    useEffect(() => {
        if (!accessToken || !orgId) return;
        Promise.all([
            getOrganization(orgId).then((data) => {
                setOrg(data);
                setOrgName(data?.name ?? "");
                setOrgEmail(data?.email ?? "");
                setOrgWebsite(data?.website ?? "");
                setOrgLoading(false);
            }),
            getOrgMembers(orgId).then((data) => {
                setMembers(data ?? []);
                setMembersLoading(false);
            }),
        ]).catch(() => { setOrgLoading(false); setMembersLoading(false); });
    }, [accessToken, orgId]);

    const handleSave = async () => {
        setSaveStatus("saving");
        try {
            await updateOrganization(orgId, {
                name: orgName.trim(),
                email: orgEmail.trim() || undefined,
                website: orgWebsite.trim() || undefined,
            });
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2500);
        } catch {
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Remove this member from the organization?")) return;
        setRemovingId(userId);
        try {
            await removeMember(orgId, userId);
            setMembers((prev) => prev.filter((m) => (m.userId ?? m.user?._id ?? m._id) !== userId));
        } catch (e: any) {
            alert(e.message || "Failed to remove member");
        } finally {
            setRemovingId(null);
        }
    };

    if (isLoading || orgLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF]" />
            </div>
        );
    }

    const sidebarSections = [
        { id: "general", label: "General", icon: Building2 },
        { id: "members", label: "Members", icon: Users },
    ] as const;

    const currentUserRole = members.find(
        (m) => (m.userId ?? m.user?._id ?? m._id) === user?._id
    )?.role ?? "member";

    const isOwnerOrAdmin = currentUserRole === "owner" || currentUserRole === "admin";

    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <div className="max-w-4xl">
                <DashboardBreadcrumbs
                    backHref={`/dashboard/${orgId}`}
                    backLabel="Back to Overview"
                />

                <div className="mb-8">
                    <h1 className="text-xl font-semibold text-gray-100 tracking-tight mb-1 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-500" /> Organization Settings
                    </h1>
                    <p className="text-gray-500 text-sm">{org?.name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
                    {/* Sidebar nav */}
                    <nav className="space-y-1">
                        {sidebarSections.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveSection(id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${activeSection === id
                                    ? "bg-[#1C1C22] text-white font-medium"
                                    : "text-gray-500 hover:text-white hover:bg-white/[0.02]"
                                    }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {label}
                            </button>
                        ))}
                    </nav>

                    {/* Main content */}
                    <div className="space-y-6">
                        {/* ─── General ─────────────────────────────────── */}
                        {activeSection === "general" && (
                            <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md overflow-hidden shadow-sm">
                                <div className="px-5 py-4 border-b border-gray-800/80">
                                    <h3 className="text-sm font-medium text-gray-200">Organization Info</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Basic details visible to all members</p>
                                </div>

                                <div className="px-5 py-5 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                                            Organization Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            disabled={!isOwnerOrAdmin}
                                            className="w-full bg-[#111116] border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#9A6BFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="e.g. Acme Corp"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                                            Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            value={orgEmail}
                                            onChange={(e) => setOrgEmail(e.target.value)}
                                            disabled={!isOwnerOrAdmin}
                                            className="w-full bg-[#111116] border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#9A6BFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="hello@yourorg.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            value={orgWebsite}
                                            onChange={(e) => setOrgWebsite(e.target.value)}
                                            disabled={!isOwnerOrAdmin}
                                            className="w-full bg-[#111116] border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#9A6BFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="https://yourcompany.com"
                                        />
                                    </div>
                                </div>

                                {isOwnerOrAdmin && (
                                    <div className="px-5 py-4 border-t border-gray-800/80 flex items-center justify-between">
                                        <span className={`text-xs transition-all ${saveStatus === "saved" ? "text-green-400" :
                                            saveStatus === "error" ? "text-red-400" : "text-transparent"
                                            }`}>
                                            {saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "Save failed" : "."}
                                        </span>
                                        <button
                                            onClick={handleSave}
                                            disabled={saveStatus === "saving" || !orgName.trim()}
                                            className="flex items-center gap-1.5 bg-[#9A6BFF] hover:bg-[#8555e8] disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors"
                                        >
                                            {saveStatus === "saving" ? (
                                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                                            ) : saveStatus === "saved" ? (
                                                <><Check className="w-3.5 h-3.5" /> Saved</>
                                            ) : (
                                                <><Save className="w-3.5 h-3.5" /> Save Changes</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Members ────────────────────────────────── */}
                        {activeSection === "members" && (
                            <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md overflow-hidden shadow-sm">
                                <div className="px-5 py-4 border-b border-gray-800/80 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-200">Members</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {members.length} member{members.length !== 1 ? "s" : ""} in this organization
                                        </p>
                                    </div>
                                </div>

                                {membersLoading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#9A6BFF]" />
                                    </div>
                                ) : members.length === 0 ? (
                                    <div className="py-10 text-center text-gray-500 text-sm">No members found.</div>
                                ) : (
                                    <div className="divide-y divide-gray-800/80">
                                        {members.map((member) => {
                                            const memberId = member.userId ?? member.user?._id ?? member._id;
                                            const memberName = member.user?.name ?? member.name ?? "Unknown";
                                            const memberEmail = member.user?.email ?? member.email ?? "";
                                            const role = member.role ?? "member";
                                            const roleCfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.member;
                                            const RoleIcon = roleCfg.icon;
                                            const isCurrentUser = memberId === user?._id;
                                            const canRemove = isOwnerOrAdmin && !isCurrentUser && role !== "owner";

                                            return (
                                                <div key={memberId} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.01] transition-colors">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-8 h-8 rounded-full bg-[#1C1C22] border border-gray-800 flex items-center justify-center shrink-0">
                                                            <span className="text-xs font-medium text-gray-300 uppercase">
                                                                {memberName.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm text-gray-200 font-medium truncate">
                                                                {memberName}
                                                                {isCurrentUser && (
                                                                    <span className="ml-1.5 text-[10px] text-gray-600 font-normal">(you)</span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">{memberEmail}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className={`flex items-center gap-1 text-xs font-medium ${roleCfg.color}`}>
                                                            <RoleIcon className="w-3 h-3" />
                                                            {roleCfg.label}
                                                        </span>
                                                        {canRemove && (
                                                            <button
                                                                onClick={() => handleRemoveMember(memberId)}
                                                                disabled={removingId === memberId}
                                                                className="p-1.5 text-gray-700 hover:text-red-400 transition-colors rounded disabled:opacity-50"
                                                                title="Remove member"
                                                            >
                                                                {removingId === memberId
                                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    : <Trash2 className="w-3.5 h-3.5" />
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
