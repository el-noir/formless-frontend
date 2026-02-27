import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

import { Message } from './types';

interface MessageItemProps {
    message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
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
