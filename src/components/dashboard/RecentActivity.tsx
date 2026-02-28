"use client";

import { CheckCircle2, Plus, Zap } from "lucide-react";

export function RecentActivity() {
    const activities = [
        {
            id: 1,
            type: 'submission',
            title: 'New submission on Contact Form',
            time: '2 mins ago',
            icon: CheckCircle2,
            iconColor: 'text-emerald-400',
            iconBg: 'bg-emerald-400/10',
        },
        {
            id: 2,
            type: 'creation',
            title: 'You created Customer Survey',
            time: '1 hour ago',
            icon: Plus,
            iconColor: 'text-blue-400',
            iconBg: 'bg-blue-400/10',
        },
        {
            id: 3,
            type: 'integration',
            title: 'Google Sheets integration synced',
            time: '3 hours ago',
            icon: Zap,
            iconColor: 'text-[#9A6BFF]',
            iconBg: 'bg-[#9A6BFF]/10',
        },
        {
            id: 4,
            type: 'submission',
            title: 'New submission on Newsletter Opt-in',
            time: '5 hours ago',
            icon: CheckCircle2,
            iconColor: 'text-emerald-400',
            iconBg: 'bg-emerald-400/10',
        }
    ];

    return (
        <div className="bg-[#111116] border border-gray-800/80 rounded-xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-medium text-lg">Recent Activity</h3>
                <button className="text-xs text-[#9A6BFF] hover:text-white transition-colors">View All</button>
            </div>

            <div className="flex-1 space-y-6">
                {activities.map((activity, idx) => {
                    const Icon = activity.icon;
                    return (
                        <div key={activity.id} className="relative pl-4">
                            {/* Timeline connecting line */}
                            {idx !== activities.length - 1 && (
                                <div className="absolute top-6 left-[1.1rem] bottom-[-1.5rem] w-px bg-gray-800/60" />
                            )}

                            <div className="flex items-start gap-4">
                                <div className={`mt-0.5 p-1.5 rounded-full ${activity.iconBg} ${activity.iconColor} shadow-[0_0_10px_rgba(0,0,0,0.2)] ring-4 ring-[#111116] relative z-10`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-200 truncate">{activity.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
