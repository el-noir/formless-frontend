"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, FileText, Trash2, Building2, Wand2, ExternalLink, Clock } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { useOrgStore } from "@/stores/orgStore";
import { getOrgForms, deleteOrgForm } from "@/lib/api/organizations";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";

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
                <Loader2 className="w-6 h-6 animate-spin text-[#9A6BFF]" />
            </div>
        );
    }

    if (!currentOrgId || !currentOrg) {
        return (
            <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
                <div className="max-w-sm mx-auto text-center py-16">
                    <div className="w-10 h-10 bg-[#1C1C22] border border-gray-800 rounded-md flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-5 h-5 text-gray-500" />
                    </div>
                    <h2 className="text-sm font-semibold text-gray-200 mb-1">No active organization</h2>
                    <p className="text-gray-500 text-xs mb-5">
                        Select or create an organization to manage forms.
                    </p>
                    <Link
                        href="/dashboard/organizations"
                        className="inline-flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#8555e8] text-white text-sm font-medium py-1.5 px-4 rounded-md transition-colors"
                    >
                        Go to Organizations
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <DashboardBreadcrumbs
                backHref={`/dashboard/${currentOrgId}`}
                backLabel="Back to Overview"
            />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-semibold text-gray-100 tracking-tight mb-1">Forms</h2>
                    <p className="text-gray-500 text-sm flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {currentOrg.name}
                        <span className="text-gray-700">·</span>
                        <span>{forms.length} form{forms.length !== 1 ? 's' : ''}</span>
                    </p>
                </div>
                {isAdmin && (
                    <Link
                        href={`/dashboard/${currentOrgId}/forms/import`}
                        className="flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#8555e8] text-white text-sm font-medium py-1.5 px-4 rounded-md transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Import Form
                    </Link>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-md mb-6">
                    {error}
                </div>
            )}

            {forms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {forms.map((form) => (
                        <div
                            key={form.id}
                            className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-4 hover:border-gray-700/80 transition-colors flex flex-col shadow-sm group"
                        >
                            {/* Card top */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-[#1C1C22] border border-gray-800 rounded-md text-gray-400 group-hover:text-[#9A6BFF] transition-colors">
                                    <FileText className="w-4 h-4" />
                                </div>
                                {form.status === 'ACTIVE' && (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                        Active
                                    </span>
                                )}
                            </div>

                            {/* Title & meta */}
                            <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">{form.title}</h3>
                            <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                                {form.questionCount ?? 0} questions
                            </p>

                            {/* Divider + actions */}
                            <div className="border-t border-gray-800/80 pt-3 mt-auto">
                                <div className="flex items-center gap-1.5 mb-2 text-[10px] text-gray-600">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                        {form.lastSynced
                                            ? formatDistanceToNow(new Date(form.lastSynced), { addSuffix: true })
                                            : 'Never synced'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Link
                                        href={`/dashboard/${currentOrgId}/forms/${form.id}/builder`}
                                        className="flex items-center gap-1.5 flex-1 justify-center text-xs text-gray-400 hover:text-white bg-[#111116] hover:bg-[#1C1C22] border border-gray-800 py-1.5 px-2 rounded transition-colors"
                                    >
                                        <Wand2 className="w-3 h-3" /> Configure
                                    </Link>
                                    <Link
                                        href={`/dashboard/${currentOrgId}/forms/${form.id}`}
                                        className="flex items-center gap-1.5 flex-1 justify-center text-xs text-gray-400 hover:text-white bg-[#111116] hover:bg-[#1C1C22] border border-gray-800 py-1.5 px-2 rounded transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" /> View
                                    </Link>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(form.id)}
                                            title="Delete form"
                                            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors border border-gray-800"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border border-dashed border-gray-800 rounded-md p-12 text-center">
                    <div className="w-10 h-10 bg-[#1C1C22] border border-gray-800 rounded-md flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-200 mb-1">No forms yet</h3>
                    <p className="text-gray-500 text-xs mb-5 max-w-xs mx-auto">
                        {isAdmin
                            ? "Import a Google Form to get started."
                            : "No forms have been imported yet. Ask an admin to import one."}
                    </p>
                    {isAdmin && (
                        <Link
                            href={`/dashboard/${currentOrgId}/forms/import`}
                            className="inline-flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#8555e8] text-white text-sm font-medium py-1.5 px-4 rounded-md transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Import Google Form
                        </Link>
                    )}
                </div>
            )}

            {/* Share Modal */}
            {shareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-5 w-full max-w-md shadow-xl">
                        <h3 className="text-sm font-semibold text-white mb-1">Share AI Chat</h3>
                        <p className="text-gray-500 text-xs mb-4">
                            Anyone with this link can interact with the AI to complete this form without an account.
                        </p>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                readOnly
                                value={shareLink}
                                className="flex-1 bg-[#111116] border border-gray-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#9A6BFF]"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={copyToClipboard}
                                className="bg-[#9A6BFF] hover:bg-[#8555e8] text-white text-xs px-4 py-2 rounded font-medium transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShareModalOpen(false)}
                                className="text-xs text-gray-500 hover:text-white transition-colors"
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
