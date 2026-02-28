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
            color: 'text-emerald-500',
        },
        {
            id: 2,
            type: 'creation',
            title: 'You created Customer Survey',
            time: '1 hour ago',
            icon: Plus,
            color: 'text-gray-300',
        },
        {
            id: 3,
            type: 'integration',
            title: 'Google Sheets sync active',
            time: '3 hours ago',
            icon: Zap,
            color: 'text-[#9A6BFF]',
        },
        {
            id: 4,
            type: 'submission',
            title: 'New submission on Newsletter Opt-in',
            time: '5 hours ago',
            icon: CheckCircle2,
            color: 'text-emerald-500',
        }
    ];

    return (
        <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-5 flex flex-col h-full shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800/50">
                <h3 className="text-gray-200 font-medium text-sm">Recent Activity</h3>
                <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors">View All</button>
            </div>

            <div className="flex-1 space-y-6">
                {activities.map((activity, idx) => {
                    const Icon = activity.icon;
                    return (
                        <div key={activity.id} className="relative pl-2">
                            {idx !== activities.length - 1 && (
                                <div className="absolute top-5 left-[1.15rem] bottom-[-1.5rem] w-px bg-gray-800/60" />
                            )}

                            <div className="flex items-start gap-4">
                                <div className={`mt-0.5 p-1 bg-[#111116] border border-gray-800 rounded-md relative z-10 ${activity.color}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-300 truncate">{activity.title}</p>
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
