"use client";

import dynamic from "next/dynamic";
import { Hero } from "@/components/Hero";
import { Background } from "@/components/Background";
import { SocialProof } from "@/components/SocialProof";
import { BentoFeatures } from "@/components/BentoFeatures";
import { Footer } from "@/components/Footer";
import { HowItWorks } from "@/components/HowItWorks";
import { Stats } from "@/components/Stats";
import { LivePreview } from "@/components/LivePreview";

const Testimonials = dynamic(() => import("@/components/Testimonials").then(mod => mod.Testimonials), { ssr: false });
const Integrations = dynamic(() => import("@/components/Integrations").then(mod => mod.Integrations), { ssr: false });
const FinalCTA = dynamic(() => import("@/components/FinalCTA").then(mod => mod.FinalCTA), { ssr: false });

export default function AppPage() {
  return (
    <div className="relative min-h-screen bg-[#0B0B0F] text-white selection:bg-[#9A6BFF] selection:text-white overflow-x-hidden">
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
