"use client";

import React, { useEffect, useState } from "react";
import { Background } from "@/components/Background";
import { Loader2, Plus, FileText, Trash2, ExternalLink, Building2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { useOrgStore } from "@/stores/orgStore";
import { getOrgForms, deleteOrgForm } from "@/lib/api/organizations";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function FormsPage() {
    const { isLoading } = useRequireAuth();
    const { accessToken } = useAuthStore();
    const { currentOrgId, getCurrentOrg, isAdminOfCurrentOrg } = useOrgStore();

    const [forms, setForms] = useState<any[]>([]);
    const [loadingForms, setLoadingForms] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentOrg = getCurrentOrg();
    const isAdmin = isAdminOfCurrentOrg();

    useEffect(() => {
        if (!accessToken || !currentOrgId) {
            setLoadingForms(false);
            return;
        }
        setLoadingForms(true);
        setError(null);
        getOrgForms(currentOrgId)
            .then((data) => setForms(data.forms || []))
            .catch((err) => setError(err?.message || "Failed to fetch forms"))
            .finally(() => setLoadingForms(false));
    }, [accessToken, currentOrgId]);

    const handleDelete = async (id: string) => {
        if (!currentOrgId || !confirm("Remove this form from the organization?")) return;
        try {
            await deleteOrgForm(currentOrgId, id);
            setForms(forms.filter((f) => f.id !== id));
        } catch {
            alert("Failed to delete form");
        }
    };

    if (isLoading || loadingForms) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
                <Background />
                <div className="text-center relative z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6E8BFF] mx-auto mb-4" />
                    <p className="text-gray-400">Loading forms...</p>
                </div>
            </div>
        );
    }

    // No active org — prompt to create or switch
    if (!currentOrgId || !currentOrg) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative">
                <Background />
                <div className="max-w-xl mx-auto relative z-10 text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#6E8BFF]/10 to-[#9A6BFF]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Building2 className="w-8 h-8 text-[#6E8BFF]" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">No active organization</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Forms are owned by organizations. Create or join an organization first, then import your Google Forms into it.
                    </p>
                    <Link
                        href="/organizations"
                        className="inline-flex items-center gap-2 bg-[#6E8BFF] hover:bg-[#5a72e0] text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                    >
                        Go to Organizations
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative">
            <Background />
            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">My Forms</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{currentOrg.name}</span>
                            <span>·</span>
                            <Link href="/organizations" className="hover:text-gray-300 transition-colors">Switch org</Link>
                        </div>
                    </div>
                    {isAdmin && (
                        <Link
                            href={`/organizations/${currentOrgId}/import`}
                            className="flex items-center gap-2 bg-[#6E8BFF] hover:bg-[#5a72e0] text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Import Form
                        </Link>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* Grid */}
                {forms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forms.map((form) => (
                            <div
                                key={form.id}
                                className="bg-[#0f0f14] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors flex flex-col h-full group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-[#6E8BFF]/10 rounded-lg text-[#6E8BFF]">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    {form.status === 'ACTIVE' && (
                                        <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">{form.title}</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                                    {form.description || "No description provided."}
                                </p>

                                <div className="border-t border-gray-800 pt-4 mt-auto">
                                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                                        <span>{form.questionCount ?? 0} Questions</span>
                                        <span>
                                            {form.lastSynced
                                                ? formatDistanceToNow(new Date(form.lastSynced), { addSuffix: true })
                                                : 'Never synced'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/organizations/${currentOrgId}/forms/${form.id}`}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm py-2 px-4 rounded-lg text-center transition-colors"
                                        >
                                            View
                                        </Link>
                                        {form.sourceUrl && (
                                            <a
                                                href={form.sourceUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"
                                                title="Open source form"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDelete(form.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title="Delete form"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-800 rounded-xl p-12 text-center">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No forms in this organization</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            {isAdmin
                                ? "Import a Google Form to get started."
                                : "No forms have been imported yet. Ask an admin to import one."}
                        </p>
                        {isAdmin && (
                            <Link
                                href={`/organizations/${currentOrgId}/import`}
                                className="inline-flex items-center gap-2 bg-[#6E8BFF] hover:bg-[#5a72e0] text-white font-medium py-2 px-6 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Import Google Form
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
