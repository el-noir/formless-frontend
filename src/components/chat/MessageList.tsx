import React from 'react';
import { MessageItem } from './MessageItem';
import { Message } from './types';

interface MessageListProps {
    messages: Message[];
    isTyping: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, isTyping, messagesEndRef }: MessageListProps) {
    return (
        <main
            className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
            role="log"
            aria-live="polite"
        >
            <div className="max-w-3xl mx-auto space-y-6 w-full">
                {messages.map((msg, idx) => (
                    <MessageItem key={idx} message={msg} />
                ))}

                {isTyping && (
                    <div className="flex justify-start w-full">
                        <div className="bg-[#1A1A24] border border-gray-800 rounded-2xl rounded-bl-sm px-5 py-4 max-w-[85%]">
                            <div className="flex gap-1.5 items-center">
                                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>
        </main>
    );
}
