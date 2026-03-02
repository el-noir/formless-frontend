"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';

export function HeroDashboardReveal() {
    const containerRef = useRef<HTMLDivElement>(null);
    const dashRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"] // Keep offset for scale/translate, but remove for opacity
    });

    // High-visibility transforms
    const dashScale = useTransform(scrollYProgress, [0.1, 0.9], [0.95, 1]);
    const dashTranslateY = useTransform(scrollYProgress, [0.1, 0.9], [30, 0]);

    // Intense Aura Backlighting - Very strong for maximum contrast
    const auraOpacity = useTransform(scrollYProgress, [0.1, 0.8], [0, 1]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dashRef.current) return;
        const rect = dashRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -0.8;
        const rotateY = ((x - centerX) / centerX) * 0.8;

        dashRef.current.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.001, 1.001, 1.001)`;
    };

    const handleMouseLeave = () => {
        if (!dashRef.current) return;
        dashRef.current.style.transform = `perspective(2000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    };

    return (
        <div ref={containerRef} className="relative h-[120vh] w-full pt-10">
            <div className="sticky top-24 h-[75vh] w-full flex items-center justify-center overflow-visible">

                {/* Ultra-Intense Aura Halo */}
                <motion.div
                    style={{ opacity: auraOpacity }}
                    className="absolute inset-x-0 w-[130%] h-[130%] left-1/2 -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(154,107,255,0.35)_0%,transparent_65%)] blur-[100px] pointer-events-none z-0"
                />

                {/* Dashboard Preview Container */}
                <motion.div
                    style={{
                        scale: dashScale,
                        opacity: 1, // FORCE 100% OPACITY FOR MAXIMUM VISIBILITY
                        y: dashTranslateY,
                    }}
                    className="relative w-full max-w-6xl mx-auto px-4 md:px-6 z-10"
                >
                    <div style={{ perspective: "2000px" }}>
                        <div
                            ref={dashRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            className="relative w-full aspect-video rounded-[32px] overflow-hidden border border-brand-purple/40 bg-[#0B0B0F] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9),0_0_80px_-20px_rgba(154,107,255,0.4)] transition-transform duration-500 ease-out transform-gpu"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Dashboard Image with Brightness & Contrast Filters - Anchored to Sidebar (Left) */}
                            <Image
                                src="/dashboard.png"
                                alt="Formless Dashboard Interface"
                                fill
                                className="object-left-top object-cover select-none filter brightness-[1.22] contrast-[1.1]"
                                priority
                            />

                            {/* Glowing Rim Lights */}
                            <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-brand-purple/30 pointer-events-none" />
                            <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_0_60px_rgba(255,255,255,0.08)] pointer-events-none" />
                        </div>
                    </div>

                    {/* Ground Glow Background */}
                    <motion.div
                        style={{ opacity: auraOpacity }}
                        className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full h-32 bg-brand-purple/30 blur-[120px] rounded-full pointer-events-none -z-10"
                    />
                </motion.div>

            </div>
        </div>
    );
}
