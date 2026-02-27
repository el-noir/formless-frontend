import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

import { Message } from './types';

interface MessageItemProps {
    message: Message;
    state?: string;
}

export function MessageItem({ message, state }: MessageItemProps) {
    const isUser = message.role === 'user';

    return (
        <div className={cn(
            "flex w-full",
            isUser ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5",
                isUser
                    ? "bg-[#6E8BFF] text-white rounded-br-sm"
                    : "bg-[#1A1A24] border border-gray-800 text-gray-100 rounded-bl-sm"
            )}>
                {!isUser ? (
                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-a:text-[#6E8BFF]">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                )}
                {message.fieldSummaries && message.fieldSummaries.length > 0 && (
                    <div className="mt-4 border border-gray-800 rounded-lg overflow-hidden bg-black/20">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 bg-black/40">
                                    <th className="px-3 py-2 font-semibold text-gray-400">Field</th>
                                    <th className="px-3 py-2 font-semibold text-gray-400">Your Answer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {message.fieldSummaries.map((s, idx) => (
                                    <tr key={s.fieldId || idx} className="border-b border-gray-800/50 last:border-0 hover:bg-white/5 transition-colors">
                                        <td className="px-3 py-2 text-gray-300 font-medium">{s.label}</td>
                                        <td className="px-3 py-2 text-gray-400 italic">
                                            {Array.isArray(s.value) ? s.value.join(', ') : s.value || <span className="text-gray-600 opacity-50">skipped</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {message.timestamp && (
                    <p className={cn(
                        "text-[10px] mt-2 text-right",
                        isUser ? "text-white/60" : "text-gray-500"
                    )}>
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </p>
                )}
            </div>
        </div>
    );
}
