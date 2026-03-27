import React from 'react';
import { MessageItem } from './MessageItem';
import { Message } from './types';
import { Sparkles } from 'lucide-react';

interface MessageListProps {
    messages: Message[];
    isTyping: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    aiName?: string;
    aiAvatar?: string;
    isEmbed?: boolean;
    themeColor?: string;
}

export function MessageList({ messages, isTyping, messagesEndRef, aiName, aiAvatar, isEmbed = false, themeColor = "#10b981" }: MessageListProps) {
    return (
        <main
            className="flex-1 overflow-y-auto relative z-10"
            role="log"
            aria-live="polite"
        >
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 w-full">
                {messages.map((msg, idx) => (
                    <MessageItem
                        key={idx}
                        message={msg}
                        aiName={aiName}
                        aiAvatar={aiAvatar}
                        isEmbed={isEmbed}
                        themeColor={themeColor}
                    />
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div
                        className="flex gap-3 items-start"
                        style={{ animation: 'fadeSlideIn 0.2s ease-out both' }}
                    >
                        <style>{`
                            @keyframes fadeSlideIn {
                                from { opacity: 0; transform: translateY(6px); }
                                to   { opacity: 1; transform: translateY(0); }
                            }
                            @keyframes typingPulse {
                                0%, 60%, 100% { opacity: 0.25; transform: scale(0.75); }
                                30%            { opacity: 1;    transform: scale(1); }
                            }
                        `}</style>
                        <div
                            className="w-7 h-7 rounded-full border flex items-center justify-center text-sm shrink-0 pt-0.5 overflow-hidden"
                            style={{ backgroundColor: `${themeColor}20`, borderColor: `${themeColor}30` }}
                        >
                            {aiAvatar?.startsWith('http') || aiAvatar?.startsWith('/')
                                ? <img src={aiAvatar} alt="" className="w-full h-full object-cover" />
                                : (aiAvatar ? <span className="text-base">{aiAvatar}</span> : <Sparkles className="w-3.5 h-3.5" style={{ color: themeColor }} />)
                            }
                        </div>
                        <div className="bg-[#111116] border border-gray-800/80 rounded-2xl rounded-tl-none px-4 py-3.5 shadow-sm">
                            <div className="flex gap-1.5 items-center h-4">
                                {[0, 160, 320].map((delay) => (
                                    <div
                                        key={delay}
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                            backgroundColor: themeColor,
                                            opacity: 0.25,
                                            animation: `typingPulse 1.2s ease-in-out infinite`,
                                            animationDelay: `${delay}ms`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </main>
    );
}
