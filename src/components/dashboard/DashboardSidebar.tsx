"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FormInput, Inbox, Blocks, Settings, Menu } from "lucide-react";

export function DashboardSidebar() {
    const pathname = usePathname();

    const links = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Forms", href: "/forms", icon: FormInput },
        { name: "Submissions", href: "/submissions", icon: Inbox },
        { name: "Integrations", href: "/integrations", icon: Blocks },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <aside className="w-64 flex-shrink-0 bg-[#0B0B0F]/90 backdrop-blur-md border-r border-gray-800/60 hidden md:flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-gray-800/60">
                <span className="text-white font-bold text-xl tracking-tight">
                    Formless
                    <span className="text-[#9A6BFF]">.</span>
                </span>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/dashboard');
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive
                                    ? "bg-[#9A6BFF]/10 text-[#9A6BFF] font-medium border border-[#9A6BFF]/20 shadow-[0_0_15px_-3px_rgba(154,107,255,0.2)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800/60">
                <div className="bg-[#1C1C22] rounded-xl p-4 text-sm relative overflow-hidden group border border-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9A6BFF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h4 className="text-white font-medium mb-1">Pro Plan</h4>
                    <p className="text-gray-400 text-xs mb-3">1,240/10,000 limits</p>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div className="bg-[#9A6BFF] h-1.5 rounded-full" style={{ width: "12%" }} />
                    </div>
                </div>
            </div>
        </aside>
    );
}
