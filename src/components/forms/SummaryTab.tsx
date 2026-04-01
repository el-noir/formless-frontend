"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw,
    AlertCircle, Lightbulb, Frown, Zap, Quote, ShieldCheck, Loader2
} from "lucide-react";
import { getFormInsights } from "@/lib/api/organizations";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AiInsightsResult {
    keyTakeaways: string[];
    commonPainPoints: string[];
    sentimentTrend: 'UP' | 'DOWN' | 'STABLE';
    sentimentRationale: string;
    recommendedActions: string[];
    citations: Array<{ quote: string; context: string }>;
    confidence: number;
    generatedAt: string;
    analyzedCount: number;
    days: number;
}

interface SummaryTabProps {
    orgId: string;
    formId: string;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonBlock({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2.5">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-3 bg-gray-800/80 rounded animate-pulse"
                    style={{ width: `${75 + (i % 3) * 10}%` }}
                />
            ))}
        </div>
    );
}

// ─── Sentiment Badge ─────────────────────────────────────────────────────────

function SentimentBadge({ trend }: { trend: 'UP' | 'DOWN' | 'STABLE' }) {
    const config = {
        UP: {
            label: 'Trending Positive',
            icon: TrendingUp,
            className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        },
        DOWN: {
            label: 'Trending Negative',
            icon: TrendingDown,
            className: 'bg-red-500/10 text-red-400 border-red-500/20',
        },
        STABLE: {
            label: 'Sentiment Stable',
            icon: Minus,
            className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        },
    };
    const { label, icon: Icon, className } = config[trend];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${className}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}

// ─── Confidence Bar ──────────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
    const pct = Math.round(value * 100);
    const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="shrink-0">Confidence</span>
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
            <span className="shrink-0 font-mono">{pct}%</span>
        </div>
    );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
    icon: Icon,
    iconClass,
    title,
    children,
}: {
    icon: React.ElementType;
    iconClass: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-md ${iconClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">{title}</h3>
            </div>
            {children}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SummaryTab({ orgId, formId }: SummaryTabProps) {
    const [insights, setInsights] = useState<AiInsightsResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [regenerating, setRegenerating] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const [days] = useState(30);

    const fetchInsights = useCallback(async (regen = false) => {
        if (regen) {
            setRegenerating(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const data = await getFormInsights(orgId, formId, days, regen);
            setInsights(data);
            if (regen) {
                // 30-second cooldown before user can regenerate again
                setCooldown(true);
                setTimeout(() => setCooldown(false), 30_000);
            }
        } catch (e: any) {
            setError(e.message || 'Failed to load AI insights');
        } finally {
            setLoading(false);
            setRegenerating(false);
        }
    }, [orgId, formId, days]);

    useEffect(() => {
        fetchInsights(false);
    }, [fetchInsights]);

    // ─── Loading skeleton ────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
                    <div className="h-6 w-24 bg-gray-800 rounded-full animate-pulse" />
                </div>
                {[3, 2, 3, 2].map((lines, i) => (
                    <div key={i} className="bg-[#0B0B0F] border border-gray-800/80 rounded-lg p-4">
                        <div className="h-3 w-20 bg-gray-800/80 rounded mb-4 animate-pulse" />
                        <SkeletonBlock lines={lines} />
                    </div>
                ))}
            </div>
        );
    }

    // ─── Error state ─────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-red-400 text-sm font-medium mb-1">Failed to load insights</p>
                <p className="text-gray-500 text-xs mb-4">{error}</p>
                <button
                    onClick={() => fetchInsights(false)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!insights) return null;

    // ─── Main insights render ─────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Header bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-purple" />
                    <span className="text-sm font-semibold text-gray-200">AI Summary</span>
                    <SentimentBadge trend={insights.sentimentTrend} />
                </div>
                <button
                    onClick={() => fetchInsights(true)}
                    disabled={regenerating || cooldown}
                    className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    title={cooldown ? 'Please wait 30 seconds before regenerating again' : 'Force refresh AI insights'}
                >
                    {regenerating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <RefreshCw className="w-3 h-3" />
                    )}
                    {regenerating ? 'Regenerating...' : cooldown ? 'Cooldown...' : 'Regenerate'}
                </button>
            </div>

            {/* Meta strip */}
            <div className="text-[11px] text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                <span>Analyzed <strong className="text-gray-400">{insights.analyzedCount}</strong> submissions</span>
                <span>Last <strong className="text-gray-400">{insights.days}</strong> days</span>
                <span>Generated {new Date(insights.generatedAt).toLocaleString()}</span>
            </div>

            {/* Confidence bar */}
            <ConfidenceBar value={insights.confidence} />

            {/* Sentiment rationale */}
            <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-lg p-4 text-xs text-gray-400 italic leading-relaxed">
                {insights.sentimentRationale}
            </div>

            {/* Key Takeaways */}
            <SectionCard icon={Lightbulb} iconClass="bg-yellow-500/10 text-yellow-400" title="Key Takeaways">
                <ul className="space-y-2">
                    {insights.keyTakeaways.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                            <span className="mt-0.5 shrink-0 text-yellow-500">•</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </SectionCard>

            {/* Pain Points */}
            {insights.commonPainPoints.length > 0 && (
                <SectionCard icon={Frown} iconClass="bg-red-500/10 text-red-400" title="Common Pain Points">
                    <ul className="space-y-2">
                        {insights.commonPainPoints.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                <span className="mt-0.5 shrink-0 text-red-400">▲</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            )}

            {/* Recommended Actions */}
            {insights.recommendedActions.length > 0 && (
                <SectionCard icon={Zap} iconClass="bg-brand-purple/10 text-brand-purple" title="Recommended Actions">
                    <ul className="space-y-2">
                        {insights.recommendedActions.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center text-[9px] font-bold">
                                    {i + 1}
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            )}

            {/* Citations */}
            {insights.citations.length > 0 && (
                <SectionCard icon={Quote} iconClass="bg-blue-500/10 text-blue-400" title="Quoted from Responses">
                    <div className="space-y-3">
                        {insights.citations.map((c, i) => (
                            <div key={i} className="border-l-2 border-blue-500/30 pl-3">
                                <p className="text-xs text-gray-300 italic mb-0.5">"{c.quote}"</p>
                                <p className="text-[10px] text-gray-600">— {c.context}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Trust disclosure */}
            <div className="flex items-start gap-2 bg-gray-900/50 border border-gray-800/60 rounded-lg p-3">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-600 leading-relaxed">
                    <strong className="text-gray-500">AI-generated summary</strong> — Insights are derived from your submission data using an LLM. Always verify conclusions against your raw responses before taking action.
                </p>
            </div>
        </div>
    );
}
