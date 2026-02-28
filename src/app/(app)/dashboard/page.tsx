"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { getGoogleForms } from "@/lib/api/integrations";
import { KPICards } from "@/components/dashboard/KPICards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FormsListWidget } from "@/components/dashboard/FormsListWidget";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Plus, Sparkles } from "lucide-react";
import Link from "next/link";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
            Welcome back, {user?.firstName || 'there'}!
          </h2>
          <p className="text-gray-400 text-sm">Here's what's happening with your forms today.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/integrations">
            <button className="hidden sm:flex items-center justify-center bg-[#1C1C22] hover:bg-white/10 text-white text-sm font-medium py-2 px-4 rounded-lg border border-gray-800 transition-colors shadow-sm">
              Integrations
            </button>
          </Link>
          <MagneticButton onClick={() => window.location.href = '/forms'} className="bg-[#9A6BFF] hover:bg-[#8555e8] text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_-3px_rgba(154,107,255,0.4)]">
            <Plus className="w-4 h-4" />
            Create Form
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

      {/* AI Assistant Callout Footer */}
      <div className="bg-gradient-to-r from-[#9A6BFF]/10 to-transparent border border-[#9A6BFF]/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute -right-20 top-0 w-64 h-64 bg-[#9A6BFF]/5 rounded-full blur-3xl group-hover:bg-[#9A6BFF]/10 transition-colors pointer-events-none" />

        <div className="flex items-start gap-4 z-10">
          <div className="p-3 bg-[#9A6BFF]/20 text-[#9A6BFF] rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-medium text-lg mb-1">Formless AI Concierge</h4>
            <p className="text-gray-400 text-sm max-w-xl">Not sure what to build next? Ask the AI concierge to generate a custom form for your specific use case perfectly optimized for conversions.</p>
          </div>
        </div>

        <button className="shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm py-2.5 px-6 rounded-lg transition-all shadow-sm z-10 w-full md:w-auto">
          Try AI generation
        </button>
      </div>

    </div>
  );
}

export default Dashboard;
