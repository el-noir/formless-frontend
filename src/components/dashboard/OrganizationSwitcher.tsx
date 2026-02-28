"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { getMyOrganizations } from "@/lib/api/organizations";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function OrganizationSwitcher() {
    const { user, accessToken } = useAuthStore();
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentOrg, setCurrentOrg] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchOrgs = async () => {
            if (!accessToken) return;
            try {
                setLoading(true);
                const orgs = await getMyOrganizations();
                setOrganizations(orgs);
                if (orgs.length > 0) {
                    // For now, default to the first one available
                    setCurrentOrg(orgs[0]);
                }
            } catch (err) {
                console.error("Failed to fetch organizations", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrgs();
    }, [accessToken]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-gray-400 text-sm px-3 py-2 border border-gray-800 rounded-lg w-fit">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Loading workspaces...</span>
            </div>
        );
    }

    // If no orgs, just show a create button state directly
    if (organizations.length === 0) {
        return (
            <Link href="/organizations/new">
                <button className="flex items-center gap-2 bg-[#1C1C22] hover:bg-[#252530] text-gray-200 text-sm font-medium px-4 py-2 rounded-lg border border-gray-800 transition-colors shadow-sm">
                    <Plus className="w-4 h-4 text-[#9A6BFF]" />
                    Create Organization
                </button>
            </Link>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between gap-3 bg-[#0B0B0F] hover:bg-[#111116] text-gray-200 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9A6BFF] focus:border-transparent min-w-[200px]">
                <div className="flex items-center gap-2 truncate">
                    <div className="w-6 h-6 rounded bg-[#1C1C22] border border-gray-800 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <span className="truncate">{currentOrg?.name || "Select Workspace"}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[240px] bg-[#111116] border-gray-800 shadow-xl" align="start">
                <DropdownMenuLabel className="text-xs text-gray-500 font-medium px-2 py-1.5 uppercase tracking-wider">
                    Workspaces
                </DropdownMenuLabel>

                {organizations.map((org) => (
                    <DropdownMenuItem
                        key={org._id}
                        className={`flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md ${currentOrg?._id === org._id
                                ? "bg-[#1C1C22] text-white"
                                : "text-gray-300 focus:bg-white/[0.04] focus:text-white"
                            }`}
                        onClick={() => setCurrentOrg(org)}
                    >
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${currentOrg?._id === org._id ? "bg-[#9A6BFF] text-white" : "bg-[#1C1C22] border border-gray-800 text-gray-400"}`}>
                            {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-medium">{org.name}</span>
                        </div>
                        {currentOrg?._id === org._id && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#9A6BFF]" />
                        )}
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="bg-gray-800 my-1" />

                <DropdownMenuItem asChild>
                    <Link
                        href="/organizations/new"
                        className="flex items-center gap-2 px-2 py-2 cursor-pointer text-gray-300 focus:bg-white/[0.04] focus:text-white rounded-md group"
                    >
                        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-transparent border border-dashed border-gray-600 group-hover:border-gray-400 transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium">Create workspace</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
