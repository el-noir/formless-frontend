"use client";

import React, { useState } from "react";
import { MoreHorizontal, Plus, Database, ExternalLink, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FormsListWidget({
    forms,
    isLoading,
    error,
    currentOrgId,
    isAdmin,
    setForms
}: {
    forms: any[] | null;
    isLoading: boolean;
    error: string | null;
    currentOrgId: string | null;
    isAdmin: boolean;
    setForms: React.Dispatch<React.SetStateAction<any[] | null>>;
}) {
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);

    if (isLoading) {
        return (
            <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-6 h-full flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-gray-800 border-t-gray-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#0B0B0F] border border-red-900/30 rounded-md p-6 h-full flex flex-col items-center justify-center text-center">
                <div className="text-red-400 text-sm mb-1 font-medium">Failed to load forms</div>
                <div className="text-xs text-gray-500">{error}</div>
            </div>
        );
    }

    const hasForms = forms && forms.length > 0;

    const handleDelete = async (id: string) => {
        if (!currentOrgId || !confirm("Remove this form from the organization?")) return;
        try {
            const { deleteOrgForm } = await import('@/lib/api/organizations');
            await deleteOrgForm(currentOrgId, id);
            setForms(prev => prev ? prev.filter((f) => f.id !== id) : []);
        } catch {
            alert("Failed to delete form");
        }
    };

    const handleShare = async (formId: string) => {
        if (!currentOrgId) return;
        setIsGeneratingLink(true);
        try {
            const { generateChatLink } = await import('@/lib/api/organizations');
            const data = await generateChatLink(currentOrgId, formId);
            const fullUrl = `${window.location.origin}${data.data.url}`;
            setShareLink(fullUrl);
            setShareModalOpen(true);
        } catch (err: any) {
            const msg = err instanceof Error ? err.message : "Failed to generate link";
            alert(msg);
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        alert("Copied to clipboard!");
    };

    return (
        <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md flex flex-col h-full shadow-sm overflow-hidden relative min-h-[400px]">
            <div className="flex items-center justify-between p-5 border-b border-gray-800/50 flex-shrink-0">
                <h3 className="text-gray-200 font-medium text-sm">Active Forms</h3>

                <div className="flex items-center gap-2">
                    <Link href="/dashboard/forms/import">
                        <button className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors border border-gray-800 hover:border-gray-700 bg-[#1C1C22] px-2 py-1 rounded">
                            <Plus className="w-3.5 h-3.5" />
                            New
                        </button>
                    </Link>
                </div>
            </div>

            {!hasForms ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#111116]/30">
                    <Database className="w-6 h-6 text-gray-600 mb-3" />
                    <h4 className="text-gray-300 font-medium text-sm mb-1">No forms connected</h4>
                    <p className="text-gray-500 text-xs max-w-[200px] mx-auto mb-4">Import a Google Form to get started.</p>
                    <Link href="/dashboard/forms/import">
                        <button className="bg-[#1C1C22] hover:bg-white-[0.02] border border-gray-800 text-gray-300 py-1.5 px-4 rounded-md text-sm transition-colors">
                            Import Form
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="text-xs text-gray-500 bg-[#0B0B0F] border-b border-gray-800/50">
                            <tr>
                                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                                <th scope="col" className="px-5 py-3 font-medium hidden md:table-cell">Questions</th>
                                <th scope="col" className="px-5 py-3 font-medium text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/40">
                            {forms.slice(0, 10).map((f: any) => (
                                <tr key={f.formId || f.id || f.name} className="hover:bg-[#111116] transition-colors group">
                                    <td className="px-5 py-3.5 whitespace-nowrap w-[100px]">
                                        <div className="flex items-center gap-2">
                                            {f.status === 'ACTIVE' || f.isSynced ? (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-gray-300 text-xs">Active</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full border border-gray-600" />
                                                    <span className="text-gray-500 text-xs">Idle</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 max-w-[300px] truncate w-full">
                                        <div className="text-gray-200 font-medium truncate">{f.title || f.name}</div>
                                    </td>
                                    <td className="px-5 py-3.5 truncate hidden md:table-cell w-[150px]">
                                        <div className="text-xs text-gray-500 font-mono tracking-tight truncate">{f.questionCount ?? 0} Questions</div>
                                    </td>
                                    <td className="px-5 py-3.5 text-right whitespace-nowrap w-[80px]">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1 px-2 text-xs text-gray-400 hover:text-gray-200 border border-transparent hover:border-gray-800 hover:bg-[#1C1C22] rounded transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[180px] bg-[#111116] border-gray-800 z-[100]">
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/dashboard/organizations/${currentOrgId}/forms/${f.id}`}
                                                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] cursor-pointer"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        View Form
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] cursor-pointer"
                                                    onClick={() => handleShare(f.id)}
                                                    disabled={isGeneratingLink}
                                                >
                                                    <Share2 className="w-4 h-4 text-[#9A6BFF]" />
                                                    <span className="text-[#9A6BFF]">Share AI Chat</span>
                                                </DropdownMenuItem>
                                                {isAdmin && (
                                                    <>
                                                        <DropdownMenuSeparator className="bg-gray-800" />
                                                        <DropdownMenuItem
                                                            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 cursor-pointer focus:bg-red-400/10 focus:text-red-400"
                                                            onClick={() => handleDelete(f.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete Form
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Share Modal integrated directly in widget */}
            {shareModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-md">
                    <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-semibold text-white mb-4">Share AI Chat</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Anyone with this link can interact with the AI to complete this form.
                        </p>
                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                readOnly
                                value={shareLink}
                                className="flex-1 bg-[#111116] border border-gray-800 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-[#9A6BFF]"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={copyToClipboard}
                                className="bg-[#9A6BFF] hover:bg-[#8555e8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShareModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
