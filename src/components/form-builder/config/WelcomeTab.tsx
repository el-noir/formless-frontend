"use client";

import React from "react";
import { Lightbulb } from "lucide-react";

const SUGGESTIONS = [
    "Hi there! I'm here to help you fill out this form. Let's get started! 👋",
    "Welcome! I'll guide you through a quick conversation to collect your information.",
    "Hello! I'll be asking you a few questions to complete this form. It only takes a minute.",
];

interface WelcomeTabProps {
    message: string;
    formTitle: string;
    onChange: (message: string) => void;
}

export function WelcomeTab({ message, formTitle, onChange }: WelcomeTabProps) {
    return (
        <div className="space-y-5">
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Opening Message</label>
                <textarea
                    value={message}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={`Hi! I'm here to help you complete "${formTitle}". Let's get started!`}
                    rows={4}
                    maxLength={300}
                    className="w-full bg-[#111116] border border-gray-800 rounded text-sm text-white px-3 py-2 focus:outline-none focus:border-[#9A6BFF] transition-colors placeholder-gray-600 resize-none leading-relaxed"
                />
                <div className="flex justify-between mt-1">
                    <p className="text-[10px] text-gray-600">This is the first message users see when opening the chat.</p>
                    <span className="text-[10px] text-gray-600">{message.length}/300</span>
                </div>
            </div>

            {/* Quick suggestions */}
            <div>
                <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-3 h-3 text-yellow-500/70" />
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Suggestions</span>
                </div>
                <div className="space-y-2">
                    {SUGGESTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => onChange(s)}
                            className="w-full text-left text-xs text-gray-400 hover:text-white bg-[#111116] hover:bg-[#1C1C22] border border-gray-800 hover:border-gray-700 px-3 py-2 rounded transition-colors leading-relaxed"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
