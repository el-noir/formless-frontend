"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrgStore } from "@/stores/orgStore";
import { Loader2 } from "lucide-react";
import { getMyOrganizations } from "@/lib/api/organizations";

export default function DashboardRootRedirect() {
  const router = useRouter();
  const { currentOrgId, setOrganizations } = useOrgStore();

  useEffect(() => {
    const verifyAndRedirect = async () => {
      if (currentOrgId) {
        router.replace(`/dashboard/${currentOrgId}`);
        return;
      }

      try {
        const orgs = await getMyOrganizations();
        if (orgs && orgs.length > 0) {
          const summaries = orgs.map((o: any) => ({
            id: String(o._id || o.id),
            name: o.name,
            plan: o.plan || 'free',
            myRole: o.myRole || 'owner',
            memberCount: o.memberCount || 1
          }));
          setOrganizations(summaries);
          router.replace(`/dashboard/${summaries[0].id}`);
        } else {
          router.replace('/dashboard/organizations');
        }
      } catch (err) {
        console.error(err);
        router.replace('/dashboard/organizations');
      }
    };

    verifyAndRedirect();
  }, [currentOrgId, router, setOrganizations]);

  return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
    </div>
  );
}
