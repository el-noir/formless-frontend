"use client";

import React from "react";
import type { ToneOption, FormTone } from "@/app/types/Form";

interface TonePickerProps {
    tones: ToneOption[];
    selected: FormTone | undefined;
    onSelect: (tone: FormTone) => void;
    loading?: boolean;
}

export function TonePicker({ tones, selected, onSelect, loading }: TonePickerProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-lg bg-[#111116] border border-gray-800 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div>
            <label className="block text-xs font-medium text-gray-300 mb-3">Conversation Tone</label>
            <div className="grid grid-cols-2 gap-2">
                {tones.map((tone) => (
                    <button
                        key={tone.value}
                        onClick={() => onSelect(tone.value)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                            selected === tone.value
                                ? "border-brand-purple bg-brand-purple/5 ring-1 ring-brand-purple/30"
                                : "border-gray-800 bg-[#111116] hover:border-gray-700"
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-base">{tone.icon}</span>
                            <span className="text-xs font-semibold text-white">{tone.label}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{tone.description}</p>
                    </button>
                ))}
            </div>

            {/* Preview greeting */}
            {selected && (
                <div className="mt-3 bg-[#111116] border border-gray-800 rounded-lg p-3">
                    <p className="text-[10px] text-gray-600 mb-1">Preview greeting</p>
                    <p className="text-xs text-gray-400 italic">
                        {tones.find((t) => t.value === selected)?.exampleGreeting}
                    </p>
                </div>
            )}
        </div>
    );
}
