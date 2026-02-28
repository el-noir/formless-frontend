"use client";

import { useRequireAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading } = useRequireAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center">
                    <div className="relative w-8 h-8 mb-6">
                        <div className="absolute inset-0 border-2 border-gray-800 rounded-full"></div>
                        <div className="absolute inset-0 border-t-2 border-[#9A6BFF] rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex overflow-hidden">
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
