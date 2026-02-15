"use client";

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0B0B0F]/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent border-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
           <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#6E8BFF] to-[#9A6BFF] flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
             F
           </div>
           <span className="text-xl font-bold text-white tracking-tight">Formless AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'Blog', 'Company'].map((item) => (
            <Link 
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6E8BFF] transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-white hover:text-gray-300 hidden sm:block">
            Sign In
          </Link>
          <Link href="/sign-up" className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Start Free
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
