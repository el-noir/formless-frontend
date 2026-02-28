"use client";

import { MoreHorizontal, Plus, Database } from "lucide-react";
import Link from "next/link";

export function FormsListWidget({ forms, isLoading, error }: { forms: any[] | null, isLoading: boolean, error: string | null }) {

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

    return (
        <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md flex flex-col h-full shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-800/50">
                <h3 className="text-gray-200 font-medium text-sm">Active Forms</h3>

                <div className="flex items-center gap-2">
                    <Link href="/forms">
                        <button className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
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
                    <p className="text-gray-500 text-xs max-w-[200px] mx-auto mb-4">Connect your Google account to start syncing form submissions.</p>
                    <button onClick={() => window.location.href = '/integrations'} className="bg-[#1C1C22] hover:bg-white-[0.02] border border-gray-800 text-gray-300 py-1.5 px-4 rounded-md text-sm transition-colors">
                        Setup Integration
                    </button>
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="text-xs text-gray-500 bg-[#0B0B0F] border-b border-gray-800/50">
                            <tr>
                                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                                <th scope="col" className="px-5 py-3 font-medium hidden md:table-cell">ID</th>
                                <th scope="col" className="px-5 py-3 font-medium text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/40">
                            {forms.slice(0, 5).map((f: any) => (
                                <tr key={f.formId || f.id || f.name} className="hover:bg-[#111116] transition-colors group">
                                    <td className="px-5 py-3.5 whitespace-nowrap w-[100px]">
                                        <div className="flex items-center gap-2">
                                            {f.isSynced ? (
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
                                    <td className="px-5 py-3.5 max-w-[200px] truncate w-full">
                                        <div className="text-gray-200 font-medium truncate">{f.title || f.name}</div>
                                    </td>
                                    <td className="px-5 py-3.5 truncate hidden md:table-cell w-[200px]">
                                        <div className="text-xs text-gray-500 font-mono tracking-tight truncate">{f.formId || f.id}</div>
                                    </td>
                                    <td className="px-5 py-3.5 text-right whitespace-nowrap w-[80px]">
                                        <button className="p-1 px-2 text-xs text-gray-400 hover:text-gray-200 border border-transparent hover:border-gray-800 hover:bg-[#1C1C22] rounded transition-all opacity-0 group-hover:opacity-100">
                                            Manage
                                        </button>
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
