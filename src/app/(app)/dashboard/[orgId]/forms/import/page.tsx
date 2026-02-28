"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Loader2, FileText, Search, Check, AlertCircle,
    ExternalLink, Plus
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { getGoogleForms } from "@/lib/api/integrations";
import { importOrgForm } from "@/lib/api/organizations";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";

export default function ImportFormPage() {
    const { orgId } = useParams() as { orgId: string };
    const router = useRouter();
    const { isLoading } = useRequireAuth();
    const { accessToken } = useAuthStore();

    const [forms, setForms] = useState<any[]>([]);
    const [loadingForms, setLoadingForms] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    // Per-form import state
    const [importing, setImporting] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({});
    const [importErrors, setImportErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!accessToken) return;
        (async () => {
            setLoadingForms(true);
            setFetchError(null);
            try {
                const data = await getGoogleForms();
                // API returns either an array or an object with a forms/files array
                const list = Array.isArray(data) ? data : (data.files || data.forms || []);
                setForms(list);
            } catch (e: any) {
                const status = Number(e?.status || e?.statusCode);
                if (status === 401 || status === 404) {
                    setFetchError('Your Google account is not connected yet. Go to Integrations to connect it first.');
                } else {
                    setFetchError(e?.message || 'Failed to fetch your Google Forms');
                }
            } finally {
                setLoadingForms(false);
            }
        })();
    }, [accessToken]);

    const handleImport = async (form: any) => {
        const formId = form.formId || form.id;
        setImporting((prev) => ({ ...prev, [formId]: 'loading' }));
        setImportErrors((prev) => ({ ...prev, [formId]: '' }));
        try {
            await importOrgForm(orgId, formId);
            setImporting((prev) => ({ ...prev, [formId]: 'done' }));
        } catch (e: any) {
            setImporting((prev) => ({ ...prev, [formId]: 'error' }));
            setImportErrors((prev) => ({ ...prev, [formId]: e.message || 'Import failed' }));
        }
    };

    const filtered = forms.filter((f) => {
        const name = (f.title || f.name || '').toLowerCase();
        return name.includes(search.toLowerCase());
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF]" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <div className="max-w-3xl">

                <DashboardBreadcrumbs
                    backHref={`/dashboard/${orgId}/forms`}
                    backLabel="Back to Forms"
                />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-100 tracking-tight mb-1">Import a Google Form</h2>
                        <p className="text-gray-500 text-sm">Select a form from your Google account to add to this organization</p>
                    </div>
                </div>

                {/* Search */}
                {forms.length > 0 && (
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search forms..."
                            className="w-full bg-[#111116] border border-gray-800 rounded-md pl-9 pr-4 py-2 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-[#9A6BFF] transition-colors"
                        />
                    </div>
                )}

                {/* States */}
                {loadingForms ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-[#9A6BFF]" />
                        <p className="text-gray-400 text-sm">Loading your Google Forms...</p>
                    </div>
                ) : fetchError ? (
                    <div className="bg-[#0f0f14] border border-gray-800 rounded-2xl p-8 text-center">
                        <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm mb-5">{fetchError}</p>
                        <a
                            href="/integrations"
                            className="inline-flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#5a72e0] text-white text-sm font-medium py-2 px-5 rounded-lg transition-colors"
                        >
                            Connect Google Account
                        </a>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-800 rounded-xl p-12 text-center">
                        <FileText className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">
                            {search ? `No forms match "${search}"` : 'No Google Forms found in your account'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((form) => {
                            const formId = form.formId || form.id;
                            const state = importing[formId] || 'idle';
                            const err = importErrors[formId];

                            return (
                                <div
                                    key={formId}
                                    className={`bg-[#0f0f14] border rounded-xl p-4 flex items-center justify-between gap-4 transition-colors ${state === 'done' ? 'border-green-500/30' : 'border-gray-800 hover:border-gray-700'}`}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-[#9A6BFF]/10 border border-[#9A6BFF]/20 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5 text-[#9A6BFF]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{form.title || form.name}</p>
                                            <p className="text-gray-600 text-xs truncate mt-0.5">{formId}</p>
                                            {err && (
                                                <p className="text-red-400 text-xs mt-1">{err}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {form.alternateLink && (
                                            <a
                                                href={form.alternateLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-gray-600 hover:text-gray-300 transition-colors"
                                                title="Open in Google Forms"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}

                                        <button
                                            onClick={() => handleImport(form)}
                                            disabled={state === 'loading' || state === 'done'}
                                            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${state === 'done'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default'
                                                : state === 'loading'
                                                    ? 'bg-[#9A6BFF]/20 text-[#9A6BFF] cursor-wait'
                                                    : state === 'error'
                                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                                        : 'bg-[#9A6BFF] hover:bg-[#5a72e0] text-white'
                                                }`}
                                        >
                                            {state === 'loading' ? (
                                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing...</>
                                            ) : state === 'done' ? (
                                                <><Check className="w-3.5 h-3.5" /> Imported</>
                                            ) : state === 'error' ? (
                                                'Retry'
                                            ) : (
                                                <><Plus className="w-3.5 h-3.5" /> Import</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Done CTA */}
                {Object.values(importing).some((s) => s === 'done') && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => router.push(`/dashboard/${orgId}/forms`)}
                            className="text-sm text-[#9A6BFF] hover:underline"
                        >
                            ← Back to view imported forms
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
