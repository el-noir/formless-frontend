"use client";

import { MagneticButton } from "@/components/ui/MagneticButton";
import { ArrowRight, MoreVertical, LayoutGrid, List } from "lucide-react";

export function FormsListWidget({ forms, isLoading, error }: { forms: any[] | null, isLoading: boolean, error: string | null }) {

    if (isLoading) {
        return (
            <div className="bg-[#111116] border border-gray-800/80 rounded-xl p-6 h-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-t-2 border-[#9A6BFF] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#111116] border border-red-900/30 rounded-xl p-6 h-full flex flex-col items-center justify-center text-center">
                <div className="text-red-400 mb-2">Failed to load forms</div>
                <div className="text-sm text-gray-500">{error}</div>
            </div>
        );
    }

    const hasForms = forms && forms.length > 0;

    return (
        <div className="bg-[#111116] border border-gray-800/80 rounded-xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-white font-medium text-lg">Top Performing Forms</h3>
                    <p className="text-sm text-gray-400 mt-1">Your most active data collection endpoints</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center p-1 bg-[#1C1C22] rounded-lg border border-gray-800">
                        <button className="p-1.5 text-white bg-gray-800/80 rounded shadow-sm"><List className="w-4 h-4" /></button>
                        <button className="p-1.5 text-gray-500 hover:text-white transition-colors"><LayoutGrid className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {!hasForms ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-800/60 rounded-lg p-8 bg-[#1C1C22]/30 text-center">
                    <div className="w-16 h-16 bg-gray-800/40 rounded-full flex items-center justify-center mb-4">
                        <LayoutGrid className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-white font-medium mb-2">No connected forms</h4>
                    <p className="text-gray-400 text-sm max-w-xs mb-6">Connect your Google account or create a new internal form to start collecting data.</p>
                    <MagneticButton onClick={() => window.location.href = '/integrations'} className="bg-[#9A6BFF] hover:bg-[#8555e8] text-white py-2 px-5 rounded-lg text-sm font-medium transition-colors">
                        Connect First Form
                    </MagneticButton>
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="text-xs text-gray-500 uppercase bg-[#1C1C22]/50 border-b border-gray-800 font-medium">
                            <tr>
                                <th scope="col" className="px-4 py-3 rounded-tl-lg hidden sm:table-cell">Status</th>
                                <th scope="col" className="px-4 py-3">Form Name</th>
                                <th scope="col" className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                            {forms.slice(0, 5).map((f: any) => (
                                <tr key={f.formId || f.id || f.name} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <div className="flex items-center gap-2">
                                            {f.isSynced ? (
                                                <>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                                                    <span className="text-emerald-400/90 text-xs font-medium">Synced</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                                                    <span className="text-gray-500 text-xs font-medium">Idle</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 max-w-[200px] truncate">
                                        <div className="text-white font-medium mb-0.5 truncate pr-4">{f.title || f.name}</div>
                                        <div className="text-xs text-gray-500 truncate font-mono hidden sm:block">{f.formId || f.id}</div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => window.location.href = '/integrations/google-forms'}
                                                className="text-xs font-medium flex items-center text-[#9A6BFF] hover:text-white transition-colors bg-[#9A6BFF]/10 py-1.5 px-3 rounded-md border border-[#9A6BFF]/20"
                                            >
                                                {f.isSynced ? 'Manage Sync' : 'Configure'}
                                            </button>
                                            <button className="p-1.5 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 hidden sm:block">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {forms.length > 5 && (
                        <div className="mt-4 text-center">
                            <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 w-full py-2">
                                View all {forms.length} forms <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
