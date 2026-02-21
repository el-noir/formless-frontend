"use client";

import React, { useEffect, useState } from "react";
import { Background } from "@/components/Background";
import { Loader2, Plus, FileText, Trash2, ExternalLink } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { getForms, deleteForm } from "@/lib/api/forms";
import { MagneticButton } from "@/components/ui/MagneticButton";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function FormsPage() {
    const { isLoading } = useRequireAuth();
    const { accessToken } = useAuthStore();
    const [forms, setForms] = useState<any[]>([]);
    const [loadingForms, setLoadingForms] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMyForms = async () => {
        setLoadingForms(true);
        setError(null);
        try {
            const data = await getForms();
            setForms(data);
        } catch (err: any) {
            console.error("Error fetching forms:", err);
            setError(err?.message || "Failed to fetch forms");
        } finally {
            setLoadingForms(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchMyForms();
        }
    }, [accessToken]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this form?")) return;
        try {
            await deleteForm(id);
            setForms(forms.filter(f => f.id !== id));
        } catch (err) {
            alert("Failed to delete form");
        }
    };

    if (isLoading || loadingForms) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
                <Background />
                <div className="text-center relative z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6E8BFF] mx-auto mb-4" />
                    <p className="text-gray-400">Loading your forms...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative">
            <Background />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Forms</h1>
                        <p className="text-gray-400">Manage your native and imported forms</p>
                    </div>
                    <MagneticButton onClick={() => window.location.href = '/integrations'} className="bg-[#6E8BFF] hover:bg-[#5a72e0] text-white font-medium py-2 px-4 rounded transition duration-200 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Import Form
                    </MagneticButton>
                </div>

                {error ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
                        {error}
                    </div>
                ) : forms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forms.map((form) => (
                            <div key={form.id} className="bg-[#0f0f14] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors flex flex-col h-full group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-[#6E8BFF]/10 rounded-lg text-[#6E8BFF]">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {form.status === 'ACTIVE' && (
                                            <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">{form.title}</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                                    {form.description || "No description provided."}
                                </p>

                                <div className="border-t border-gray-800 pt-4 mt-auto">
                                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                                        <span>{form.questionCount} Questions</span>
                                        <span>Synced {form.lastSynced ? formatDistanceToNow(new Date(form.lastSynced), { addSuffix: true }) : 'Never'}</span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <Link href={`/forms/${form.id}`} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm py-2 px-4 rounded text-center transition-colors">
                                            View
                                        </Link>
                                        {form.sourceUrl && (
                                            <a href={form.sourceUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded transition-colors" title="Open source form">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button onClick={() => handleDelete(form.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Delete form">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
                        <h3 className="text-xl font-medium text-white mb-2">No forms yet</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            You haven't created or imported any forms. Connect a Google Form or build one from scratch.
                        </p>
                        <MagneticButton onClick={() => window.location.href = '/integrations'} className="bg-[#6E8BFF] hover:bg-[#5a72e0] text-white font-medium py-2 px-6 rounded transition duration-200">
                            Import Google Form
                        </MagneticButton>
                    </div>
                )}
            </div>
        </div>
    );
}
