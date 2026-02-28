"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIntegrationsGoogleAuthUrl, getGoogleForms } from "@/lib/api/integrations";
import { Background } from "@/components/Background";
import { Loader2, ArrowLeft } from "lucide-react";
import { MappingModal } from "@/components/integrations/MappingModal";
import { useAuthStore } from "@/stores/authStore";

export default function GoogleFormsHub() {
    const router = useRouter();
    const { accessToken } = useAuthStore();
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedForm, setSelectedForm] = useState<any | null>(null);

    useEffect(() => {
        if (accessToken) {
            fetchForms();
        }
    }, [accessToken]);

    const fetchForms = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getGoogleForms();
            setForms(data);
        } catch (err: any) {
            console.error("fetchForms error full object:", err);

            // If unauthorized (401) or not found (404), they haven't connected yet.
            const status = Number(err?.status || err?.statusCode);
            if (status === 401 || status === 404) {
                setForms([]);
            } else {
                setError("Failed to load forms. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(getIntegrationsGoogleAuthUrl(), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                setError(`Failed to generate connect URL: ${JSON.stringify(data)}`);
                setLoading(false);
            }
        } catch (err: any) {
            console.error("handleConnect error:", err);
            setError(`Failed to connect to Google: ${err.message || 'Check console'}`);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative overflow-y-auto">
            <Background />
            <div className="max-w-5xl mx-auto relative z-10">

                <button
                    onClick={() => router.push("/integrations")}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Integrations
                </button>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Google Forms</h1>
                        <p className="text-gray-400">Select a form to map fields and sync responses automatically.</p>
                    </div>

                    <button
                        onClick={handleConnect}
                        className="py-2 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Reconnect Account
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF] mb-4" />
                        <p className="text-gray-400">Loading your forms...</p>
                    </div>
                ) : forms.length === 0 ? (
                    <div className="border border-white/10 bg-[#1C1C24]/50 rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Forms Found</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            You haven&apos;t connected your Google Account or you don&apos;t have any forms.
                            Connect your account to get started.
                        </p>
                        <button
                            onClick={handleConnect}
                            className="py-3 px-6 bg-[#9A6BFF] hover:bg-[#5a72e0] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#9A6BFF]/20"
                        >
                            Connect Google Account
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forms.map((form) => (
                            <div
                                key={form.id}
                                className="relative bg-[#1C1C24] border border-white/10 rounded-2xl p-6 flex flex-col hover:border-white/30 transition-colors"
                            >
                                {form.isSynced && (
                                    <div className="absolute top-4 right-4 bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20 font-medium">
                                        Active Sync
                                    </div>
                                )}
                                <div className="flex-grow pr-16">
                                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{form.name}</h3>
                                    <p className="text-xs text-gray-500 mb-6 font-mono">{form.id}</p>
                                </div>

                                <button
                                    onClick={() => setSelectedForm(form)}
                                    className={`w-full py-2.5 font-medium rounded-lg border transition-colors ${form.isSynced ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/5' : 'bg-white/10 hover:bg-white/20 text-white border-white/10'}`}
                                >
                                    {form.isSynced ? 'Manage Integration' : 'Setup Integration'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                <MappingModal
                    isOpen={!!selectedForm}
                    onClose={() => setSelectedForm(null)}
                    form={selectedForm}
                />

            </div>
        </div>
    );
}
