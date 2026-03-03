import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Message } from './types';

interface MessageItemProps {
    message: Message;
    aiName?: string;
    aiAvatar?: string;
    isEmbed?: boolean;
}

export function MessageItem({ message, aiName, aiAvatar, isEmbed = false }: MessageItemProps) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            <div className="shrink-0 pt-0.5">
                {isUser ? (
                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-gray-300">You</span>
                    </div>
                ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm leading-none">
                        {aiAvatar || '✦'}
                    </div>
                )}
            </div>

            <div className={cn('flex flex-col gap-1 max-w-[80%] md:max-w-[70%]', isUser && 'items-end')}>
                {/* Sender */}
                <span className="text-[11px] text-gray-500 font-medium px-1">
                    {isUser ? 'You' : (aiName || 'Assistant')}
                </span>

                {/* Bubble */}
                <div className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-[#111116] border border-gray-800 text-gray-200 rounded-tl-none'
                )}>
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed prose-a:text-emerald-400 prose-strong:text-white">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Answer summary */}
                {message.fieldSummaries && message.fieldSummaries.length > 0 && (
                    <div className="w-full mt-1 rounded-xl border border-gray-800 overflow-hidden bg-[#0f0f14]">
                        {!isEmbed && (
                            <div className="px-3 py-2 border-b border-gray-800 bg-[#111116]">
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Summary</span>
                            </div>
                        )}
                        <div className={cn("divide-y divide-gray-800/60", isEmbed && "mt-1")}>
                            {message.fieldSummaries.map((s, idx) => (
                                <div key={s.fieldId || idx} className="flex items-baseline justify-between px-3 py-2.5 gap-4">
                                    <span className="text-[12px] text-gray-400 shrink-0 max-w-[45%] leading-snug">{s.label}</span>
                                    <span className="text-[12px] text-gray-200 text-right leading-snug">
                                        {Array.isArray(s.value) ? s.value.join(', ') : s.value || '—'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
