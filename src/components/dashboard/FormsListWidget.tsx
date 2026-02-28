"use client";

import React, { useState } from "react";
import { MoreHorizontal, Plus, Database, ExternalLink, Wand2, Trash2 } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, useRouter } from "next/navigation";

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
    const params = useParams();
    const router = useRouter();
    const orgId = params.orgId as string;

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


    return (
        <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md flex flex-col h-full shadow-sm overflow-hidden relative min-h-[400px]">
            <div className="flex items-center justify-between p-5 border-b border-gray-800/50 flex-shrink-0">
                <h3 className="text-gray-200 font-medium text-sm">Active Forms</h3>

                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/${orgId}/forms/import`}>
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
                    <Link href={`/dashboard/${orgId}/forms/import`}>
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
                                                        href={`/dashboard/${orgId}/forms/${f.id}`}
                                                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] cursor-pointer"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        View Form
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/dashboard/${orgId}/forms/${f.id}/builder`}
                                                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] cursor-pointer"
                                                    >
                                                        <Wand2 className="w-4 h-4" />
                                                        Configure AI Chat
                                                    </Link>
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

        </div>
    );
}
