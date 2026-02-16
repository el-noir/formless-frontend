"use client";

import { motion } from "motion/react";
import { Hero } from "@/components/Hero";
import { Background } from "@/components/Background";
import { SocialProof } from "@/components/SocialProof";
import { BentoFeatures } from "@/components/BentoFeatures";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { HowItWorks } from "@/components/HowItWorks";
import {Stats} from "@/components/Stats";
import { LivePreview } from "@/components/LivePreview";
import { Integrations } from "@/components/Integrations";
import { FinalCTA } from "@/components/FinalCTA";


export default function AppPage() {
  return (
       <div className="relative min-h-screen bg-[#0B0B0F] text-white selection:bg-[#9A6BFF] selection:text-white overflow-x-hidden">
      <style>{`
        h1, h2, h3, h4, h5, h6 { font-family: 'Space Grotesk', sans-serif; }
        body { font-family: 'Inter', sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>
            <Background />
            
            <main id="main-content">
              <Hero />
              <SocialProof />
              <Stats />
              <HowItWorks />
              <LivePreview />
              <BentoFeatures />
              <Testimonials />
              <Integrations />
              <FinalCTA />
            </main>
            
            <Footer />
    </div>
  );
}
