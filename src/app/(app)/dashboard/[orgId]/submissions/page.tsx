"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrgForms } from "@/lib/api/organizations";
import { AnalyticsView } from "@/components/forms/AnalyticsView";
import { ChevronLeft, Loader2, FileText, Inbox } from "lucide-react";

interface Form {
    id: string;
    title: string;
    status: string;
    submissionCount?: number;
    source?: string;
}

export default function SubmissionsPage() {
    const params = useParams<{ orgId: string }>();
    const orgId = params.orgId;

    const [forms, setForms] = useState<Form[]>([]);
    const [loadingForms, setLoadingForms] = useState(true);
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);

    // Fetch all forms in the org
    useEffect(() => {
        if (!orgId) return;
        setLoadingForms(true);
        getOrgForms(orgId)
            .then((data) => {
                // Backend returns { success, count, total, forms: [...] }
                const list: Form[] = data?.forms ?? data?.data ?? (Array.isArray(data) ? data : []);
                setForms(list);
            })
            .catch(console.error)
            .finally(() => setLoadingForms(false));
    }, [orgId]);

    /* ── Detail view ─────────────────────────────────────────────── */
    if (selectedForm) {
        return (
            <div className="p-6 md:p-8 xl:p-10 max-w-[1200px] mx-auto w-full">
                {/* Back */}
                <button
                    onClick={() => setSelectedForm(null)}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm mb-6"
                >
                    <ChevronLeft className="w-4 h-4" />
                    All forms
                </button>

                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-white mb-1">{selectedForm.title}</h1>
                    <p className="text-gray-500 text-sm">Analytics &amp; responses</p>
                </div>

                <AnalyticsView
                    orgId={orgId}
                    formId={selectedForm.id}
                    formTitle={selectedForm.title}
                />
            </div>
        );
    }

    /* ── List view ───────────────────────────────────────────────── */
    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1200px] mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Submissions</h1>
                <p className="text-gray-500 text-sm">View responses across all your forms</p>
            </div>

            {loadingForms ? (
                <div className="flex items-center justify-center py-20 text-gray-500 gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-purple" />
                    <span className="text-sm">Loading forms...</span>
                </div>
            ) : forms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-800 rounded-2xl">
                    <Inbox className="w-8 h-8 text-gray-700 mb-3" />
                    <p className="text-gray-400 text-sm font-medium mb-1">No forms yet</p>
                    <p className="text-gray-600 text-xs">Import a Google Form from the dashboard to get started.</p>
                </div>
            ) : (
                <div className="grid gap-2">
                    {forms.map((form) => (
                        <button
                            key={form.id}
                            onClick={() => setSelectedForm(form)}
                            className="w-full flex items-center justify-between gap-4 bg-[#111116] hover:bg-[#1C1C24] border border-gray-800 hover:border-gray-700 rounded-xl px-5 py-4 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-[#1C1C24] border border-gray-800 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-200 group-hover:text-white truncate transition-colors">
                                        {form.title}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {form.source === "GOOGLE_FORMS" ? "Google Form" : "Form"}
                                        {form.status && (
                                            <> · <span className={form.status === "ACTIVE" ? "text-green-500" : "text-gray-600"}>{form.status.toLowerCase()}</span></>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-sm font-medium text-gray-300">
                                    {form.submissionCount ?? 0}
                                </p>
                                <p className="text-[11px] text-gray-600">responses</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
