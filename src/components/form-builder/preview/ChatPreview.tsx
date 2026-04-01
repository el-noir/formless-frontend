"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";

type Tone = "friendly" | "professional" | "concise";

interface Field {
    id: string;
    label: string;
    type: string;
    required?: boolean;
    options?: { label: string }[];
}

interface ChatPreviewProps {
    orgId?: string;
    formId?: string;
    formTitle: string;
    aiName: string;
    aiAvatar: string;
    welcomeMessage: string;
    tone: Tone;
    fields: Field[];
    removeBranding?: boolean;
    themeColor?: string;
    buttonStyle?: 'rounded' | 'square';
    
    previewData?: any;
    isLoading?: boolean;
    isDraft?: boolean;
    onTestAnswerSubmit?: (ans: string) => void;
    onResetTestAnswers?: () => void;
}

export function ChatPreview({
    formTitle,
    aiName,
    aiAvatar,
    welcomeMessage,
    tone,
    fields,
    removeBranding,
    themeColor = "#10b981",
    buttonStyle = "rounded",
    previewData,
    isLoading = false,
    isDraft,
    onTestAnswerSubmit,
    onResetTestAnswers
}: ChatPreviewProps) {
    const [inputValue, setInputValue] = useState('');

    // Utility to add alpha to hex colors for subtle borders
    const themeWithAlpha = (alpha: number) => {
        if (!themeColor.startsWith('#')) return themeColor;
        const r = parseInt(themeColor.slice(1, 3), 16);
        const g = parseInt(themeColor.slice(3, 5), 16);
        const b = parseInt(themeColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const isUrl = aiAvatar?.startsWith('http') || aiAvatar?.startsWith('/');

    // Select messages depending on if we have backend preview loaded yet
    const messages = useMemo(() => {
        const seq: { role: "ai" | "user"; text: string; delay: number; isFollowUp?: boolean }[] = [];
        let cumulativeDelay = 0;

        if (!previewData) {
            // Simple static mock if no data yet
            const aiOpening = welcomeMessage?.trim() || `Hi! I'm here to help you fill out "${formTitle}". Ready to begin?`;
            seq.push({ role: "ai", text: aiOpening, delay: 0 });
            return seq;
        }

        // B1-103: Render sequences based on backend's state map (Greeting -> FieldsSoFar Loop -> AI Reaction -> Next Question)
        seq.push({ role: "ai", text: previewData.greetingPrompt || "Welcome!", delay: 0 });

        const fieldsSoFar = previewData.fieldsSoFar || [];

        if (fieldsSoFar.length > 0) {
           seq.push({ role: "user", text: "Yes, I'm ready!", delay: cumulativeDelay += 700 });
           
           fieldsSoFar.forEach((ansObj: any, idx: number) => {
               const aiQuestion = ansObj.label ? `${ansObj.label}?` : "Next?";
               seq.push({ role: "ai", text: aiQuestion, delay: cumulativeDelay += 200 }); // speed up history playback
               seq.push({ role: "user", text: ansObj.value, delay: cumulativeDelay += 200 });
           });
        } else if (previewData.nextQuestion) {
           seq.push({ role: "user", text: "Yes, I'm ready!", delay: cumulativeDelay += 700 });
        }

        if (previewData.lastResponse) {
           seq.push({ role: "ai", text: previewData.lastResponse, delay: cumulativeDelay += 600 });
        }

        if (previewData.nextQuestion) {
           seq.push({ role: "ai", text: previewData.nextQuestion, delay: cumulativeDelay += 700 });
        }

        return seq;
    }, [formTitle, welcomeMessage, previewData]);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const last = messages[messages.length - 1]?.delay ?? 0;
        const t = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), last + 200);
        return () => clearTimeout(t);
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim() || !onTestAnswerSubmit) return;
        onTestAnswerSubmit(inputValue);
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    const hasTestAnswers = previewData?.fieldsSoFar?.length > 0;

    return (
        <div className="h-full flex flex-col bg-[#0B0B0F]">
            {/* Preview label */}
            <div className="flex items-center justify-center gap-2 py-2 border-b border-gray-800/80 shrink-0 relative">
                {isDraft && (
                    <span className="absolute left-4 bg-gray-800 text-gray-300 text-[9px] px-2 py-0.5 rounded-full font-medium tracking-wide">
                        BUILDER
                    </span>
                )}
                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider relative flex items-center gap-2">
                    Live Preview
                    {isLoading && <span className="relative w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-pulse" title="Syncing preview..." />}
                </span>
                
                {hasTestAnswers && onResetTestAnswers && (
                    <button 
                        onClick={onResetTestAnswers}
                        className="absolute right-4 text-gray-500 hover:text-white transition-colors flex items-center gap-1 opacity-80"
                        title="Reset Test Answers"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span className="text-[9px] font-medium tracking-wide">Reset</span>
                    </button>
                )}
            </div>

            {/* Phone-frame */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                <div
                    className="w-full max-w-sm bg-[#0f0f14] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative transition-all duration-300"
                    style={{ height: "520px" }}
                >
                    {/* Chat topbar */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/80 bg-[#0B0B0F] shrink-0 z-10">
                        <div
                            className="w-8 h-8 rounded-full border flex items-center justify-center text-base overflow-hidden"
                            style={{ backgroundColor: themeWithAlpha(0.1), borderColor: themeWithAlpha(0.2) }}
                        >
                            {isUrl ? <img src={aiAvatar} alt="" className="w-full h-full object-cover" /> : aiAvatar}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white">{aiName || "AI Assistant"}</p>
                            <div className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-amber-400" : "bg-green-400"}`} />
                                <p className="text-[10px] text-gray-500">{isLoading ? 'Thinking...' : 'Online'}</p>
                            </div>
                        </div>
                        {!removeBranding && (
                            <div className="ml-auto">
                                <Sparkles className="w-4 h-4 text-brand-purple/50" />
                            </div>
                        )}
                    </div>

                    {/* Messages */}
                    <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 transition-opacity duration-300 ${isLoading ? "opacity-60" : "opacity-100"}`}>
                        {messages.map((msg: any, i: number) => (
                            <div
                                key={`msg-${i}-${msg.text}`}
                                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
                                style={{
                                    animationDelay: `${hasTestAnswers ? 0 : msg.delay}ms`,
                                    animationFillMode: 'both'
                                }}
                            >
                                {msg.role === "ai" && (
                                    <div
                                        className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] shrink-0 mt-0.5 overflow-hidden"
                                        style={{ backgroundColor: themeWithAlpha(0.1), borderColor: themeWithAlpha(0.2) }}
                                    >
                                        {isUrl ? <img src={aiAvatar} alt="" className="w-full h-full object-cover" /> : aiAvatar}
                                    </div>
                                )}
                                <div
                                    className={`px-3 py-2 rounded-2xl text-xs leading-relaxed max-w-[75%] ${msg.role === "ai"
                                        ? "bg-[#1C1C22] border border-gray-800 text-gray-200 rounded-tl-sm relative"
                                        : "text-white rounded-tr-sm relative"
                                        }`}
                                    style={msg.role === "user" ? { backgroundColor: themeColor } : {}}
                                >
                                    {msg.isFollowUp && msg.role === 'ai' && (
                                        <div className="absolute -top-2.5 left-2 bg-[#6D28D9] text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold shadow-sm border border-[#5B21B6] text-white z-10 whitespace-nowrap">Contextual Follow-up</div>
                                    )}
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator — appears after last message is done */}
                        {!isLoading && (
                            <div
                                className="flex gap-2 justify-start animate-in fade-in duration-300"
                                style={{
                                    animationDelay: `${(messages[messages.length - 1]?.delay ?? 0) + 700}ms`,
                                    animationFillMode: 'both'
                                }}
                            >
                                <div
                                    className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] shrink-0 mt-0.5 overflow-hidden"
                                    style={{ backgroundColor: themeWithAlpha(0.1), borderColor: themeWithAlpha(0.2) }}
                                >
                                    {isUrl ? <img src={aiAvatar} alt="" className="w-full h-full object-cover" /> : aiAvatar}
                                </div>
                                <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-[#1C1C22] border border-gray-800 flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} className="h-2" />
                    </div>

                    {/* Input bar */}
                    {previewData && !isLoading && (
                        <div className="px-3 py-3 border-t border-gray-800/80 bg-[#0B0B0F] shrink-0 z-10 transition-all">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 bg-[#111116] border border-gray-800 rounded-xl px-3 py-2">
                                    <input 
                                        className="text-xs text-white bg-transparent outline-none flex-1 placeholder-gray-600"
                                        placeholder="Type a test answer..." 
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <button 
                                        onClick={handleSend}
                                        disabled={!inputValue.trim()}
                                        className={`w-6 h-6 flex items-center justify-center transition-opacity hover:opacity-100 disabled:opacity-50 opacity-80 ${buttonStyle === 'rounded' ? 'rounded-full' : 'rounded'}`}
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                                            <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                                {!removeBranding && (
                                    <p className="text-center text-[8px] text-gray-700">
                                        ⚡ Powered by Formless
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
