import { motion } from 'motion/react';
import { ArrowRight, Play } from 'lucide-react';
import { MagneticButton } from './ui/MagneticButton';
import { ChatMockup } from './ChatMockup';
import Image from 'next/image';

const avatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces"
];

export function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden" aria-label="Hero section">
      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-[#9A6BFF] font-medium backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#9A6BFF] animate-pulse" />
            Launching Soon
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] text-white">
            Turn Your Forms Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6E8BFF] via-[#9A6BFF] to-[#F4E7B8]">
              Conversations.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed">
            Transform static Google Forms into intelligent AI-driven chat experiences that collect structured data automatically. No coding required.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <MagneticButton className="group relative px-8 py-4 bg-[#1C1C24] text-white font-semibold rounded-full border border-white/10 hover:border-[#6E8BFF]/50 transition-colors shadow-[0_0_30px_rgba(110,139,255,0.15)] overflow-hidden cursor-pointer">
              <a href="/start-free" className="relative flex items-center gap-2 z-10 focus:outline-none" aria-label="Start your free trial">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#6E8BFF] to-[#9A6BFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Start Free <ArrowRight className="inline-block w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </a>
            </MagneticButton>

            <button
              className="px-8 py-4 text-gray-300 font-medium hover:text-white flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6E8BFF] rounded-full"
              aria-label="Watch product demo video"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              View Demo
            </button>
          </div>

          <div className="pt-8 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex -space-x-3">
              {avatars.map((src, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0B0B0F] overflow-hidden">
                  <Image src={src} alt={`User ${i + 1}`} width={40} height={40} className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-[#1C1C24] border-2 border-[#0B0B0F] flex items-center justify-center text-xs font-bold text-white">
                2k+
              </div>
            </div>
            <p className="text-gray-400">Trusted by 2,000+ creators</p>
          </div>
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative z-10"
        >
          <ChatMockup />
        </motion.div>
      </div>
    </section>
  );
}
