'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressDetail } from './types';

interface ChatProgressProps {
    progressDetail: ProgressDetail;
    chatState: string;
}

function getStateLabel(chatState: string, progressDetail: ProgressDetail): string {
    switch (chatState) {
        case 'CLARIFYING':
            return 'Please clarify...';
        case 'CONFIRMING':
            return 'Review your answers';
        case 'READY_TO_SUBMIT':
            return 'Submitting...';
        case 'COMPLETED':
            return 'Done!';
        case 'ERROR':
            return 'Submission failed';
        default:
            return `Question ${progressDetail.currentFieldIndex + 1} of ${progressDetail.totalFields}`;
    }
}

/** Dot-based step indicator — great for 6-15 questions */
function DotIndicator({ progressDetail }: { progressDetail: ProgressDetail }) {
    return (
        <div className="flex items-center gap-1">
            {progressDetail.fields.map((field) => (
                <div
                    key={field.fieldId}
                    title={field.label}
                    className={cn(
                        'rounded-full transition-all duration-300',
                        field.status === 'completed' && 'w-2 h-2 bg-emerald-500',
                        field.status === 'current' && 'w-2.5 h-2.5 bg-emerald-400 ring-2 ring-emerald-400/30 scale-110',
                        field.status === 'upcoming' && 'w-2 h-2 bg-gray-700',
                        field.status === 'skipped' && 'w-2 h-2 bg-yellow-500/60',
                    )}
                />
            ))}
        </div>
    );
}

/** Collapsible step list with labels — great for ≤5 questions */
function StepList({ progressDetail }: { progressDetail: ProgressDetail }) {
    const [expanded, setExpanded] = useState(false);

    // Show only the current + 1 next when collapsed
    const visibleFields = expanded
        ? progressDetail.fields
        : progressDetail.fields.filter(
            (f) => f.status === 'current' || f.status === 'completed'
                ? true
                : f.questionNumber === (progressDetail.currentFieldIndex + 2) // next one
        );

    const hasMore = progressDetail.fields.length > visibleFields.length;

    return (
        <div className="space-y-1">
            {visibleFields.map((field) => (
                <div
                    key={field.fieldId}
                    className={cn(
                        'flex items-center gap-2.5 transition-all duration-300',
                        field.status === 'upcoming' && 'opacity-40',
                    )}
                >
                    <div
                        className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300',
                            field.status === 'completed' && 'bg-emerald-500 text-white',
                            field.status === 'current' && 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40',
                            field.status === 'upcoming' && 'bg-gray-800 text-gray-500',
                            field.status === 'skipped' && 'bg-yellow-500/20 text-yellow-400',
                        )}
                    >
                        {field.status === 'completed' ? (
                            <Check className="w-3 h-3" />
                        ) : (
                            field.questionNumber
                        )}
                    </div>
                    <span
                        className={cn(
                            'text-xs truncate transition-colors duration-300',
                            field.status === 'current' && 'text-white font-medium',
                            field.status === 'completed' && 'text-gray-500 line-through',
                            field.status === 'upcoming' && 'text-gray-600',
                            field.status === 'skipped' && 'text-yellow-400/60',
                        )}
                    >
                        {field.label}
                    </span>
                </div>
            ))}
            {(hasMore || expanded) && progressDetail.fields.length > 3 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-400 transition-colors mt-0.5 pl-7"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="w-3 h-3" /> Show less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-3 h-3" /> {progressDetail.fields.length - visibleFields.length} more
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

/** Thin animated progress bar */
function ProgressBar({ percentage }: { percentage: number }) {
    return (
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}

/**
 * Smart progress component that adapts to the number of fields:
 * - ≤5 fields  → step list with labels + progress bar
 * - 6-15 fields → dot indicator + progress bar
 * - 15+ fields  → progress bar + text counter
 */
export function ChatProgress({ progressDetail, chatState }: ChatProgressProps) {
    const label = getStateLabel(chatState, progressDetail);
    const totalFields = progressDetail.totalFields;
    const isDone = chatState === 'COMPLETED' || chatState === 'CONFIRMING' || chatState === 'READY_TO_SUBMIT';

    return (
        <div className="px-4 py-3 space-y-2.5 border-b border-gray-800/60 bg-[#0B0B0F]/80 backdrop-blur-sm">
            {/* Top row: label + percentage */}
            <div className="flex items-center justify-between">
                <span className={cn(
                    'text-xs font-medium',
                    isDone ? 'text-emerald-400' : 'text-gray-400',
                )}>
                    {label}
                </span>
                <span className="text-[10px] text-gray-600 tabular-nums">
                    {progressDetail.percentage}%
                </span>
            </div>

            {/* Progress bar — always shown */}
            <ProgressBar percentage={progressDetail.percentage} />

            {/* Adaptive detail view */}
            {!isDone && (
                <div className="pt-0.5">
                    {totalFields <= 5 ? (
                        <StepList progressDetail={progressDetail} />
                    ) : totalFields <= 15 ? (
                        <DotIndicator progressDetail={progressDetail} />
                    ) : null /* 15+ just shows bar + counter above */}
                </div>
            )}
        </div>
    );
}

/** Compact inline progress for embed mode headers */
export function ChatProgressCompact({ progressDetail, chatState }: ChatProgressProps) {
    const isDone = chatState === 'COMPLETED';
    const isError = chatState === 'ERROR';

    return (
        <div className="flex items-center gap-2.5">
            {/* Mini dot indicator (max 10 shown, rest collapsed) */}
            <div className="flex items-center gap-0.5">
                {progressDetail.fields.slice(0, 10).map((field) => (
                    <div
                        key={field.fieldId}
                        className={cn(
                            'w-1.5 h-1.5 rounded-full transition-all duration-300',
                            field.status === 'completed' && 'bg-emerald-500',
                            field.status === 'current' && 'bg-emerald-400 scale-125',
                            field.status === 'upcoming' && 'bg-gray-700',
                            field.status === 'skipped' && 'bg-yellow-500/60',
                        )}
                    />
                ))}
                {progressDetail.totalFields > 10 && (
                    <span className="text-[8px] text-gray-600 ml-0.5">+{progressDetail.totalFields - 10}</span>
                )}
            </div>
            <span className={cn(
                'text-[10px] tabular-nums',
                isDone ? 'text-emerald-400' : isError ? 'text-red-400' : 'text-gray-500',
            )}>
                {isDone ? 'Done' : isError ? 'Failed' : `${progressDetail.percentage}%`}
            </span>
        </div>
    );
}
