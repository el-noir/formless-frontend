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
    <section className="relative pt-32 pb-20 flex flex-col items-center overflow-hidden" aria-label="Hero section">
      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center">

        {/* Top Content: Grid */}
        <div className="w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16 lg:mb-24">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 relative z-10 flex flex-col items-start text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] border border-gray-800 text-sm text-[#9A6BFF] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9A6BFF]" />
              Launching Soon
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] text-white">
              Turn Your Forms Into{' '}
              <span className="text-[#9A6BFF] block mt-2">
                Conversations.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed">
              Transform static Google Forms into intelligent AI-driven chat experiences that collect structured data automatically. No coding required.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <MagneticButton className="px-8 py-3 bg-[#9A6BFF] hover:bg-[#8555e8] text-white font-medium rounded-md transition-colors cursor-pointer">
                <a href="/start-free" className="flex items-center gap-2 focus:outline-none" aria-label="Start your free trial">
                  <span>Start Free</span> <ArrowRight className="w-4 h-4" />
                </a>
              </MagneticButton>

              <button
                className="px-6 py-3 bg-[#111116] border border-gray-800 text-gray-300 font-medium hover:bg-[#1C1C22] hover:text-white flex items-center gap-2 transition-colors rounded-md"
                aria-label="Watch product demo video"
              >
                <Play className="w-4 h-4 fill-current" />
                View Demo
              </button>
            </div>

            <div className="pt-6 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-3">
                {avatars.map((src, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border border-gray-800 overflow-hidden">
                    <Image src={src} alt={`User ${i + 1}`} width={32} height={32} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-[#111116] border border-gray-800 flex items-center justify-center text-[10px] font-medium text-gray-300">
                  2k+
                </div>
              </div>
              <p className="text-gray-400 font-medium tracking-wide">Trusted by 2,000+ creators</p>
            </div>
          </motion.div>

          {/* Right Content: Chat Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative z-10"
          >
            <ChatMockup />
          </motion.div>

        </div>

        {/* Dashboard Preview Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="w-full max-w-6xl mx-auto relative z-10"
        >
          <div className="relative w-full aspect-[16/9] rounded-t-xl overflow-hidden border-x border-t border-gray-800 bg-[#0B0B0F]">
            <Image
              src="/dashboard-live2.png"
              alt="Formless Dashboard Interface"
              fill
              className="object-cover object-top"
              priority
            />
            {/* Fade out bottom mask */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0F] to-transparent z-20 pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
