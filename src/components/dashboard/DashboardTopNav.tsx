"use client";

import { Search, Bell, User, LogOut, Settings as SettingsIcon, Shield } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutUser, fetchUserProfile } from "@/lib/api/auth";
import { useEffect } from "react";

export function DashboardTopNav() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        fetchUserProfile().catch(console.error);
    }, []);

    const pathSegments = pathname.split('/').filter(Boolean);
    const currentPage = pathSegments[pathSegments.length - 1] || 'overview';
    const displayTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    const handleLogout = async () => {
        await logoutUser();
        router.push('/sign-in');
    };

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

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 outline-none">
                            <div className="w-8 h-8 rounded-sm bg-[#1C1C22] border border-gray-800 flex items-center justify-center text-gray-300 font-medium text-xs hover:border-gray-600 transition-colors">
                                {user?.firstName?.[0] || <User className="w-3.5 h-3.5 text-gray-500" />}
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[#111116] border-gray-800 text-gray-200">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem
                            onClick={() => router.push('/dashboard?view=settings')}
                            className="flex items-center gap-2 focus:bg-white/[0.05] focus:text-white cursor-pointer"
                        >
                            <SettingsIcon className="w-4 h-4 text-gray-500" />
                            <span>Profile Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 focus:bg-white/[0.05] focus:text-white cursor-pointer">
                            <Shield className="w-4 h-4 text-gray-500" />
                            <span>Security</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
