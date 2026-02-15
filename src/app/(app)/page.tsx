"use client";

import { motion } from "motion/react";
import { Hero } from "@/components/Hero";

export default function AppPage() {
  return (
       <div className="relative min-h-screen bg-[#0B0B0F] text-white selection:bg-[#9A6BFF] selection:text-white overflow-x-hidden">
      <style>{`
        h1, h2, h3, h4, h5, h6 { font-family: 'Space Grotesk', sans-serif; }
        body { font-family: 'Inter', sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>
      <Hero />
    </div>
  );
}
