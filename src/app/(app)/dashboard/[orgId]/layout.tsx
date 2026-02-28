"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useOrgStore } from "@/stores/orgStore";

export default function OrgScopeLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const orgId = params.orgId as string;
    const { setCurrentOrg, currentOrgId } = useOrgStore();

    useEffect(() => {
        if (orgId && orgId !== currentOrgId) {
            console.log("Syncing org context from URL:", orgId);
            setCurrentOrg(orgId);
        }
    }, [orgId, currentOrgId, setCurrentOrg]);

    return <>{children}</>;
}
