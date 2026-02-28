"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { Sparkles } from "lucide-react";

type Tone = "friendly" | "professional" | "concise";

interface Field {
    id: string;
    label: string;
    type: string;
    required?: boolean;
    options?: { label: string }[];
}

interface ChatPreviewProps {
    formTitle: string;
    aiName: string;
    aiAvatar: string;
    welcomeMessage: string;
    tone: Tone;
    fields: Field[];
}

// Turn a field into the AI's question for it
function fieldToQuestion(field: Field, tone: Tone): string {
    const label = field.label;
    const required = field.required;

    if (tone === "concise") {
        return `${label}?`;
    }
    if (tone === "professional") {
        return `Could you please provide your ${label.toLowerCase()}${required ? "" : " (optional)"}?`;
    }
    // friendly
    const starters = ["Great! Now, ", "Perfect! Next — ", "Got it! ", "Awesome! "];
    const i = Math.abs(label.charCodeAt(0)) % starters.length;
    return `${starters[i]}what's your ${label.toLowerCase()}?`;
}

// Build a realistic message sequence from the actual form fields
function buildMessages(formTitle: string, aiName: string, tone: Tone, welcomeMessage: string, fields: Field[]) {
    const questionFields = fields.filter((f) => f.type !== "SECTION_HEADER").slice(0, 3);

    const aiOpening = welcomeMessage?.trim()
        ? welcomeMessage
        : tone === "concise"
            ? `Let's fill out "${formTitle}". Ready?`
            : tone === "professional"
                ? `Welcome. I'll guide you through completing "${formTitle}".`
                : `Hi! I'm here to help you fill out "${formTitle}" 👋 Ready to begin?`;

    const messages: { role: "ai" | "user"; text: string; delay: number }[] = [
        { role: "ai", text: aiOpening, delay: 0 },
        { role: "user", text: "Yes, let's go!", delay: 700 },
    ];

    questionFields.forEach((field, i) => {
        const question = fieldToQuestion(field, tone);
        messages.push({ role: "ai", text: question, delay: messages[messages.length - 1].delay + 900 });

        // realistic user answer based on field type
        let userAns = "Sure!";
        switch (field.type) {
            case "SHORT_TEXT":
            case "SHORT_ANSWER": userAns = i === 0 ? "John Smith" : i === 1 ? "john@example.com" : "Marketing"; break;
            case "EMAIL": userAns = "john@example.com"; break;
            case "LINEAR_SCALE":
            case "SCALE": userAns = "8 out of 10"; break;
            case "MULTIPLE_CHOICE":
                userAns = field.options?.[0]?.label ?? "Option A"; break;
            case "CHECKBOXES":
                userAns = [field.options?.[0]?.label, field.options?.[1]?.label].filter(Boolean).join(", ") || "A, B"; break;
            case "DATE": userAns = "March 15, 2025"; break;
            case "PARAGRAPH": userAns = "Everything was great, very smooth experience!"; break;
            default: userAns = "Got it ✓";
        }
        messages.push({ role: "user", text: userAns, delay: messages[messages.length - 1].delay + 700 });
    });

    return messages;
}

export function ChatPreview({ formTitle, aiName, aiAvatar, welcomeMessage, tone, fields }: ChatPreviewProps) {
    const messages = useMemo(
        () => buildMessages(formTitle, aiName, tone, welcomeMessage, fields),
        [formTitle, aiName, tone, welcomeMessage, fields]
    );
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const last = messages[messages.length - 1]?.delay ?? 0;
        const t = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), last + 200);
        return () => clearTimeout(t);
    }, [messages]);

    return (
        <div className="h-full flex flex-col bg-[#0B0B0F]">
            {/* Preview label */}
            <div className="flex items-center justify-center gap-2 py-2 border-b border-gray-800/80 shrink-0">
                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Live Preview</span>
            </div>

            {/* Phone-frame */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                <div
                    className="w-full max-w-sm bg-[#0f0f14] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                    style={{ height: "520px" }}
                >
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
                                key={`${formTitle}-${aiName}-${tone}-${welcomeMessage}-${i}`}
                                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                style={{
                                    animation: "fadeIn 0.3s ease forwards",
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

                        {/* Typing indicator — appears after last message */}
                        <div
                            className="flex gap-2 justify-start"
                            style={{
                                animation: "fadeIn 0.3s ease forwards",
                                animationDelay: `${(messages[messages.length - 1]?.delay ?? 0) + 700}ms`,
                                opacity: 0,
                            }}
                        >
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
                                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pb-4 shrink-0">
                <p className="text-[10px] text-gray-700">Preview updates as you configure</p>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
