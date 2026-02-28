"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Wand2, Eye } from "lucide-react";

interface BuilderHeaderProps {
    formTitle: string;
    orgId: string;
    formId: string;
    onPublish: () => void;
    isPublishing: boolean;
    chatLink: string | null;
    previewMode: boolean;
    onTogglePreview: () => void;
}

export function BuilderHeader({
    formTitle,
    orgId,
    formId,
    onPublish,
    isPublishing,
    chatLink,
    previewMode,
    onTogglePreview,
}: BuilderHeaderProps) {
    return (
        <header className="flex items-center justify-between px-4 h-12 border-b border-gray-800/80 shrink-0 bg-[#0B0B0F]">
            {/* Left — back link + form name */}
            <div className="flex items-center gap-3">
                <Link
                    href={`/dashboard/${orgId}/forms/${formId}`}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-200 transition-colors text-xs"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                </Link>
                <span className="text-gray-700 text-xs">|</span>
                <div className="flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-[#9A6BFF]" />
                    <span className="text-sm font-medium text-gray-200 max-w-[200px] truncate">{formTitle}</span>
                    <span className="text-[10px] font-semibold text-[#9A6BFF] bg-[#9A6BFF]/10 border border-[#9A6BFF]/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        AI Chat Builder
                    </span>
                </div>
            </div>

            {/* Right — preview toggle + publish */}
            <div className="flex items-center gap-2">
                {/* Mobile only: toggle preview panel */}
                <button
                    onClick={onTogglePreview}
                    className={`md:hidden flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors ${previewMode
                        ? "bg-[#9A6BFF]/10 text-[#9A6BFF] border-[#9A6BFF]/20"
                        : "text-gray-400 border-gray-800 hover:text-white"
                        }`}
                >
                    <Eye className="w-3.5 h-3.5" /> Preview
                </button>

                {chatLink && (
                    <a
                        href={chatLink}
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-800 px-3 py-1.5 rounded transition-colors"
                    >
                        Open link ↗
                    </a>
                )}

                <button
                    onClick={onPublish}
                    disabled={isPublishing}
                    className="flex items-center gap-1.5 bg-[#9A6BFF] hover:bg-[#8555e8] disabled:opacity-60 text-white text-xs font-medium px-4 py-1.5 rounded transition-colors"
                >
                    {isPublishing ? (
                        <>
                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Generating...
                        </>
                    ) : chatLink ? (
                        "Regenerate link"
                    ) : (
                        "Publish & Get Link"
                    )}
                </button>
            </div>
        </header>
    );
}
