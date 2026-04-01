"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Loader2,
    Download,
    Check,
    Clock,
    Mail,
    User,
    Link as LinkIcon,
    ArrowUpRight,
    Search,
    AlertCircle,
    CheckCircle2,
    Copy,
    RefreshCcw,
    TrendingUp,
    ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
    getRecoveryStats,
    getRecoverableLeads,
    recoverLead,
    getResumeLink,
} from "@/lib/api/organizations";
import { useAuthStore } from "@/stores/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecoveryStats {
    abandonedCount: number;
    recoveredCount: number;
    recoverableValue: number;
}

interface RecoverableLead {
    _id: string;
    sessionId: string;
    formId: string;
    leadEmail: string;
    leadName?: string;
    progress: number;
    lastActivityAt: string;
    isRecovered: boolean;
    recoveryValue: number;
    answers: any[];
}

interface RecoveryPanelProps {
    orgId: string;
    formId: string;
    formTitle: string;
}

// ─── Helper Components ────────────────────────────────────────────────────────

function KPICard({ 
    label, 
    value, 
    icon: Icon, 
    color = "brand-purple",
    prefix = "" 
}: { 
    label: string; 
    value: string | number; 
    icon: React.ElementType;
    color?: string;
    prefix?: string;
}) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111116] border border-gray-800/60 rounded-2xl p-5 relative overflow-hidden group hover:border-gray-700 transition-colors"
        >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}/10 rounded-full blur-2xl group-hover:bg-${color}/20 transition-colors`} />
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg bg-${color}/10 border border-${color}/20 text-${color}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{label}</p>
                </div>
                <div className="flex items-baseline gap-1">
                    {prefix && <span className="text-sm font-bold text-gray-500">{prefix}</span>}
                    <p className="text-3xl font-black text-white tracking-tight">{value}</p>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function RecoveryPanel({ orgId, formId, formTitle }: RecoveryPanelProps) {
    const [stats, setStats] = useState<RecoveryStats | null>(null);
    const [leads, setLeads] = useState<RecoverableLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [s, l] = await Promise.all([
                getRecoveryStats(orgId, formId),
                getRecoverableLeads(orgId, formId),
            ]);
            setStats(s);
            setLeads(l);
        } catch (error) {
            console.error("Failed to load recovery data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [orgId, formId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleRecovered = async (lead: RecoverableLead) => {
        try {
            await recoverLead(orgId, formId, lead._id, !lead.isRecovered);
            setLeads(prev => prev.map(l => 
                l._id === lead._id ? { ...l, isRecovered: !l.isRecovered } : l
            ));
            // Refresh stats to update recoveredCount
            const newStats = await getRecoveryStats(orgId, formId);
            setStats(newStats);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCopyResumeLink = async (lead: RecoverableLead) => {
        try {
            const { resumeUrl } = await getResumeLink(orgId, formId, lead.sessionId);
            await navigator.clipboard.writeText(resumeUrl);
            setCopiedId(lead._id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleExportCSV = () => {
        const headers = ["Email", "Name", "Progress", "Last Activity", "Recovered", "Potential Value"];
        const rows = leads.map(l => [
            l.leadEmail,
            l.leadName || "",
            `${l.progress}%`,
            new Date(l.lastActivityAt).toLocaleString(),
            l.isRecovered ? "Yes" : "No",
            l.recoveryValue || 0,
        ]);
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `recoverable-leads-${formTitle}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLeads = leads.filter(l => 
        l.leadEmail.toLowerCase().includes(search.toLowerCase()) ||
        (l.leadName && l.leadName.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header / ROI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard 
                    label="Potential Revenue" 
                    value={stats?.recoverableValue.toLocaleString() || "0"} 
                    icon={TrendingUp} 
                    color="emerald-500"
                    prefix="$"
                />
                <KPICard 
                    label="Abandoned Leads" 
                    value={stats?.abandonedCount || 0} 
                    icon={Clock} 
                    color="brand-purple"
                />
                <KPICard 
                    label="Successfully Recovered" 
                    value={stats?.recoveredCount || 0} 
                    icon={CheckCircle2} 
                    color="blue-500"
                />
            </div>

            {/* Main Table Area */}
            <div className="bg-[#0b0b0f] border border-gray-800/80 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-800/80 flex items-center justify-between gap-4 bg-[#111116]/30">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input 
                                type="text"
                                placeholder="Search leads by email or name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-black/40 border border-gray-800 rounded-xl px-10 py-2.5 text-xs text-white placeholder:text-gray-700 focus:outline-none focus:border-brand-purple/40 transition-all font-medium"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={loadData}
                            className="p-2.5 rounded-xl border border-gray-800 text-gray-500 hover:text-white hover:bg-gray-800/50 transition-all"
                        >
                            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                            onClick={handleExportCSV}
                            disabled={leads.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-tight hover:bg-gray-200 transition-all disabled:opacity-40"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800/50">
                                <th className="px-6 py-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">Lead Information</th>
                                <th className="px-6 py-4 text-[10px] text-gray-500 font-black uppercase tracking-widest text-center">Progress</th>
                                <th className="px-6 py-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">Last Activity</th>
                                <th className="px-6 py-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">Potential Value</th>
                                <th className="px-6 py-4 text-[10px] text-gray-500 font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/30">
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-brand-purple mx-auto" />
                                            <p className="text-xs text-gray-600 mt-2 font-medium">Crunching lead data...</p>
                                        </td>
                                    </tr>
                                ) : filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <AlertCircle className="w-8 h-8 text-gray-800 mx-auto mb-3" />
                                            <p className="text-sm text-gray-500 font-medium">No recoverable leads found{search ? ' matching your search' : ''}.</p>
                                            <p className="text-xs text-gray-700 mt-1 uppercase font-black tracking-widest">Nice work! Everyone is finishing your form.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((lead, idx) => (
                                        <motion.tr 
                                            key={lead._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
                                                        {lead.leadName ? (
                                                            <span className="text-sm font-black tracking-tighter uppercase">{lead.leadName[0]}</span>
                                                        ) : (
                                                            <User className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-white font-bold">{lead.leadEmail}</span>
                                                            {lead.isRecovered && (
                                                                <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-emerald-500/20">
                                                                    Recovered
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-gray-600 font-medium mt-0.5">
                                                            {lead.leadName ? `${lead.leadName} · ` : ''} 
                                                            Session {lead.sessionId.slice(0, 8)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="max-w-[100px] mx-auto">
                                                    <div className="flex justify-between text-[10px] text-gray-600 mb-1 font-bold">
                                                        <span>{lead.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${lead.progress}%` }}
                                                            className={`h-full rounded-full ${lead.progress > 70 ? 'bg-emerald-500' : 'bg-brand-purple'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                                                    {formatDistanceToNow(new Date(lead.lastActivityAt))} ago
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs text-emerald-400/80 font-black font-mono">
                                                    ${lead.recoveryValue || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleCopyResumeLink(lead)}
                                                        className={`p-2 rounded-lg transition-all ${copiedId === lead._id ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-900 border border-gray-800 text-gray-500 hover:text-white hover:border-gray-700'}`}
                                                        title="Copy Resume Link"
                                                    >
                                                        {copiedId === lead._id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleRecovered(lead)}
                                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${lead.isRecovered ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20'}`}
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        {lead.isRecovered ? 'Recovered' : 'Mark Recovered'}
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                
                {leads.length > 0 && (
                    <div className="p-5 bg-black/40 border-t border-gray-800/80">
                        <div className="flex items-center gap-2 text-rose-400/60">
                            <ShieldCheck className="w-4 h-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">GDRP / Consent Compliant: Data is stored for recovery purposes only.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
