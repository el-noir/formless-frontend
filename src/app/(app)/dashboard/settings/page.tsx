"use client";

import React from "react";
import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Settings</h1>
                <p className="text-gray-500 text-sm font-medium">Manage your workspace and account preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</h3>
                    <nav className="space-y-1">
                        <button className="w-full text-left px-3 py-2 rounded-md transition-colors bg-[#1C1C22] text-white text-sm font-medium">General</button>
                        <button className="w-full text-left px-3 py-2 rounded-md transition-colors text-gray-500 hover:text-white hover:bg-white/[0.02] text-sm">Security</button>
                        <button className="w-full text-left px-3 py-2 rounded-md transition-colors text-gray-500 hover:text-white hover:bg-white/[0.02] text-sm">Notifications</button>
                    </nav>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="bg-[#0B0B0F] border border-gray-800 rounded-xl p-6">
                        <h4 className="text-gray-200 font-medium mb-4">Workspace Info</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 px-0.5">Workspace Name</label>
                                <input type="text" className="w-full bg-[#111116] border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#9A6BFF]" placeholder="My Workspace" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
