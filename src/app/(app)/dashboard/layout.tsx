"use client";

import { useRequireAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading } = useRequireAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#0B0B0F] to-[#0B0B0F] opacity-50" />
                <div className="text-center relative z-10 flex flex-col items-center">
                    <div className="relative w-12 h-12 mb-6">
                        <div className="absolute inset-0 border-t-2 border-[#9A6BFF] rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-r-2 border-[#6E8BFF] rounded-full animate-spin direction-reverse"></div>
                    </div>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-500 font-medium tracking-widest text-sm uppercase">Loading Workspace</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex overflow-hidden">
            {/* Background glow effects for the app shell */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#9A6BFF] opacity-[0.03] blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#6E8BFF] opacity-[0.03] blur-[120px] rounded-full"></div>
            </div>

            <DashboardSidebar />

            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                <DashboardTopNav />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
