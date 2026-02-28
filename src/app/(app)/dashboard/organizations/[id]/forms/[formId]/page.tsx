"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Loader2, ExternalLink, FileText,
    ChevronRight, AlertCircle
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { getOrgForm, getFormResponses } from "@/lib/api/organizations";
import { ResponsesList } from "@/components/forms/ResponsesList";

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
    const { id: orgId, formId } = useParams() as { id: string; formId: string };
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
                        onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
                        className="text-[#9A6BFF] hover:underline text-sm"
                    >
                        ← Back to organization
                    </button>
                </div>
            </div>
        );
    }

    const fields = form.fields || [];
    const questionFields = fields.filter((f: any) => f.type !== 'SECTION_HEADER');

    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <div className="max-w-4xl">

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
                    <button onClick={() => router.push('/dashboard/organizations')} className="hover:text-gray-300 transition-colors">
                        Organizations
                    </button>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <button onClick={() => router.push(`/dashboard/organizations/${orgId}`)} className="hover:text-gray-300 transition-colors">
                        Forms
                    </button>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-gray-300 truncate max-w-[200px]">{form.title}</span>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">{form.title}</h1>
                        {form.description && (
                            <p className="text-gray-400 text-sm">{form.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                            <span>{questionFields.length} question{questionFields.length !== 1 ? 's' : ''}</span>
                            {form.metadata?.estimatedCompletionCompletionMinutes && (
                                <span>~{form.metadata.estimatedCompletionCompletionMinutes} min</span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full border ${form.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                                {form.status}
                            </span>
                        </div>
                    </div>
                    {form.publicUrl && (
                        <a
                            href={form.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-gray-800 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors shrink-0"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open Form
                        </a>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 border-b border-gray-800 mb-6">
                    {[
                        { id: 'fields', label: `Fields (${fields.length})` },
                        { id: 'responses', label: `Responses (${form.submissionCount ?? 0})` },
                        { id: 'details', label: 'Details' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2.5 text-sm font-medium relative transition-colors ${activeTab === tab.id ? 'text-[#9A6BFF]' : 'text-gray-400 hover:text-gray-200'}`}
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
                    <div className="space-y-3">
                        {fields.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-800 rounded-xl p-10 text-center">
                                <FileText className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No fields found for this form</p>
                            </div>
                        ) : (
                            fields.map((field: any, i: number) => {
                                const style = FIELD_TYPE_STYLES[field.type] || FIELD_TYPE_STYLES.SHORT_TEXT;
                                const isSection = field.type === 'SECTION_HEADER';
                                return (
                                    <div
                                        key={field.id || i}
                                        className={`bg-[#0f0f14] border border-gray-800 rounded-xl p-4 ${isSection ? 'opacity-70' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-xs text-gray-600 mt-0.5 w-5 shrink-0">{i + 1}.</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style}`}>
                                                        {field.type.replace(/_/g, ' ')}
                                                    </span>
                                                    {field.required && (
                                                        <span className="text-xs text-red-400">Required</span>
                                                    )}
                                                </div>
                                                <p className="text-white text-sm font-medium mt-1">{field.label}</p>
                                                {field.description && (
                                                    <p className="text-gray-500 text-xs mt-0.5">{field.description}</p>
                                                )}
                                                {field.options && field.options.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {field.options.map((opt: any, j: number) => (
                                                            <span key={j} className="text-xs bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded">
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
                    <ResponsesList responses={responses} loading={responsesLoading} />
                )}

                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="bg-[#0f0f14] border border-gray-800 rounded-xl divide-y divide-gray-800">
                        {[
                            { label: 'Source', value: form.sourceUrl },
                            { label: 'Questions', value: form.metadata?.questionCount },
                            { label: 'Has File Upload', value: form.metadata?.hasFileUpload ? 'Yes' : 'No' },
                            { label: 'Last Synced', value: form.lastSynced ? new Date(form.lastSynced).toLocaleString() : 'Never' },
                            { label: 'Total Conversations', value: form.conversationCount ?? 0 },
                            { label: 'Total Submissions', value: form.submissionCount ?? 0 },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between px-5 py-3">
                                <span className="text-sm text-gray-500">{label}</span>
                                <span className="text-sm text-white text-right max-w-[60%] truncate">{String(value ?? '—')}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
