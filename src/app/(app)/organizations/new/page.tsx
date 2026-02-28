"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Background } from "@/components/Background";
import { Loader2, ArrowLeft, Building2, Check } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useOrgStore } from "@/stores/orgStore";
import { createOrganization } from "@/lib/api/organizations";

export default function NewOrganizationPage() {
    const router = useRouter();
    const { isLoading } = useRequireAuth();
    const { addOrganization, setCurrentOrg } = useOrgStore();

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        website: '',
        description: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return setError('Organization name is required');

        setSubmitting(true);
        setError(null);
        try {
            const org = await createOrganization({
                name: form.name.trim(),
                email: form.email || undefined,
                phone: form.phone || undefined,
                website: form.website || undefined,
                description: form.description || undefined,
            });

            // Add to store and make it the active org
            addOrganization({
                id: org.id,
                name: org.name,
                plan: org.plan,
                myRole: org.myRole,
                memberCount: org.memberCount,
            });
            setCurrentOrg(org.id);

            router.push(`/organizations/${org.id}`);
        } catch (e: any) {
            setError(e.message || 'Failed to create organization');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
                <Background />
                <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF] relative z-10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative">
            <Background />
            <div className="max-w-2xl mx-auto relative z-10">

                <button
                    onClick={() => router.push('/organizations')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors mb-8 text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to organizations
                </button>

                <div className="bg-[#0f0f14] border border-gray-800 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#9A6BFF]/20 to-[#9A6BFF]/20 border border-[#9A6BFF]/20 flex items-center justify-center">
                            <Building2 className="w-7 h-7 text-[#9A6BFF]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Create Organization</h1>
                            <p className="text-gray-400 text-sm mt-1">You&apos;ll become the owner and can invite teammates</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Organization Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Acme Corp"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#9A6BFF] transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="hello@acme.com"
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#9A6BFF] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                                <input
                                    name="website"
                                    type="url"
                                    value={form.website}
                                    onChange={handleChange}
                                    placeholder="https://acme.com"
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#9A6BFF] transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="What does your organization do?"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#9A6BFF] transition-colors resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 bg-[#9A6BFF] hover:bg-[#5a72e0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors mt-2"
                        >
                            {submitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                            ) : (
                                <><Check className="w-4 h-4" /> Create Organization</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
