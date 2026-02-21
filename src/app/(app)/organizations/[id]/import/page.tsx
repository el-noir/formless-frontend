"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Background } from "@/components/Background";
import { Loader2, ArrowLeft, Link as LinkIcon, Check, AlertCircle } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { importOrgForm } from "@/lib/api/organizations";

export default function ImportFormPage() {
    const { id: orgId } = useParams() as { id: string };
    const router = useRouter();
    const { isLoading } = useRequireAuth();

    const [formUrl, setFormUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formUrl.trim()) return setError('Please enter a Google Form URL or ID');

        setSubmitting(true);
        setError(null);
        try {
            await importOrgForm(orgId, formUrl.trim());
            setSuccess(true);
            setTimeout(() => router.push(`/organizations/${orgId}`), 1500);
        } catch (e: any) {
            setError(e.message || 'Failed to import form');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
                <Background />
                <Loader2 className="w-8 h-8 animate-spin text-[#6E8BFF] relative z-10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative">
            <Background />
            <div className="max-w-xl mx-auto relative z-10">

                <button
                    onClick={() => router.push(`/organizations/${orgId}`)}
                    className="flex items-center text-gray-400 hover:text-white transition-colors mb-8 text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to organization
                </button>

                <div className="bg-[#0f0f14] border border-gray-800 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6E8BFF]/20 to-[#9A6BFF]/20 border border-[#6E8BFF]/20 flex items-center justify-center">
                            <LinkIcon className="w-7 h-7 text-[#6E8BFF]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Import Google Form</h1>
                            <p className="text-gray-400 text-sm mt-1">Paste your Google Form URL or ID below</p>
                        </div>
                    </div>

                    {/* Success state */}
                    {success && (
                        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6">
                            <Check className="w-5 h-5 shrink-0" />
                            <p className="text-sm">Form imported successfully! Redirecting...</p>
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleImport} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Google Form URL or ID
                            </label>
                            <input
                                type="text"
                                value={formUrl}
                                onChange={(e) => setFormUrl(e.target.value)}
                                placeholder="https://docs.google.com/forms/d/... or form ID"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#6E8BFF] transition-colors text-sm"
                            />
                            <p className="text-xs text-gray-600 mt-2">
                                Make sure your Google account is connected in{' '}
                                <a href="/integrations" className="text-[#6E8BFF] hover:underline">Integrations</a> first.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || success}
                            className="w-full flex items-center justify-center gap-2 bg-[#6E8BFF] hover:bg-[#5a72e0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                        >
                            {submitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</>
                            ) : success ? (
                                <><Check className="w-4 h-4" /> Imported!</>
                            ) : (
                                'Import Form'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
