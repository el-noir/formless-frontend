"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Background } from "@/components/Background";
import { Settings, RefreshCw, Mail } from "lucide-react";

export default function IntegrationsPage() {
    const router = useRouter();

    const handleConnectGoogleForms = () => {
        // We can directly navigate to the google forms page, or trigger the OAuth directly
        // Let's just go to the sub-dashboard for Google Forms
        router.push("/integrations/google-forms");
    };

    return (
        <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative">
            <Background />
            <div className="max-w-7xl mx-auto relative z-10">
                <h1 className="text-4xl font-bold text-white mb-2">Integrations</h1>
                <p className="text-gray-400 mb-10">Connect Formless with your favorite tools</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Google Forms Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#1C1C24] border border-white/10 rounded-2xl p-6 flex flex-col h-full"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
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
                            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium border border-white/10"
                        >
                            Configure
                        </button>
                    </motion.div>

                    {/* Webhooks Card (Coming Soon) */}
                    <motion.div
                        className="bg-[#1C1C24]/50 border border-white/5 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden"
                    >
                        <div className="absolute top-4 right-4 bg-white/10 text-xs text-white px-2 py-1 rounded-md">Coming Soon</div>
                        <div className="flex items-center gap-4 mb-4 opacity-50">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <RefreshCw className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Webhooks</h3>
                                <p className="text-sm text-gray-400">Custom endpoints</p>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-6 flex-grow">
                            Send form data to any external API endpoint automatically when a submission is received.
                        </p>
                        <button disabled className="w-full py-3 px-4 bg-transparent text-gray-600 rounded-xl font-medium border border-white/5 cursor-not-allowed">
                            Not Available
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
