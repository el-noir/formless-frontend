"use client";

import React, { useEffect, useState, Suspense, useCallback, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useOrgStore } from "@/stores/orgStore";
import { getOrgForms, getDashboardStats } from "@/lib/api/organizations";
import { KPICards } from "@/components/dashboard/KPICards";
import { KPICardsSkeleton } from "@/components/dashboard/skeletons/KPICardsSkeleton";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FormsListWidget } from "@/components/dashboard/FormsListWidget";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Plus, Wand2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatDistanceToNow } from "date-fns";

function DashboardContent() {
  const { user, accessToken } = useAuthStore();
  const { currentOrgId, isAdminOfCurrentOrg } = useOrgStore();
  const params = useParams();
  const orgId = params.orgId as string;
  const [forms, setForms] = useState<any[] | null>(null);
  const [loadingForms, setLoadingForms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const router = useRouter();

  // Fetch forms — stable reference so the useEffect below doesn't loop
  const fetchForms = useCallback(async () => {
    setForms(null);
    setLoadingForms(true);
    setError(null);
    try {
      const data = await getOrgForms(orgId);
      setForms(data.forms || []);
    } catch (err: any) {
      console.error("Error fetching forms:", err);
      setError(err?.message || "Failed to fetch forms");
    } finally {
      setLoadingForms(false);
    }
  }, [orgId]);

  // Fetch dashboard stats — stable reference so the useEffect below doesn't loop
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await getDashboardStats(orgId, { days: 30 });
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (accessToken && orgId) {
      fetchForms();
      fetchStats();
    } else {
      setForms([]);
      setStats(null);
    }
  }, [accessToken, orgId, fetchForms, fetchStats]);

  const isLoading = useMemo(() => loadingStats || loadingForms, [loadingStats, loadingForms]);
  const isAdmin = useMemo(() => isAdminOfCurrentOrg(), [isAdminOfCurrentOrg]);

  return (
    <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-100 tracking-tight mb-1">
            Overview
          </h2>
          <p className="text-gray-500 text-sm">Welcome back, {user?.firstName || 'there'}. Here&apos;s what&apos;s happening.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/${orgId}/integrations`)}
            className="hidden sm:flex items-center justify-center bg-[#0B0B0F] hover:bg-[#111116] text-gray-300 text-sm font-medium py-1.5 px-4 rounded-md border border-gray-800 transition-colors shadow-sm"
          >
            Integrations
          </button>
          <MagneticButton onClick={() => router.push(`/dashboard/${orgId}/forms`)} className="bg-brand-purple hover:bg-[#0da372] text-white py-1.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Import
          </MagneticButton>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      {isLoading && !stats ? (
        <KPICardsSkeleton />
      ) : (
        <KPICards stats={stats} isLoading={loadingStats} />
      )}

      {/* ── Responses Over Time Chart ──────────────────────────── */}
      {stats?.responsesOverTime && stats.responsesOverTime.length > 0 && (
        <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-5 mb-8 shadow-sm">
          <h3 className="text-gray-200 font-medium text-sm mb-4">Responses Over Time</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.responsesOverTime}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              >
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: "#10B981", strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={{
                    backgroundColor: "#1C1C24",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#9ca3af" }}
                  itemStyle={{ color: "#10B981" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#dashGrad)"
                  name="Responses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Top Forms + Activity ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          {/* Show Top Forms from stats if available, else fallback to FormsListWidget */}
          {stats?.topForms && stats.topForms.length > 0 ? (
            <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md flex flex-col shadow-sm overflow-hidden min-h-[400px]">
              <div className="flex items-center justify-between p-5 border-b border-gray-800/50">
                <h3 className="text-gray-200 font-medium text-sm">Top Forms</h3>
                <Link href={`/dashboard/${orgId}/forms`}>
                  <button className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors border border-gray-800 hover:border-gray-700 bg-[#1C1C22] px-2 py-1 rounded">
                    <Plus className="w-3.5 h-3.5" />
                    New
                  </button>
                </Link>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs text-gray-500 bg-[#0B0B0F] border-b border-gray-800/50">
                    <tr>
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium text-right">Submissions</th>
                      <th className="px-5 py-3 font-medium text-right hidden md:table-cell">Completion</th>
                      <th className="px-5 py-3 font-medium text-right hidden md:table-cell">Last Response</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/40">
                    {stats.topForms.map((f: any) => (
                      <tr key={f.formId} className="hover:bg-[#111116] transition-colors group">
                        <td className="px-5 py-3.5 max-w-[300px] truncate">
                          <span className="text-gray-200 font-medium">{f.title}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-gray-300">
                          {f.submissionCount}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums hidden md:table-cell">
                          <span className={f.completionRate >= 90 ? "text-emerald-400" : f.completionRate >= 70 ? "text-yellow-400" : "text-red-400"}>
                            {f.completionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs text-gray-500 hidden md:table-cell">
                          {f.lastSubmissionAt
                            ? formatDistanceToNow(new Date(f.lastSubmissionAt), { addSuffix: true })
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <FormsListWidget
              forms={forms}
              isLoading={loadingForms}
              error={error}
              currentOrgId={currentOrgId}
              isAdmin={isAdmin}
              setForms={setForms}
            />
          )}
        </div>
        <div className="xl:col-span-1">
          <RecentActivity orgId={orgId} />
        </div>
      </div>

      <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative shadow-sm">
        <div className="flex items-start gap-4 z-10">
          <div className="p-2.5 bg-[#1C1C22] border border-gray-800 text-gray-400 rounded-md shrink-0">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-gray-200 font-medium text-sm mb-0.5">0Fill AI Concierge</h4>
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
        <Loader2 className="w-6 h-6 text-brand-purple animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
