'use client';

import { motion } from 'motion/react';
import { ArrowRight, Loader2, Sparkles, Zap, Shield } from 'lucide-react';
import { HeroDashboardReveal } from './HeroDashboardReveal';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startChat } from '@/lib/api/chat';

const avatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces"
];

const highlights = [
  { icon: Zap, text: 'Instant setup' },
  { icon: Shield, text: 'Privacy first' },
  { icon: Sparkles, text: 'AI-powered' },
];

export function Hero() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a Google Form URL');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await startChat(url.trim());
      // Navigate to start-free page with the url for the chat session
      router.push(`/start-free?url=${encodeURIComponent(url.trim())}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid URL or unable to connect. Please check and try again.');
      setLoading(false);
    }
  };

  return (
    <section className="relative pt-28 md:pt-36 flex flex-col items-center overflow-x-hidden" aria-label="Hero section">
      <div className="max-w-5xl mx-auto px-6 w-full flex flex-col items-center mb-16">

        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-sm text-brand-purple font-medium backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
            Now in Public Beta
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white text-center max-w-4xl"
        >
          Turn Any Google Form Into an{' '}
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-[#B794F6] to-brand-purple">
              AI Conversation
            </span>
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mt-6 text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed text-center"
        >
          Paste your form link below — our AI transforms it into a natural chat that collects responses automatically.
        </motion.p>

        {/* ── URL Input Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          className="w-full max-w-2xl mt-10"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center bg-brand-surface border border-white/10 rounded-2xl p-1.5 focus-within:border-brand-purple/50 focus-within:ring-2 focus-within:ring-brand-purple/20 transition-all shadow-[0_0_40px_-10px_rgba(154,107,255,0.15)]">
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                placeholder="https://docs.google.com/forms/d/e/..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 px-5 py-4 text-base focus:outline-none min-w-0"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="shrink-0 px-6 sm:px-8 py-3.5 bg-brand-purple hover:bg-[#8555e8] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Start Chat</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-red-400 text-sm pl-5"
              >
                {error}
              </motion.p>
            )}
          </form>

          {/* Feature highlights */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5">
            {highlights.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                <item.icon className="w-3.5 h-3.5 text-brand-purple/60" />
                <span>{item.text}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-1 h-1 rounded-full bg-green-500" />
              No sign-up required
            </div>
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
          className="mt-12 flex items-center justify-center gap-4 text-sm text-gray-500"
        >
          <div className="flex -space-x-2.5">
            {avatars.map((src, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-dark overflow-hidden ring-1 ring-white/10">
                <Image src={src} alt={`User ${i + 1}`} width={32} height={32} className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-brand-surface border-2 border-brand-dark ring-1 ring-white/10 flex items-center justify-center text-[10px] font-medium text-gray-400">
              2k+
            </div>
          </div>
          <div className="h-4 w-px bg-gray-800" />
          <p className="text-gray-400 font-medium">Trusted by 2,000+ creators</p>
        </motion.div>
      </div>

      {/* Interactive Scroll Reveal Section */}
      <HeroDashboardReveal />

    </section>
  );
}
