"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";

export function IntegrationsView() {
    const router = useRouter();

    const handleConnectGoogleForms = () => {
        // We can navigate to the sub-dashboard for Google Forms (this page can stay separate or be made inline later)
        router.push("/integrations/google-forms");
    };

    return (
        <div className="w-full h-full flex flex-col">
            <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
            <p className="text-gray-400 mb-8">Connect Formless with your favorite tools</p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Google Forms Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#1C1C24] border border-white/10 rounded-2xl p-6 flex flex-col h-full shadow-sm"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#9A6BFF]/20 flex items-center justify-center text-[#9A6BFF]">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Google Forms</h3>
                            <p className="text-sm text-gray-400">Native integration</p>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-6 flex-grow">
                        Sync your Google Forms submissions directly to Formless in real-time. Map fields seamlessly.
                    </p>

                    <button
                        onClick={handleConnectGoogleForms}
                        className="w-full py-2.5 px-4 bg-[#111116] hover:bg-[#1C1C22] text-white rounded-xl transition-colors font-medium border border-gray-800 shadow-sm"
                    >
                        Configure
                    </button>
                </motion.div>

                {/* Webhooks Card (Coming Soon) */}
                <motion.div
                    className="bg-[#111116]/50 border border-gray-800/50 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden"
                >
                    <div className="absolute top-4 right-4 bg-gray-800/80 text-xs text-gray-300 px-2 py-1 rounded-md">Coming Soon</div>
                    <div className="flex items-center gap-4 mb-4 opacity-50">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Webhooks</h3>
                            <p className="text-sm text-gray-500">Custom endpoints</p>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 flex-grow">
                        Send form data to any external API endpoint automatically when a submission is received.
                    </p>
                    <button disabled className="w-full py-2.5 px-4 bg-transparent text-gray-600 rounded-xl font-medium border border-gray-800 cursor-not-allowed">
                        Not Available
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
