"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { getGoogleForms } from "@/lib/api/integrations";
import { KPICards } from "@/components/dashboard/KPICards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FormsListWidget } from "@/components/dashboard/FormsListWidget";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Plus, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { OrganizationSwitcher } from "@/components/dashboard/OrganizationSwitcher";

function Dashboard() {
  const { user, accessToken } = useAuthStore();
  const [forms, setForms] = useState<any[] | null>(null);
  const [loadingForms, setLoadingForms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = async () => {
    setLoadingForms(true);
    setError(null);
    try {
      const data = await getGoogleForms();
      setForms(data);
    } catch (err: any) {
      console.error("Error fetching forms:", err);
      // If 401/404, they haven't connected yet
      const status = Number(err?.status || err?.statusCode);
      if (status === 401 || status === 404) {
        setForms([]);
      } else {
        setError(err?.message || "Failed to fetch forms");
      }
    } finally {
      setLoadingForms(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchForms();
    }
  }, [accessToken]);

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
          <Link href="/integrations">
            <button className="hidden sm:flex items-center justify-center bg-[#0B0B0F] hover:bg-[#111116] text-gray-300 text-sm font-medium py-1.5 px-4 rounded-md border border-gray-800 transition-colors shadow-sm">
              Integrations
            </button>
          </Link>
          <MagneticButton onClick={() => window.location.href = '/forms'} className="bg-[#9A6BFF] hover:bg-[#8555e8] text-white py-1.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create
          </MagneticButton>
        </div>
      </div>

      <KPICards formsCount={forms?.length || 0} isLoading={loadingForms} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <FormsListWidget forms={forms} isLoading={loadingForms} error={error} />
        </div>
        <div className="xl:col-span-1">
          <RecentActivity />
        </div>
      </div>

      {/* Flat AI Assistant Callout Footer */}
      <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative shadow-sm">
        <div className="flex items-start gap-4 z-10">
          <div className="p-2.5 bg-[#1C1C22] border border-gray-800 text-gray-300 rounded-md">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-gray-200 font-medium text-sm mb-1">Formless AI Concierge</h4>
            <p className="text-gray-500 text-xs max-w-xl">Generate highly optimized, conversion-focused forms automatically by describing your use case.</p>
          </div>
        </div>

        <button className="shrink-0 bg-[#111116] hover:bg-[#1C1C22] border border-gray-800 text-gray-300 font-medium text-xs py-2 px-5 rounded transition-all shadow-sm z-10 w-full md:w-auto">
          Try AI generation
        </button>
      </div>

    </div>
  );
}

export default Dashboard;
