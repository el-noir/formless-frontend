"use client";

import React, { useState } from "react";
import { Check, Copy, ExternalLink, Link2 } from "lucide-react";

interface ShareTabProps {
    chatLink: string | null;
    formTitle: string;
    onPublish: () => void;
    isPublishing: boolean;
}

export function ShareTab({ chatLink, formTitle, onPublish, isPublishing }: ShareTabProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!chatLink) return;
        navigator.clipboard.writeText(chatLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const embedCode = chatLink
        ? `<iframe src="${chatLink}" width="100%" height="600" frameborder="0" allow="microphone"></iframe>`
        : null;

    return (
        <div className="space-y-6">
            {!chatLink ? (
                <div className="border border-dashed border-gray-800 rounded p-6 text-center">
                    <div className="w-10 h-10 bg-[#1C1C22] border border-gray-800 rounded-md flex items-center justify-center mx-auto mb-3">
                        <Link2 className="w-4 h-4 text-gray-500" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-200 mb-1">Not published yet</h3>
                    <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                        Configure your AI persona and welcome message, then publish to get a shareable link.
                    </p>
                    <button
                        onClick={onPublish}
                        disabled={isPublishing}
                        className="inline-flex items-center gap-2 bg-[#9A6BFF] hover:bg-[#8555e8] disabled:opacity-60 text-white text-xs font-medium px-4 py-2 rounded transition-colors"
                    >
                        {isPublishing ? (
                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Link2 className="w-3 h-3" />
                        )}
                        {isPublishing ? "Generating..." : "Publish & Get Link"}
                    </button>
                </div>
            ) : (
                <>
                    {/* Success state */}
                    <div className="bg-green-500/5 border border-green-500/20 rounded p-3 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-green-400" />
                        </div>
                        <p className="text-xs text-green-400">Published! Your chat is live and ready to share.</p>
                    </div>

                    {/* Chat link */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-2">Chat Link</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={chatLink}
                                className="flex-1 bg-[#111116] border border-gray-800 rounded px-3 py-2 text-xs text-gray-300 focus:outline-none"
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium border transition-all ${copied
                                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                                        : "bg-[#111116] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                                    }`}
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                            <a
                                href={chatLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 px-3 py-2 bg-[#111116] border border-gray-800 text-gray-400 hover:text-white rounded text-xs transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    {/* Embed code */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-2">Embed on your website</label>
                        <div className="bg-[#111116] border border-gray-800 rounded p-3 font-mono text-[10px] text-gray-500 break-all leading-relaxed">
                            {embedCode}
                        </div>
                    </div>

                    {/* Regenerate */}
                    <button
                        onClick={onPublish}
                        disabled={isPublishing}
                        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                    >
                        Regenerate link
                    </button>
                </>
            )}
        </div>
    );
}
