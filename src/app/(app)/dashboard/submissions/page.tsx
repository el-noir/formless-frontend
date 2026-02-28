"use client";

import React from "react";
import { Inbox } from "lucide-react";

export default function SubmissionsPage() {
    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Submissions</h1>
                <p className="text-gray-500 text-sm font-medium">Manage and view all your form responses</p>
            </div>

            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-800 rounded-2xl bg-[#0B0B0F]/50">
                <div className="w-16 h-16 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-center text-gray-600 mb-6">
                    <Inbox className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">No submissions yet</h3>
                <p className="text-gray-500 text-sm max-w-xs text-center">Your form responses will appear here once you start receiving them.</p>
            </div>
        </div>
    );
}
