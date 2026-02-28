"use client";

import { TrendingUp, TrendingDown, Users, FileText, CheckCircle2, Activity } from "lucide-react";

export function KPICards({ formsCount, isLoading }: { formsCount: number, isLoading: boolean }) {
    // In a real app, these would come from an API. For now, we mock some beautiful stats
    // based on the connected forms count.
    const kpis = [
        {
            title: "Total Forms",
            value: isLoading ? "-" : formsCount.toString(),
            trend: "+12%",
            isPositive: true,
            icon: FileText,
            color: "text-blue-400",
            bgBase: "from-blue-500/10 to-transparent",
        },
        {
            title: "Active Syncs",
            value: isLoading ? "-" : formsCount.toString(), // Mock syncing all
            trend: "+5%",
            isPositive: true,
            icon: Activity,
            color: "text-[#9A6BFF]",
            bgBase: "from-[#9A6BFF]/10 to-transparent",
        },
        {
            title: "Total Submissions",
            value: isLoading ? "-" : "1,248",
            trend: "+24%",
            isPositive: true,
            icon: Users,
            color: "text-emerald-400",
            bgBase: "from-emerald-500/10 to-transparent",
        },
        {
            title: "Completion Rate",
            value: isLoading ? "-" : "68.4%",
            trend: "-2.1%",
            isPositive: false,
            icon: CheckCircle2,
            color: "text-amber-400",
            bgBase: "from-amber-500/10 to-transparent",
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                    <div key={idx} className="bg-[#111116] border border-gray-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-gray-700 transition-colors">
                        {/* Subtle background gradient shine */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${kpi.bgBase} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-gray-400 text-sm font-medium">{kpi.title}</span>
                            <div className={`p-2 bg-[#1C1C22] rounded-lg border border-gray-800/50 ${kpi.color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="flex items-baseline gap-3 relative z-10">
                            {isLoading ? (
                                <div className="h-8 w-16 bg-gray-800 rounded animate-pulse" />
                            ) : (
                                <h3 className="text-3xl font-bold text-white font-mono tracking-tight">{kpi.value}</h3>
                            )}

                            {!isLoading && (
                                <div className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${kpi.isPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                                    }`}>
                                    {kpi.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {kpi.trend}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
