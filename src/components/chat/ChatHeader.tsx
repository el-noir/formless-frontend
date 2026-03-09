import React from 'react';
import Image from 'next/image';
import { ChatProgress } from './ChatProgress';
import { ProgressDetail } from './types';

interface ChatHeaderProps {
    title?: string;
    aiName?: string;
    chatState: string;
    progress: number;
    progressDetail?: ProgressDetail | null;
}

export function ChatHeader({ title, aiName, chatState, progress, progressDetail }: ChatHeaderProps) {
    const isCompleted = chatState === 'COMPLETED';
    const isError = chatState === 'ERROR';

    return (
        <div className="shrink-0">
            <header className="px-4 h-14 border-b border-gray-800/60 bg-[#0B0B0F] flex items-center justify-between gap-4 sticky top-0 z-10">
                {/* Left: 0Fill logo + form title */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-6 h-6 shrink-0">
                        <Image src="/logo.png" alt="0Fill" fill className="object-contain" />
                    </div>
                    <div className="w-px h-4 bg-gray-800 shrink-0" />
                    <p className="text-sm font-medium text-gray-300 truncate">{title}</p>
                </div>

                {/* Right: progress or done state */}
                <div className="shrink-0 text-xs text-gray-500 font-medium">
                    {isCompleted ? (
                        <span className="text-emerald-400">Completed</span>
                    ) : isError ? (
                        <span className="text-red-400">Submission failed</span>
                    ) : (
                        <span>{progress}% complete</span>
                    )}
                </div>
            </header>

            {/* Detailed progress panel */}
            {progressDetail ? (
                <ChatProgress progressDetail={progressDetail} chatState={chatState} />
            ) : (
                /* Fallback: simple progress bar */
                !isCompleted && (
                    <div className="h-[1px] bg-gray-800">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )
            )}
        </div>
    );
}
