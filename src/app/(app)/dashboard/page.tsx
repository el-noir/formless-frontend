"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrgStore } from "@/stores/orgStore";
import { Loader2 } from "lucide-react";

export default function DashboardRootRedirect() {
  const router = useRouter();
  const { currentOrgId, organizations } = useOrgStore();

  useEffect(() => {
    // If we have a current org, go there
    if (currentOrgId) {
      router.replace(`/dashboard/${currentOrgId}`);
    } else if (organizations.length > 0) {
      // Otherwise go to the first one
      router.replace(`/dashboard/${organizations[0].id}`);
    } else {
      // Fallback to organizations list to pick/create
      router.replace('/dashboard/organizations');
    }
  }, [currentOrgId, organizations, router]);

  return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF]" />
    </div>
  );
}
