"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Loader2, ExternalLink, FileText,
    AlertCircle, Wand2, MessageSquare, CheckCircle2, TrendingDown, Clock
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { getOrgForm, getFormResponses } from "@/lib/api/organizations";
import { ResponsesList } from "@/components/forms/ResponsesList";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";

const FIELD_TYPE_STYLES: Record<string, string> = {
    MULTIPLE_CHOICE: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    CHECKBOXES: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    LINEAR_SCALE: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    DATE: 'bg-green-500/10 text-green-300 border-green-500/20',
    TIME: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    FILE_UPLOAD: 'bg-red-500/10 text-red-300 border-red-500/20',
    MULTIPLE_CHOICE_GRID: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    SHORT_TEXT: 'bg-gray-800 text-gray-400 border-gray-700',
    LONG_TEXT: 'bg-gray-800 text-gray-400 border-gray-700',
    SECTION_HEADER: 'bg-gray-900 text-gray-500 border-gray-800',
};

export default function OrgFormViewerPage() {
    const { orgId, formId } = useParams() as { orgId: string; formId: string };
    const router = useRouter();
    const { isLoading } = useRequireAuth();
    const { accessToken } = useAuthStore();

    const [form, setForm] = useState<any>(null);
    const [responses, setResponses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [responsesLoading, setResponsesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'fields' | 'responses' | 'details'>('fields');

    useEffect(() => {
        if (!accessToken || !orgId || !formId) return;
        (async () => {
            setLoading(true);
            try {
                const data = await getOrgForm(orgId, formId);
                setForm(data);
            } catch (e: any) {
                setError(e.message || 'Failed to load form');
            } finally {
                setLoading(false);
            }
        })();
    }, [accessToken, orgId, formId]);

    useEffect(() => {
        if (activeTab === 'responses' && orgId && formId && responses.length === 0) {
            (async () => {
                setResponsesLoading(true);
                try {
                    const data = await getFormResponses(orgId, formId);
                    setResponses(data);
                } catch (e: any) {
                    console.error('Failed to load responses:', e);
                } finally {
                    setResponsesLoading(false);
                }
            })();
        }
    }, [activeTab, orgId, formId, responses.length]);

    if (isLoading || loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF] mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Loading form...</p>
                </div>
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
                <div className="max-w-3xl mx-auto text-center">
                    <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">{error || 'Form not found'}</p>
                    <button
                        onClick={() => router.push(`/dashboard/${orgId}/forms`)}
                        className="text-[#9A6BFF] hover:underline text-sm"
                    >
                        ← Back to forms
                    </button>
                </div>
            </div>
        );
    }

    const fields = form.fields || [];
    const questionFields = fields.filter((f: any) => f.type !== 'SECTION_HEADER');

    // Computed stats
    const conversations = form.conversationCount ?? 0;
    const submissions = form.submissionCount ?? 0;
    const completionRate = conversations > 0 ? Math.round((submissions / conversations) * 100) : 0;
    const dropOffRate = 100 - completionRate;
    const estMinutes = form.metadata?.estimatedCompletionMinutes ?? Math.ceil(questionFields.length * 0.5);

    const stats = [
        { label: 'Conversations', value: conversations, icon: MessageSquare, color: 'text-[#9A6BFF]', bg: 'bg-[#9A6BFF]/10' },
        { label: 'Submissions', value: submissions, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingDown, color: completionRate >= 70 ? 'text-green-400' : completionRate >= 40 ? 'text-yellow-400' : 'text-red-400', bg: completionRate >= 70 ? 'bg-green-500/10' : completionRate >= 40 ? 'bg-yellow-500/10' : 'bg-red-500/10' },
        { label: 'Est. Time', value: `~${estMinutes}m`, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    ];
    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <div className="max-w-4xl">

                <DashboardBreadcrumbs
                    backHref={`/dashboard/${orgId}/forms`}
                    backLabel="Back to Forms"
                />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-100 tracking-tight mb-1">{form.title}</h2>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            {form.description && <span>{form.description}</span>}
                            {form.description && <span className="text-gray-700">·</span>}
                            <span>{questionFields.length} question{questionFields.length !== 1 ? 's' : ''}</span>
                            {form.metadata?.estimatedCompletionCompletionMinutes && (
                                <><span className="text-gray-700">·</span><span>~{form.metadata.estimatedCompletionCompletionMinutes} min</span></>
                            )}
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${form.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-800 text-gray-500 border-gray-700'
                                }`}>
                                {form.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/dashboard/${orgId}/forms/${formId}/builder`}
                            className="flex items-center gap-1.5 bg-[#9A6BFF] hover:bg-[#8555e8] text-white text-xs font-medium px-4 py-2 rounded-md transition-colors shrink-0"
                        >
                            <Wand2 className="w-3.5 h-3.5" />
                            Configure AI Chat
                        </Link>
                        {form.publicUrl && (
                            <a
                                href={form.publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 bg-[#111116] hover:bg-[#1C1C22] border border-gray-800 text-gray-300 hover:text-white text-xs font-medium px-4 py-2 rounded-md transition-colors shrink-0"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Open Form
                            </a>
                        )}
                    </div>
                </div>

                {/* Stats Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {stats.map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-4 flex items-center gap-3 shadow-sm">
                            <div className={`${bg} p-2 rounded-md shrink-0`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-white font-semibold text-base leading-tight">{value}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 border-b border-gray-800/80 mb-6">
                    {[
                        { id: 'fields', label: `Fields (${fields.length})` },
                        { id: 'responses', label: `Responses (${form.submissionCount ?? 0})` },
                        { id: 'details', label: 'Details' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2.5 text-xs font-medium relative transition-colors ${activeTab === tab.id ? 'text-[#9A6BFF]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#9A6BFF]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Fields Tab */}
                {activeTab === 'fields' && (
                    <div className="space-y-2">
                        {fields.length === 0 ? (
                            <div className="border border-dashed border-gray-800 rounded-md p-10 text-center">
                                <div className="w-8 h-8 bg-[#1C1C22] border border-gray-800 rounded-md flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                </div>
                                <p className="text-gray-500 text-xs">No fields found for this form</p>
                            </div>
                        ) : (
                            fields.map((field: any, i: number) => {
                                const style = FIELD_TYPE_STYLES[field.type] || FIELD_TYPE_STYLES.SHORT_TEXT;
                                const isSection = field.type === 'SECTION_HEADER';
                                return (
                                    <div
                                        key={field.id || i}
                                        className={`bg-[#0B0B0F] border border-gray-800/80 rounded-md p-3 ${isSection ? 'opacity-60' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-[10px] text-gray-600 mt-0.5 w-4 shrink-0 font-mono">{i + 1}.</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wide ${style}`}>
                                                        {field.type.replace(/_/g, ' ')}
                                                    </span>
                                                    {field.required && (
                                                        <span className="text-[10px] text-red-400 font-medium">Required</span>
                                                    )}
                                                </div>
                                                <p className="text-white text-xs font-medium mt-1">{field.label}</p>
                                                {field.description && (
                                                    <p className="text-gray-500 text-[10px] mt-0.5">{field.description}</p>
                                                )}
                                                {field.options && field.options.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {field.options.map((opt: any, j: number) => (
                                                            <span key={j} className="text-[10px] bg-[#111116] border border-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                                                                {opt.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Responses Tab */}
                {activeTab === 'responses' && (
                    <ResponsesList responses={responses} loading={responsesLoading} formTitle={form?.title} />
                )}

                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md divide-y divide-gray-800/80 shadow-sm">
                        {[
                            { label: 'Source', value: form.sourceUrl },
                            { label: 'Questions', value: form.metadata?.questionCount },
                            { label: 'Has File Upload', value: form.metadata?.hasFileUpload ? 'Yes' : 'No' },
                            { label: 'Last Synced', value: form.lastSynced ? new Date(form.lastSynced).toLocaleString() : 'Never' },
                            { label: 'Total Conversations', value: form.conversationCount ?? 0 },
                            { label: 'Total Submissions', value: form.submissionCount ?? 0 },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between px-4 py-3">
                                <span className="text-xs text-gray-500">{label}</span>
                                <span className="text-xs text-white text-right max-w-[60%] truncate font-mono">{String(value ?? '—')}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
