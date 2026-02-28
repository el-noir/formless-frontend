"use client";

import { useAuthStore } from "@/stores/authStore";
import { Search, Bell, Command, User } from "lucide-react";
import { usePathname } from "next/navigation";

export function DashboardTopNav() {
    const { user } = useAuthStore();
    const pathname = usePathname();

    // Simple breadcrumb logic based on pathname
    const pathSegments = pathname.split('/').filter(Boolean);
    const currentPage = pathSegments[pathSegments.length - 1] || 'overview';
    const displayTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    return (
        <header className="h-16 bg-[#0B0B0F]/90 backdrop-blur-md border-b border-gray-800/60 px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <div className="md:hidden text-white font-bold text-lg tracking-tight mr-4">
                    <span className="text-[#9A6BFF]">F</span>.
                </div>
                <div className="flex flex-col">
                    <nav className="text-xs text-gray-500 font-medium tracking-wider uppercase mb-0.5 hidden sm:block">
                        Dashboard / {pathSegments.length > 1 ? pathSegments[0] : ''}
                    </nav>
                    <h1 className="text-white text-lg font-semibold leading-tight">{displayTitle}</h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Global Search Stub */}
                <div className="hidden lg:flex items-center relative">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3" />
                    <input
                        type="text"
                        placeholder="Search forms, submissions..."
                        className="bg-[#1C1C22] border border-gray-800 text-white text-sm rounded-full pl-9 pr-12 py-1.5 focus:outline-none focus:border-[#9A6BFF] focus:ring-1 focus:ring-[#9A6BFF] transition-all w-64 placeholder:text-gray-500"
                    />
                    <div className="absolute right-3 flex items-center gap-1 text-gray-500">
                        <Command className="w-3 h-3" />
                        <span className="text-xs font-medium">K</span>
                    </div>
                </div>

                {/* Action Icons */}
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#9A6BFF] rounded-full border border-[#0B0B0F]"></span>
                </button>

                {/* User Profile Stub */}
                <button className="flex items-center gap-2 pl-2 border-l border-gray-800">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9A6BFF] to-[#6E8BFF] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(154,107,255,0.3)]">
                        {user?.firstName?.[0] || <User className="w-4 h-4" />}
                    </div>
                </button>
            </div>
        </header>
    );
}
