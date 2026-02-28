"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { ChatMockup } from './ChatMockup';

export function HeroDashboardReveal() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // ChatMockup transforms
    const chatScale = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
    const chatX = useTransform(scrollYProgress, [0, 1], ["0vw", "35vw"]);
    const chatY = useTransform(scrollYProgress, [0, 1], ["0vh", "25vh"]);
    const chatOpacity = useTransform(scrollYProgress, [0.8, 1], [1, 0.8]);

    // Dashboard transforms
    const dashScale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
    const dashOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

    return (
        <div ref={containerRef} className="relative h-[200vh] w-full">
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">

                {/* Dashboard Preview (Background Reveal) */}
                <motion.div
                    style={{
                        scale: dashScale,
                        opacity: dashOpacity
                    }}
                    className="absolute inset-0 flex items-center justify-center px-4 md:px-6 max-w-7xl mx-auto z-0"
                >
                    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gray-800 bg-[#0B0B0F] shadow-2xl">
                        <Image
                            src="/dashboard-live2.png"
                            alt="Formless Dashboard Interface"
                            fill
                            className="object-cover object-top"
                            priority
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
                    </div>
                </motion.div>

                {/* Chat Mockup (Foreground Shrinks) */}
                <motion.div
                    style={{
                        scale: chatScale,
                        x: chatX,
                        y: chatY,
                        opacity: chatOpacity,
                    }}
                    className="relative z-10 w-full max-w-[480px] p-4 origin-center"
                >
                    <ChatMockup />
                </motion.div>

            </div>
        </div>
    );
}
