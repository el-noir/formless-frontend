"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Background } from "@/components/Background";
import { Loader2, ArrowLeft, ExternalLink, MessageSquare, Settings, Share2, Eye } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { getForm } from "@/lib/api/forms";
import { MagneticButton } from "@/components/ui/MagneticButton";

const FIELD_TYPE_STYLES: Record<string, string> = {
    MULTIPLE_CHOICE: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    CHECKBOXES: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    LINEAR_SCALE: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    DATE: 'bg-green-500/10 text-green-300 border-green-500/20',
    TIME: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    FILE_UPLOAD: 'bg-red-500/10 text-red-300 border-red-500/20',
    MULTIPLE_CHOICE_GRID: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    CHECKBOX_GRID: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
    SHORT_TEXT: 'bg-gray-800 text-gray-400 border-gray-700',
    LONG_TEXT: 'bg-gray-800 text-gray-400 border-gray-700',
};

export default function FormViewerPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { isLoading } = useRequireAuth();
    const { accessToken } = useAuthStore();
    const [form, setForm] = useState<any>(null);
    const [loadingForm, setLoadingForm] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'fields' | 'settings'>('fields');

    const fetchFormData = async () => {
        setLoadingForm(true);
        setError(null);
        try {
            const data = await getForm(id);
            setForm(data);
        } catch (err: any) {
            console.error("Error fetching form:", err);
            setError(err?.message || "Failed to load form details");
        } finally {
            setLoadingForm(false);
        }
    };

    useEffect(() => {
        if (accessToken && id) {
            fetchFormData();
        }
    }, [accessToken, id]);

    if (isLoading || loadingForm) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
                <Background />
                <div className="text-center relative z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6E8BFF] mx-auto mb-4" />
                    <p className="text-gray-400">Loading form details...</p>
                </div>
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative">
                <Background />
                <div className="max-w-3xl mx-auto relative z-10 text-center">
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl mb-6">
                        <h2 className="text-xl font-semibold mb-2">Error</h2>
                        <p>{error || "Form not found"}</p>
                    </div>
                    <MagneticButton onClick={() => router.push('/forms')} className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-6 rounded transition duration-200">
                        Back to My Forms
                    </MagneticButton>
                </div>
            </div>
        );
    }

    const fields: any[] = form.fields || [];
    const questionCount = fields.filter((f: any) => f.type !== 'SECTION_HEADER').length;

    return (
        <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative">
            <Background />
            <div className="max-w-5xl mx-auto relative z-10">

                {/* Header */}
                <div className="mb-8 border-b border-gray-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <button
                            onClick={() => router.push('/forms')}
                            className="flex items-center text-gray-400 hover:text-white transition-colors mb-4 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to forms
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white leading-tight">{form.title}</h1>
                            {form.status === 'ACTIVE' && (
                                <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                                    Active
                                </span>
                            )}
                        </div>
                        {form.description && (
                            <p className="text-gray-400 text-lg max-w-2xl">{form.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {form.sourceUrl && (
                            <a
                                href={form.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/5"
                            >
                                <ExternalLink className="w-4 h-4 mr-2 text-gray-400" />
                                Original
                            </a>
                        )}
                        <MagneticButton className="flex items-center px-4 py-2 bg-[#6E8BFF] hover:bg-[#5a72e0] text-white rounded-lg transition-colors font-medium">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </MagneticButton>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="flex space-x-1 border-b border-gray-800 mb-8">
                    <button
                        onClick={() => setActiveTab('fields')}
                        className={`px-4 py-3 font-medium text-sm flex items-center transition-colors relative ${activeTab === 'fields' ? 'text-[#6E8BFF]' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <Eye className="w-4 h-4 mr-2" /> Fields & Schema
                        {activeTab === 'fields' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#6E8BFF]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-3 font-medium text-sm flex items-center transition-colors relative ${activeTab === 'settings' ? 'text-[#6E8BFF]' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <Settings className="w-4 h-4 mr-2" /> Settings
                        {activeTab === 'settings' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#6E8BFF]" />}
                    </button>
                </div>

                {/* Fields Tab */}
                {activeTab === 'fields' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">Form Structure</h2>
                            <span className="text-gray-400 bg-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                                {questionCount} Questions
                            </span>
                        </div>

                        {fields.length > 0 ? (
                            <div className="space-y-3">
                                {fields.map((field: any, i: number) =>
                                    field.type === 'SECTION_HEADER' ? (
                                        <div key={field.id || i} className="border-t border-gray-800 pt-5 mt-6 first:border-0 first:mt-0 first:pt-0">
                                            <h3 className="text-sm font-semibold text-[#6E8BFF] uppercase tracking-widest">{field.label}</h3>
                                            {field.description && <p className="text-xs text-gray-500 mt-1">{field.description}</p>}
                                        </div>
                                    ) : (
                                        <div key={field.id || i} className="bg-[#0f0f14] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className="text-sm font-medium text-white">{field.label}</span>
                                                        {field.required && (
                                                            <span className="text-red-400 text-xs font-bold" title="Required">*</span>
                                                        )}
                                                    </div>
                                                    {field.description && (
                                                        <p className="text-sm text-gray-500 mb-2">{field.description}</p>
                                                    )}
                                                    {field.options && field.options.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {field.options.map((opt: any, j: number) => (
                                                                <span key={j} className="bg-gray-900 text-gray-300 text-xs px-2 py-1 rounded border border-gray-800">
                                                                    {opt.label}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="shrink-0">
                                                    <span className={`text-xs px-2 py-1 rounded font-mono uppercase tracking-wide border ${FIELD_TYPE_STYLES[field.type] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                                        {field.type.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-10 text-center text-gray-500">
                                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                <p>No fields detected. Try re-importing the form.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Form Metadata</h3>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm text-gray-500 mb-1">Source URL</dt>
                                    <dd className="font-mono text-xs text-gray-300 bg-gray-900 p-2 rounded border border-gray-800 overflow-x-auto break-all">
                                        {form.sourceUrl || 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500 mb-1">Estimated Completion</dt>
                                    <dd className="text-white bg-gray-900/50 inline-block px-3 py-1 rounded font-medium border border-gray-800/50">
                                        ~{form.metadata?.estimatedCompletionCompletionMinutes || 0} min
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500 mb-1">Accepting Responses</dt>
                                    <dd className="text-white">{form.metadata?.acceptingResponses ? 'Yes' : 'No'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500 mb-1">Requires Login</dt>
                                    <dd className="text-white">{form.metadata?.requiresLogin ? 'Yes' : 'No'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500 mb-1">Has File Upload</dt>
                                    <dd className="text-white">{form.metadata?.hasFileUpload ? 'Yes' : 'No'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500 mb-1">Last Synced</dt>
                                    <dd className="text-white text-sm">{form.lastSynced ? new Date(form.lastSynced).toLocaleString() : 'Never'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
