"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useOrgStore } from "@/stores/orgStore";
import { getOrgForms } from "@/lib/api/organizations";
import { KPICards } from "@/components/dashboard/KPICards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FormsListWidget } from "@/components/dashboard/FormsListWidget";
import { OrganizationSwitcher } from "@/components/dashboard/OrganizationSwitcher";
import { IntegrationsView } from "@/components/dashboard/IntegrationsView";
import { FormsView } from "@/components/dashboard/FormsView";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Plus, Wand2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter, useParams } from "next/navigation";

function DashboardContent() {
  const { user, accessToken } = useAuthStore();
  const { currentOrgId, isAdminOfCurrentOrg } = useOrgStore();
  const params = useParams();
  const orgId = params.orgId as string;
  const [forms, setForms] = useState<any[] | null>(null);
  const [loadingForms, setLoadingForms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchForms = async (id: string) => {
    setForms(null);  // clear immediately — prevents stale data from previous org showing
    setLoadingForms(true);
    setError(null);
    try {
      const data = await getOrgForms(id);
      setForms(data.forms || []);
    } catch (err: any) {
      console.error("Error fetching forms:", err);
      setError(err?.message || "Failed to fetch forms");
    } finally {
      setLoadingForms(false);
    }
  };

  useEffect(() => {
    // Use orgId from URL (source of truth) — not currentOrgId from Zustand,
    // which can be momentarily stale during org switches.
    if (accessToken && orgId) {
      fetchForms(orgId);
    } else {
      setForms([]);
    }
  }, [accessToken, orgId]); // orgId, not currentOrgId

  return (
    <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
      <div className="mb-8">
        <OrganizationSwitcher />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-100 tracking-tight mb-1">
            Overview
          </h2>
          <p className="text-gray-500 text-sm">Welcome back, {user?.firstName || 'there'}. Here's what's happening.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/${orgId}/integrations`)}
            className="hidden sm:flex items-center justify-center bg-[#0B0B0F] hover:bg-[#111116] text-gray-300 text-sm font-medium py-1.5 px-4 rounded-md border border-gray-800 transition-colors shadow-sm"
          >
            Integrations
          </button>
          <MagneticButton onClick={() => router.push(`/dashboard/${orgId}/forms`)} className="bg-[#9A6BFF] hover:bg-[#8555e8] text-white py-1.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Import
          </MagneticButton>
        </div>
      </div>

      <KPICards formsCount={forms?.length || 0} isLoading={loadingForms} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <FormsListWidget
            forms={forms}
            isLoading={loadingForms}
            error={error}
            currentOrgId={currentOrgId}
            isAdmin={isAdminOfCurrentOrg()}
            setForms={setForms}
          />
        </div>
        <div className="xl:col-span-1">
          <RecentActivity />
        </div>
      </div>

      <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative shadow-sm">
        <div className="flex items-start gap-4 z-10">
          <div className="p-2.5 bg-[#1C1C22] border border-gray-800 text-gray-400 rounded-md shrink-0">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-gray-200 font-medium text-sm mb-0.5">Formless AI Concierge</h4>
            <p className="text-gray-500 text-xs max-w-xl">Generate highly optimized, conversion-focused forms automatically by describing your use case.</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/dashboard/${orgId}/forms`)}
          className="shrink-0 bg-[#111116] hover:bg-[#1C1C22] border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white font-medium text-xs py-2 px-5 rounded-md transition-all shadow-sm z-10 w-full md:w-auto"
        >
          Go to Forms
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#9A6BFF] animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
