"use client";

import React, { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

interface ChatPreviewProps {
    formTitle: string;
    aiName: string;
    aiAvatar: string;
    welcomeMessage: string;
    tone: string;
}

// Static "demo" messages that simulate a conversation
const DEMO_MESSAGES = (aiName: string, welcomeMessage: string, tone: string, formTitle: string) => [
    {
        role: "ai",
        text: welcomeMessage || `Hi! I'm ${aiName}. I'll help you complete "${formTitle}". Let's get started!`,
        delay: 0,
    },
    { role: "user", text: "Sure, sounds good!", delay: 600 },
    {
        role: "ai",
        text:
            tone === "concise"
                ? "First question: What's your full name?"
                : tone === "professional"
                    ? "Thank you for your time. Could you please provide your full name to begin?"
                    : "Great! 🎉 First up — what's your full name?",
        delay: 1200,
    },
    { role: "user", text: "John Smith", delay: 2000 },
    {
        role: "ai",
        text:
            tone === "concise"
                ? "Got it. Next: your email address?"
                : tone === "professional"
                    ? "Thank you, John. Could you please provide your email address?"
                    : "Perfect, John! 👏 Now, what's your email address?",
        delay: 2800,
    },
];

export function ChatPreview({ formTitle, aiName, aiAvatar, welcomeMessage, tone }: ChatPreviewProps) {
    const messages = DEMO_MESSAGES(aiName || "AI", welcomeMessage, tone, formTitle);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [aiName, welcomeMessage, tone]);

    return (
        <div className="h-full flex flex-col bg-[#0B0B0F]">
            {/* Preview label */}
            <div className="flex items-center justify-center gap-2 py-2 border-b border-gray-800/80 shrink-0">
                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Live Preview</span>
            </div>

            {/* Phone-frame chat window */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                <div className="w-full max-w-sm bg-[#0f0f14] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ height: "520px" }}>
                    {/* Chat topbar */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/80 bg-[#0B0B0F] shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#9A6BFF]/10 border border-[#9A6BFF]/20 flex items-center justify-center text-base">
                            {aiAvatar}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white">{aiName || "AI Assistant"}</p>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                <p className="text-[10px] text-gray-500">Online</p>
                            </div>
                        </div>
                        <div className="ml-auto">
                            <Sparkles className="w-4 h-4 text-[#9A6BFF]/50" />
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                        {messages.map((msg, i) => (
                            <div
                                key={`${aiName}-${welcomeMessage}-${tone}-${i}`}
                                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                style={{
                                    animation: `fadeIn 0.3s ease forwards`,
                                    animationDelay: `${msg.delay}ms`,
                                    opacity: 0,
                                }}
                            >
                                {msg.role === "ai" && (
                                    <div className="w-6 h-6 rounded-full bg-[#9A6BFF]/10 border border-[#9A6BFF]/20 flex items-center justify-center text-xs shrink-0 mt-0.5">
                                        {aiAvatar}
                                    </div>
                                )}
                                <div
                                    className={`px-3 py-2 rounded-2xl text-xs leading-relaxed max-w-[75%] ${msg.role === "ai"
                                            ? "bg-[#1C1C22] border border-gray-800 text-gray-200 rounded-tl-sm"
                                            : "bg-[#9A6BFF] text-white rounded-tr-sm"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        <div className="flex gap-2 justify-start" style={{ animation: "fadeIn 0.3s ease forwards", animationDelay: `${messages[messages.length - 1].delay + 600}ms`, opacity: 0 }}>
                            <div className="w-6 h-6 rounded-full bg-[#9A6BFF]/10 border border-[#9A6BFF]/20 flex items-center justify-center text-xs shrink-0 mt-0.5">
                                {aiAvatar}
                            </div>
                            <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-[#1C1C22] border border-gray-800 flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                        <div ref={bottomRef} />
                    </div>

                    {/* Input bar */}
                    <div className="px-3 py-3 border-t border-gray-800/80 bg-[#0B0B0F] shrink-0">
                        <div className="flex items-center gap-2 bg-[#111116] border border-gray-800 rounded-xl px-3 py-2">
                            <span className="text-xs text-gray-600 flex-1">Type a message...</span>
                            <div className="w-6 h-6 rounded-full bg-[#9A6BFF] flex items-center justify-center opacity-40">
                                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white fill-white">
                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview note */}
            <div className="text-center pb-4 shrink-0">
                <p className="text-[10px] text-gray-700">Preview updates as you configure</p>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
