"use client";

import React, { useEffect, useState } from "react";
import { Wand2, Check } from "lucide-react";

interface GeneratingOverlayProps {
    formTitle: string;
    totalMs: number;
}

const STEPS = [
    { label: "Reading form structure", duration: 700 },
    { label: "Setting up AI persona", duration: 700 },
    { label: "Preparing live preview", duration: 700 },
    { label: "Ready", duration: 500 },
];

export function GeneratingOverlay({ formTitle, totalMs }: GeneratingOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [exiting, setExiting] = useState(false);

    // Progress bar animation
    useEffect(() => {
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const pct = Math.min((elapsed / (totalMs - 300)) * 100, 100);
            setProgress(pct);
        }, 16);
        return () => clearInterval(interval);
    }, [totalMs]);

    // Step advancement
    useEffect(() => {
        let accumulated = 0;
        const timers: ReturnType<typeof setTimeout>[] = [];

        STEPS.forEach((step, i) => {
            if (i === 0) { accumulated += step.duration; return; }
            accumulated += STEPS[i - 1].duration;
            timers.push(setTimeout(() => setCurrentStep(i), accumulated));
        });

        // Fade-out slightly before actual unmount
        timers.push(setTimeout(() => setExiting(true), totalMs - 350));

        return () => timers.forEach(clearTimeout);
    }, [totalMs]);

    return (
        <div
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0B0F] transition-opacity duration-300 ${exiting ? "opacity-0" : "opacity-100"
                }`}
        >
            {/* Icon */}
            <div className="relative mb-8">
                <div className="w-14 h-14 rounded-xl bg-[#9A6BFF]/10 border border-[#9A6BFF]/20 flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-[#9A6BFF]" />
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-xl border border-[#9A6BFF]/30 animate-ping" />
            </div>

            {/* Title */}
            <p className="text-gray-400 text-xs mb-1 font-medium uppercase tracking-widest">AI Chat Builder</p>
            <h2 className="text-white text-lg font-semibold mb-8 text-center max-w-xs leading-snug">
                Setting up <span className="text-[#9A6BFF]">{formTitle}</span>
            </h2>

            {/* Steps */}
            <div className="space-y-2.5 mb-8 min-w-[220px]">
                {STEPS.map((step, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    return (
                        <div
                            key={step.label}
                            className={`flex items-center gap-3 transition-all duration-300 ${done || active ? "opacity-100" : "opacity-25"
                                }`}
                        >
                            <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${done
                                        ? "bg-green-500/20 border-green-500/40"
                                        : active
                                            ? "bg-[#9A6BFF]/20 border-[#9A6BFF]/50"
                                            : "border-gray-700"
                                    }`}
                            >
                                {done ? (
                                    <Check className="w-2.5 h-2.5 text-green-400" />
                                ) : active ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#9A6BFF] animate-pulse" />
                                ) : null}
                            </div>
                            <span
                                className={`text-xs font-medium transition-colors duration-300 ${done ? "text-gray-500 line-through" : active ? "text-white" : "text-gray-600"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="w-56 h-[2px] bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#9A6BFF] rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
