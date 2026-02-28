"use client";

import { TrendingUp, TrendingDown, Users, FileText, CheckCircle2, Activity } from "lucide-react";

export function KPICards({ formsCount, isLoading }: { formsCount: number, isLoading: boolean }) {
    const kpis = [
        {
            title: "Total Forms",
            value: isLoading ? "-" : formsCount.toString(),
            trend: "+12%",
            isPositive: true,
            icon: FileText,
        },
        {
            title: "Active Syncs",
            value: isLoading ? "-" : formsCount.toString(),
            trend: "+5%",
            isPositive: true,
            icon: Activity,
        },
        {
            title: "Total Submissions",
            value: isLoading ? "-" : "1,248",
            trend: "+24%",
            isPositive: true,
            icon: Users,
        },
        {
            title: "Avg. Completion",
            value: isLoading ? "-" : "68.4%",
            trend: "-2.1%",
            isPositive: false,
            icon: CheckCircle2,
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                    <div key={idx} className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-5 flex flex-col justify-between hover:border-gray-700 transition-colors shadow-sm">

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-400 text-sm font-medium">{kpi.title}</span>
                            <Icon className="w-4 h-4 text-gray-600" />
                        </div>

                        <div className="flex items-end justify-between">
                            {isLoading ? (
                                <div className="h-8 w-16 bg-gray-800/50 rounded animate-pulse" />
                            ) : (
                                <h3 className="text-2xl font-semibold text-gray-100 tabular-nums tracking-tight">{kpi.value}</h3>
                            )}

                            {!isLoading && (
                                <div className={`flex items-center text-xs font-semibold ${kpi.isPositive ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                    {kpi.isPositive ? <TrendingUp className="w-3 h-3 mr-1 opacity-70" /> : <TrendingDown className="w-3 h-3 mr-1 opacity-70" />}
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
