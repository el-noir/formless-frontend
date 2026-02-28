"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ChevronRight, ArrowLeft, Home } from "lucide-react";
import { useOrgStore } from "@/stores/orgStore";

interface DashboardBreadcrumbsProps {
    backHref?: string;
    backLabel?: string;
}

export function DashboardBreadcrumbs({ backHref, backLabel }: DashboardBreadcrumbsProps) {
    const params = useParams();
    const pathname = usePathname();
    const { getCurrentOrg } = useOrgStore();

    const orgId = params?.orgId as string;
    const currentOrg = getCurrentOrg();

    // Map segments to human-readable names
    const segmentMap: Record<string, string> = {
        forms: "Forms",
        integrations: "Integrations",
        settings: "Settings",
        members: "Members",
        organizations: "Organizations",
        import: "Import",
    };

    // Parse segments from pathname
    // e.g., /dashboard/org_123/forms/import -> ["forms", "import"]
    const segments = pathname
        .split("/")
        .filter((s) => s && s !== "dashboard" && s !== orgId);

    return (
        <div className="flex flex-col gap-4 mb-8">
            {/* Back Button */}
            {backHref && (
                <Link
                    href={backHref}
                    className="flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium w-fit group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {backLabel || "Back"}
                </Link>
            )}

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-medium">
                <Link
                    href={`/dashboard/${orgId}`}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                    <Home className="w-3.5 h-3.5" />
                    <span className="max-w-[120px] truncate">{currentOrg?.name || "Dashboard"}</span>
                </Link>

                {segments.map((segment, index) => {
                    const label = segmentMap[segment] || segment;
                    const href = `/dashboard/${orgId}/${segments.slice(0, index + 1).join("/")}`;
                    const isLast = index === segments.length - 1;

                    // Skip numeric IDs or weird hashes for now in the breadcrumb list if they aren't mapped
                    if (segment.match(/^[0-9a-fA-F]{24}$/) || segment.length > 20) {
                        return null;
                    }

                    return (
                        <React.Fragment key={href}>
                            <ChevronRight className="w-3 h-3 text-gray-700 shrink-0" />
                            {isLast ? (
                                <span className="text-gray-300">{label}</span>
                            ) : (
                                <Link
                                    href={href}
                                    className="text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {label}
                                </Link>
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>
        </div>
    );
}
