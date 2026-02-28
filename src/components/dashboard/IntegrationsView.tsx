"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
import { DashboardBreadcrumbs } from "./DashboardBreadcrumbs";
import { useOrgStore } from "@/stores/orgStore";

export function IntegrationsView() {
    const router = useRouter();
    const { currentOrgId } = useOrgStore();

    const handleConnectGoogleForms = () => {
        if (!currentOrgId) return;
        router.push(`/dashboard/${currentOrgId}/forms/import`);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <DashboardBreadcrumbs
                backHref={`/dashboard/${currentOrgId}`}
                backLabel="Back to Overview"
            />
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Integrations</h1>
            <p className="text-gray-500 mb-8 font-medium">Connect Formless with your favorite tools</p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {/* Google Forms Card */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-[#0B0B0F] border border-gray-800/60 hover:border-gray-700/80 rounded-2xl p-6 flex flex-col h-full shadow-lg transition-colors group"
                >
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:border-[#9A6BFF]/30 group-hover:bg-[#9A6BFF]/5 transition-colors flex items-center justify-center text-[#9A6BFF]">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-medium tracking-tight text-white group-hover:text-white transition-colors">Google Forms</h3>
                            <p className="text-[11px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">Native</p>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-8 flex-grow leading-relaxed">
                        Sync your Google Forms submissions directly to Formless in real-time. Map fields seamlessly.
                    </p>

                    <button
                        onClick={handleConnectGoogleForms}
                        className="w-full py-2.5 px-4 bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-xl transition-all font-medium text-sm border border-white/[0.05]"
                    >
                        Configure
                    </button>
                </motion.div>

                {/* Webhooks Card (Coming Soon) */}
                <motion.div
                    className="bg-[#0B0B0F]/40 border border-gray-800/40 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden group"
                >
                    <div className="absolute top-4 right-4 bg-white/[0.03] border border-white/[0.05] text-[10px] uppercase tracking-wider font-semibold text-gray-400 px-2.5 py-1 rounded-full">Coming Soon</div>
                    <div className="flex items-center gap-4 mb-5 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-blue-400">
                            <RefreshCw className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium tracking-tight text-white">Webhooks</h3>
                            <p className="text-[11px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">Custom</p>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-8 flex-grow leading-relaxed opacity-60">
                        Send form data to any external API endpoint automatically when a submission is received.
                    </p>
                    <button disabled className="w-full py-2.5 px-4 bg-transparent text-gray-600 rounded-xl font-medium text-sm border border-gray-800/50 cursor-not-allowed">
                        Not Available
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
