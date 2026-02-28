"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Background } from "@/components/Background";

interface GeneratingOverlayProps {
    form: any;      // full form object so we can show real field names
    totalMs: number;
}

// Build a realistic log sequence from the actual form data
function buildLogLines(form: any): { text: string; delay: number }[] {
    const fields: any[] = form.fields ?? form.formFields ?? [];
    const name = form.title ?? "Form";

    const base = [
        { text: `> Initializing AI Chat Builder...`, delay: 0 },
        { text: `> Connecting to form registry`, delay: 180 },
        { text: `> Fetching "${name}"`, delay: 340 },
        { text: `> Parsing ${fields.length || 0} field${fields.length !== 1 ? "s" : ""}...`, delay: 260 },
    ];

    // Show up to 5 real field names
    const fieldLines = fields.slice(0, 5).map((f: any, i: number) => ({
        text: `  ✓ ${f.label ?? f.title ?? `Field ${i + 1}`} (${(f.type ?? "text").toUpperCase().replace(/_/g, " ")})`,
        delay: 90 + Math.floor(Math.random() * 60),
    }));

    if (fields.length > 5) {
        fieldLines.push({
            text: `  ... and ${fields.length - 5} more`,
            delay: 80,
        });
    }

    const tail = [
        { text: `> Setting up AI conversation layer...`, delay: 320 },
        { text: `> Configuring language model context...`, delay: 260 },
        { text: `> Building live preview...`, delay: 300 },
        { text: `> Ready. Opening builder ✓`, delay: 220 },
    ];

    return [...base, ...fieldLines, ...tail];
}

export function GeneratingOverlay({ form, totalMs }: GeneratingOverlayProps) {
    const lines = useRef(buildLogLines(form));
    const [visibleCount, setVisibleCount] = useState(0);
    const [done, setDone] = useState(false);
    const [exiting, setExiting] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    // Stream lines in one by one with their own delays
    useEffect(() => {
        let cumulative = 0;
        const timers: ReturnType<typeof setTimeout>[] = [];

        lines.current.forEach((line, i) => {
            cumulative += line.delay + (i === 0 ? 150 : 0); // slight initial pause
            timers.push(
                setTimeout(() => setVisibleCount((c) => Math.max(c, i + 1)), cumulative)
            );
        });

        // "done" state
        timers.push(setTimeout(() => setDone(true), totalMs - 500));
        // begin exit
        timers.push(setTimeout(() => setExiting(true), totalMs - 300));

        // Smooth progress bar
        const start = Date.now();
        const rafId = setInterval(() => setElapsed(Date.now() - start), 40);

        return () => {
            timers.forEach(clearTimeout);
            clearInterval(rafId);
        };
    }, [totalMs]);

    const progress = Math.min((elapsed / (totalMs - 250)) * 100, 100);
    const shownLines = lines.current.slice(0, visibleCount);

    return (
        <AnimatePresence>
            {!exiting && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B0B0F]"
                >
                    <Background />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                        className="relative z-10 w-full max-w-lg mx-4"
                    >
                        {/* Terminal window */}
                        <div className="bg-[#0f0f14] border border-gray-800 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(154,107,255,0.08)]">

                            {/* Window chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-[#0B0B0F]">
                                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                                <div className="w-3 h-3 rounded-full bg-green-500/40" />
                                <span className="ml-3 text-gray-600 text-xs font-mono">formless — ai-builder</span>
                                <div className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-medium text-[#9A6BFF]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#9A6BFF] animate-pulse" />
                                    {done ? "Ready" : "Processing"}
                                </div>
                            </div>

                            {/* Log output */}
                            <div className="px-5 py-4 font-mono text-xs min-h-[220px] max-h-[300px] overflow-hidden relative">
                                <div className="space-y-1">
                                    {shownLines.map((line, i) => {
                                        const isSuccess = line.text.includes("✓");
                                        const isCommand = line.text.startsWith(">");
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -4 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className={`leading-relaxed ${isSuccess
                                                        ? "text-green-400/80"
                                                        : isCommand
                                                            ? "text-gray-300"
                                                            : "text-gray-500"
                                                    }`}
                                            >
                                                {line.text}
                                                {/* Blinking cursor on last line */}
                                                {i === shownLines.length - 1 && !done && (
                                                    <span className="ml-0.5 inline-block w-[5px] h-[11px] bg-[#9A6BFF] align-middle animate-pulse" />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Subtle bottom fade */}
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0f0f14] to-transparent pointer-events-none" />
                            </div>

                            {/* Progress bar */}
                            <div className="h-[2px] w-full bg-gray-800/60">
                                <div
                                    className="h-full bg-[#9A6BFF] transition-all duration-75"
                                    style={{
                                        width: `${progress}%`,
                                        boxShadow: "0 0 8px rgba(154,107,255,0.5)",
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
