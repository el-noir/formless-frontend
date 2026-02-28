"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Blocks, ArrowRight } from "lucide-react";
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
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <DashboardBreadcrumbs
                backHref={`/dashboard/${currentOrgId}`}
                backLabel="Back to Overview"
            />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-semibold text-gray-100 tracking-tight mb-1">Integrations</h2>
                    <p className="text-gray-500 text-sm">Connect Formless with your favorite tools</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Google Forms */}
                <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-5 hover:border-gray-700/80 transition-colors flex flex-col shadow-sm group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#1C1C22] border border-gray-800 rounded-md text-gray-400 group-hover:text-[#9A6BFF] transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white">Google Forms</h3>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mt-0.5">Native</p>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-5 flex-grow leading-relaxed">
                        Sync your Google Forms submissions directly to Formless in real-time. Map fields seamlessly.
                    </p>

                    <button
                        onClick={handleConnectGoogleForms}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#111116] hover:bg-[#1C1C22] text-gray-300 hover:text-white text-xs font-medium rounded border border-gray-800 transition-colors group/btn"
                    >
                        Configure
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                </div>

                {/* Webhooks — Coming Soon */}
                <div className="bg-[#0B0B0F]/60 border border-gray-800/40 rounded-md p-5 flex flex-col shadow-sm relative overflow-hidden">
                    <div className="absolute top-3 right-3 bg-[#1C1C22] border border-gray-800 text-[10px] uppercase tracking-wider font-semibold text-gray-500 px-2 py-0.5 rounded-full">
                        Soon
                    </div>
                    <div className="flex items-center gap-3 mb-4 opacity-40">
                        <div className="p-2 bg-[#1C1C22] border border-gray-800 rounded-md text-blue-400">
                            <RefreshCw className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white">Webhooks</h3>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mt-0.5">Custom</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-5 flex-grow leading-relaxed">
                        Send form data to any external API endpoint automatically on submission.
                    </p>
                    <button disabled className="w-full py-2 px-3 bg-transparent text-gray-700 text-xs font-medium rounded border border-gray-800/50 cursor-not-allowed">
                        Not Available
                    </button>
                </div>

                {/* Zapier — Coming Soon */}
                <div className="bg-[#0B0B0F]/60 border border-gray-800/40 rounded-md p-5 flex flex-col shadow-sm relative overflow-hidden">
                    <div className="absolute top-3 right-3 bg-[#1C1C22] border border-gray-800 text-[10px] uppercase tracking-wider font-semibold text-gray-500 px-2 py-0.5 rounded-full">
                        Soon
                    </div>
                    <div className="flex items-center gap-3 mb-4 opacity-40">
                        <div className="p-2 bg-[#1C1C22] border border-gray-800 rounded-md text-orange-400">
                            <Blocks className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white">Zapier</h3>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mt-0.5">Automation</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-5 flex-grow leading-relaxed">
                        Automate workflows by connecting Formless to thousands of apps through Zapier.
                    </p>
                    <button disabled className="w-full py-2 px-3 bg-transparent text-gray-700 text-xs font-medium rounded border border-gray-800/50 cursor-not-allowed">
                        Not Available
                    </button>
                </div>
            </div>
        </div>
    );
}
