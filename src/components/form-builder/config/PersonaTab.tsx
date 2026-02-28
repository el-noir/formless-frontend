"use client";

import React from "react";

const TONES = [
    { value: "friendly", label: "Friendly", description: "Warm, approachable, uses casual language" },
    { value: "professional", label: "Professional", description: "Clear, formal, businesslike" },
    { value: "concise", label: "Concise", description: "Short answers, gets straight to the point" },
] as const;

const AVATARS = ["✨", "🤖", "💬", "🎯", "🧠", "⚡", "🌟", "💡"];

export type Tone = typeof TONES[number]["value"];

interface PersonaTabProps {
    name: string;
    tone: Tone;
    avatar: string;
    onChange: (updates: { name?: string; tone?: Tone; avatar?: string }) => void;
}

export function PersonaTab({ name, tone, avatar, onChange }: PersonaTabProps) {
    return (
        <div className="space-y-6">
            {/* AI Name */}
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">AI Assistant Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    placeholder="e.g. Alex"
                    maxLength={30}
                    className="w-full bg-[#111116] border border-gray-800 rounded text-sm text-white px-3 py-2 focus:outline-none focus:border-[#9A6BFF] transition-colors placeholder-gray-600"
                />
                <p className="text-[10px] text-gray-600 mt-1">This is the name users will see in the chat.</p>
            </div>

            {/* Avatar Emoji */}
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Avatar</label>
                <div className="flex gap-2 flex-wrap">
                    {AVATARS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => onChange({ avatar: emoji })}
                            className={`w-9 h-9 rounded text-lg transition-all flex items-center justify-center border ${avatar === emoji
                                    ? "border-[#9A6BFF] bg-[#9A6BFF]/10 scale-110"
                                    : "border-gray-800 bg-[#111116] hover:border-gray-600"
                                }`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tone */}
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Conversation Tone</label>
                <div className="space-y-2">
                    {TONES.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => onChange({ tone: t.value })}
                            className={`w-full text-left px-3 py-2.5 rounded border transition-colors ${tone === t.value
                                    ? "border-[#9A6BFF] bg-[#9A6BFF]/5 text-white"
                                    : "border-gray-800 bg-[#111116] text-gray-400 hover:border-gray-700"
                                }`}
                        >
                            <span className="text-xs font-medium block">{t.label}</span>
                            <span className="text-[10px] text-gray-500">{t.description}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
