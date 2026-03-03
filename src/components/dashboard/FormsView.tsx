"use client";

import React, { useEffect, useState } from "react";
import {
    Loader2, FileText, Search, Check, AlertCircle,
    ExternalLink, Plus
} from "lucide-react";
import { DashboardBreadcrumbs } from "./DashboardBreadcrumbs";
import { getGoogleForms } from "@/lib/api/integrations";
import { importOrgForm } from "@/lib/api/organizations";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function FormsView({ currentOrgId }: { currentOrgId: string }) {
    const router = useRouter();
    const [forms, setForms] = useState<any[]>([]);
    const [loadingForms, setLoadingForms] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [importedFormIds, setImportedFormIds] = useState<Set<string>>(new Set());

    // Per-form import state
    const [importing, setImporting] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({});
    const [importErrors, setImportErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // Reset per-organization state when switching orgs
        setImporting({});
        setImportErrors({});

        (async () => {
            setLoadingForms(true);
            setFetchError(null);
            try {
                const data = await getGoogleForms(currentOrgId);
                const list = Array.isArray(data) ? data : (data.files || data.forms || []);
                setForms(list);

                // Fetch existing org forms to mark imported ones
                const { getOrgForms } = await import('@/lib/api/organizations');
                const orgFormsData = await getOrgForms(currentOrgId, { limit: 1000 });
                const orgFormsList = orgFormsData.forms || [];
                const importedIds = new Set<string>();
                orgFormsList.forEach((f: any) => {
                    if (f.sourceFormId) importedIds.add(f.sourceFormId);
                    // Fallback for older records
                    else if (f.sourceUrl) {
                        const match = f.sourceUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                        if (match) importedIds.add(match[1]);
                    }
                });
                setImportedFormIds(importedIds);
            } catch (e: any) {
                const status = Number(e?.status || e?.statusCode);
                if (status === 400 || status === 404) {
                    setFetchError('Your Google account is not connected yet. Go to Integrations to connect it first.');
                } else {
                    setFetchError(e?.message || 'Failed to fetch your Google Forms');
                }
            } finally {
                setLoadingForms(false);
            }
        })();
    }, [currentOrgId]);

    const handleImport = async (form: any) => {
        const formId = form.formId || form.id;
        setImporting((prev) => ({ ...prev, [formId]: 'loading' }));
        setImportErrors((prev) => ({ ...prev, [formId]: '' }));
        try {
            const result = await importOrgForm(currentOrgId, formId);
            setImporting((prev) => ({ ...prev, [formId]: 'done' }));
            const newId = result?.data?.id ?? result?.id;

            toast.success("Form imported successfully", {
                description: "Redirecting to the AI Chat Builder..."
            });

            if (newId) {
                setTimeout(() => router.push(`/dashboard/${currentOrgId}/forms/${newId}/builder`), 800);
            }
        } catch (e: any) {
            setImporting((prev) => ({ ...prev, [formId]: 'error' }));
            const msg = e.message || 'Import failed';
            setImportErrors((prev) => ({ ...prev, [formId]: msg }));
            toast.error("Failed to import form", { description: msg });
        }
    };

    const handleConnect = async () => {
        try {
            setFetchError(null);
            setLoadingForms(true);

            const { getIntegrationsGoogleAuthUrl } = await import("@/lib/api/integrations");
            const { useAuthStore } = await import("@/stores/authStore");
            const { accessToken } = useAuthStore.getState();

            const response = await fetch(getIntegrationsGoogleAuthUrl(currentOrgId, window.location.pathname), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                setFetchError(`Failed to generate connect URL`);
                setLoadingForms(false);
            }
        } catch (err: any) {
            console.error("handleConnect error:", err);
            setFetchError(`Failed to connect to Google: ${err.message || 'Check console'}`);
            setLoadingForms(false);
        }
    };

    const filtered = forms.filter((f) => {
        const name = (f.title || f.name || '').toLowerCase();
        return name.includes(search.toLowerCase());
    });

    return (
        <div className="w-full h-full flex flex-col max-w-4xl">
            <DashboardBreadcrumbs
                backHref={`/dashboard/${currentOrgId}/forms`}
                backLabel="Back to Forms"
            />
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Import a Google Form</h1>
                <p className="text-gray-500 text-sm font-medium mb-8">Select a form from your Google account to import into this workspace</p>
            </div>

            {/* Search */}
            {forms.length > 0 && (
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search forms..."
                        className="w-full bg-[#0B0B0F] border border-gray-800/60 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-white/20 transition-colors shadow-sm"
                    />
                </div>
            )}

            {/* States */}
            {loadingForms ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 border border-gray-800/50 rounded-2xl bg-[#0B0B0F]">
                    <Loader2 className="w-7 h-7 animate-spin text-brand-purple" />
                    <p className="text-gray-400 text-sm">Loading your Google Forms...</p>
                </div>
            ) : fetchError ? (
                <div className="bg-[#111116] border border-gray-800 rounded-2xl p-8 text-center max-w-xl">
                    <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-5">{fetchError}</p>
                    <button
                        onClick={handleConnect}
                        className="inline-flex items-center gap-2 bg-brand-purple hover:bg-[#0da372] text-white text-sm font-medium py-2 px-5 rounded-lg transition-colors"
                    >
                        Connect Google Account
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="border border-dashed border-gray-800 bg-[#0B0B0F] rounded-xl p-12 text-center max-w-xl">
                    <FileText className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                        {search ? `No forms match "${search}"` : 'No Google Forms found in your account'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col border-y border-gray-800/40">
                    {filtered.map((form) => {
                        const formId = form.formId || form.id;
                        const isAlreadyImported = importedFormIds.has(formId);
                        const state = importing[formId] || (isAlreadyImported ? 'done' : 'idle');
                        const err = importErrors[formId];

                        return (
                            <div
                                key={formId}
                                className={`group bg-transparent border-b border-gray-800/40 last:border-0 px-2 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${state === 'done' ? 'bg-emerald-500/[0.02]' : 'hover:bg-white/[0.02]'}`}
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:border-white/[0.1] transition-colors flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-gray-300 group-hover:text-white transition-colors text-sm font-medium tracking-tight truncate">{form.title || form.name}</p>
                                        <p className="text-gray-600 font-mono text-[11px] truncate mt-0.5">{formId}</p>
                                        {err && (
                                            <p className="text-red-400 text-xs mt-1">{err}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                    {form.alternateLink && (
                                        <a
                                            href={form.alternateLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] rounded transition-colors"
                                            title="Open in Google Forms"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}

                                    <button
                                        onClick={() => handleImport(form)}
                                        disabled={state === 'loading' || state === 'done' || isAlreadyImported}
                                        className={`flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all w-[110px] ${state === 'done' || isAlreadyImported
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                                            : state === 'loading'
                                                ? 'bg-transparent text-gray-500 border border-gray-800/50 cursor-wait'
                                                : state === 'error'
                                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                                    : 'bg-white/[0.03] text-gray-400 hover:text-white border border-white/[0.05] hover:border-brand-purple/40 hover:bg-brand-purple/10 opacity-70 group-hover:opacity-100'
                                            }`}
                                    >
                                        {state === 'loading' ? (
                                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing</>
                                        ) : (state === 'done' || isAlreadyImported) ? (
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
        </div>
    );
}
