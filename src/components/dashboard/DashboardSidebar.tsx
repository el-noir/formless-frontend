"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, FormInput, Inbox, Blocks, Settings } from "lucide-react";
import { Suspense } from "react";

function SidebarLinks() {
    const pathname = usePathname();

    const links = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Forms", href: "/dashboard/forms", icon: FormInput },
        { name: "Submissions", href: "/dashboard/submissions", icon: Inbox },
        { name: "Integrations", href: "/dashboard/integrations", icon: Blocks },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <nav className="flex-1 py-6 px-4 space-y-1">
            {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${isActive
                            ? "bg-[#1C1C22] text-white font-medium"
                            : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
                            }`}
                    >
                        <Icon className={`w-4 h-4 shrink-0 col-span-1 ${isActive ? "text-white" : "text-gray-500"}`} />
                        {link.name}
                    </Link>
                );
            })}
        </nav>
    );
}

export function DashboardSidebar() {

    return (
        <aside className="w-64 flex-shrink-0 bg-[#0B0B0F] border-r border-gray-800/80 hidden md:flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-gray-800/80">
                <span className="text-white font-semibold flex items-center gap-1.5 tracking-tight">
                    <span className="w-4 h-4 bg-[#9A6BFF] rounded-sm"></span>
                    Formless
                </span>
            </div>

            <Suspense fallback={<nav className="flex-1 py-6 px-4 space-y-1" />}>
                <SidebarLinks />
            </Suspense>

            <div className="p-4 border-t border-gray-800/80">
                <div className="bg-[#111116] rounded-md p-4 text-sm border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-gray-200 font-medium text-xs">Pro Plan</h4>
                        <span className="text-[#9A6BFF] text-xs font-semibold">12%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-sm h-1 mb-2">
                        <div className="bg-[#9A6BFF] h-full rounded-sm" style={{ width: "12%" }} />
                    </div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">1,240 / 10,000</p>
                </div>
            </div>
        </aside>
    );
}
