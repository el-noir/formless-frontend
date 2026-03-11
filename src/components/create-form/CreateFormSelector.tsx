"use client";

import React from "react";
import { PenLine, Layout, Sparkles, ArrowLeft } from "lucide-react";
import type { CreationMethod } from "@/stores/formCreationStore";

const METHODS: { id: CreationMethod; label: string; description: string; icon: React.ElementType; accent: string }[] = [
    {
        id: "scratch",
        label: "Start from Scratch",
        description: "Build your form field by field with full control over every question, tone, and setting.",
        icon: PenLine,
        accent: "border-brand-purple/40 hover:border-brand-purple",
    },
    {
        id: "template",
        label: "Use a Template",
        description: "Pick from pre-built templates for common use cases — lead capture, feedback, registration, and more.",
        icon: Layout,
        accent: "border-blue-500/40 hover:border-blue-500",
    },
    {
        id: "ai",
        label: "AI Generate",
        description: "Describe what you need in plain English and let AI build the entire form — then refine until it's perfect.",
        icon: Sparkles,
        accent: "border-purple-500/40 hover:border-purple-500",
    },
];

interface CreateFormSelectorProps {
    onSelect: (method: CreationMethod) => void;
    onBack: () => void;
}

export function CreateFormSelector({ onSelect, onBack }: CreateFormSelectorProps) {
    return (
        <div className="max-w-2xl mx-auto w-full">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Forms
            </button>

            <div className="text-center mb-10">
                <h1 className="text-2xl font-semibold text-white mb-2">Create a New Form</h1>
                <p className="text-gray-500 text-sm">Choose how you&apos;d like to build your conversational form.</p>
            </div>

            <div className="grid gap-4">
                {METHODS.map((m) => {
                    const Icon = m.icon;
                    return (
                        <button
                            key={m.id}
                            onClick={() => onSelect(m.id)}
                            className={`w-full text-left bg-[#0B0B0F] border ${m.accent} rounded-lg p-5 transition-all group hover:bg-[#111116]`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-lg bg-[#1C1C22] border border-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-1">{m.label}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
