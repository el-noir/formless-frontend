"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, FileText, Trash2, Building2 } from "lucide-react";
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);

    const handleShare = async (formId: string) => {
        if (!currentOrgId) return;
        setIsGeneratingLink(true);
        try {
            const { generateChatLink } = await import('@/lib/api/organizations');
            const data = await generateChatLink(currentOrgId, formId);
            const fullUrl = `${window.location.origin}${data.data.url}`;
            setShareLink(fullUrl);
            setShareModalOpen(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to generate link";
            alert(msg);
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        alert("Copied to clipboard!");
    };

    if (isLoading || loadingForms) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF] mx-auto mb-4" />
                    <p className="text-gray-400">Loading forms...</p>
                </div>
            </div>
        );
    }

    // No active org — prompt to create or switch
    if (!currentOrgId || !currentOrg) {
        return (
            <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
                <div className="max-w-xl mx-auto text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#9A6BFF]/10 to-[#9A6BFF]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Building2 className="w-8 h-8 text-[#9A6BFF]" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">No active organization</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Forms are owned by organizations. Create or join an organization first, then import your Google Forms into it.
                    </p>
                    <Link
                        href="/dashboard/organizations"
                        className="inline-flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#5a72e0] text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                    >
                        Go to Organizations
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <div className="max-w-7xl">

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">My Forms</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{currentOrg.name}</span>
                            <span>·</span>
                            <Link href="/dashboard/organizations" className="hover:text-gray-300 transition-colors">Switch org</Link>
                        </div>
                    </div>
                    {isAdmin && (
                        <Link
                            href="/dashboard/forms/import"
                            className="flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#5a72e0] text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
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
                                    <div className="p-2 bg-[#9A6BFF]/10 rounded-lg text-[#9A6BFF]">
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
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={() => handleShare(form.id)}
                                            disabled={isGeneratingLink}
                                            className="flex-1 bg-[#9A6BFF]/10 hover:bg-[#9A6BFF]/20 text-[#9A6BFF] text-sm py-2 px-4 rounded-lg text-center transition-colors disabled:opacity-50"
                                        >
                                            Share AI Chat
                                        </button>
                                        <Link
                                            href={`/dashboard/organizations/${currentOrgId}/forms/${form.id}`}
                                            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg text-center transition-colors"
                                        >
                                            View
                                        </Link>
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
                                href="/dashboard/forms/import"
                                className="inline-flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#5a72e0] text-white font-medium py-2 px-6 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Import Google Form
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Share Modal */}
            {shareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-white mb-4">Share AI Chat</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Anyone with this link can interact with the AI to complete this form. They do not need an account.
                        </p>
                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                readOnly
                                value={shareLink}
                                className="flex-1 bg-black/50 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9A6BFF]"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={copyToClipboard}
                                className="bg-[#9A6BFF] hover:bg-[#5a72e0] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShareModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
