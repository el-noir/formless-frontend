"use client";

import { useAuthStore } from "@/stores/authStore";
import { Search, Bell, User } from "lucide-react";
import { usePathname } from "next/navigation";

export function DashboardTopNav() {
    const { user } = useAuthStore();
    const pathname = usePathname();

    const pathSegments = pathname.split('/').filter(Boolean);
    const currentPage = pathSegments[pathSegments.length - 1] || 'overview';
    const displayTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    return (
        <header className="h-16 bg-[#0B0B0F] border-b border-gray-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <div className="md:hidden text-white font-bold flex items-center mr-2">
                    <span className="w-5 h-5 bg-[#9A6BFF] rounded-sm"></span>
                </div>
                <div className="flex items-center text-sm font-medium">
                    <span className="text-gray-500 hidden sm:inline-block">Dashboard / </span>
                    <span className="text-gray-200 sm:ml-1.5">{displayTitle}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Flat Search Input */}
                <div className="hidden lg:flex items-center relative group">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-[#111116] border border-gray-800 hover:border-gray-700 text-gray-200 text-sm rounded-md pl-8 pr-10 py-1.5 focus:outline-none focus:border-[#9A6BFF] transition-colors w-56 placeholder:text-gray-600 focus:bg-[#0B0B0F]"
                    />
                    <div className="absolute right-2 px-1 text-[10px] font-medium text-gray-500 border border-gray-800 rounded bg-[#1C1C22]">
                        ⌘K
                    </div>
                </div>

                <div className="h-4 w-px bg-gray-800 mx-1 hidden sm:block"></div>

                <button className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-white-[0.02]">
                    <Bell className="w-4 h-4" />
                </button>

                <button className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-sm bg-[#1C1C22] border border-gray-800 flex items-center justify-center text-gray-300 font-medium text-xs hover:border-gray-600 transition-colors">
                        {user?.firstName?.[0] || <User className="w-3.5 h-3.5 text-gray-500" />}
                    </div>
                </button>
            </div>
        </header>
    );
}
