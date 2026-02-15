"use client";

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getAccessToken, logoutUser } from '@/lib/api/auth';
import { LogOut, User } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check authentication status
    const token = getAccessToken();
    setIsAuthenticated(!!token);
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    router.push('/');
  };

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
          {isAuthenticated ? (
            <>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:block">Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-medium text-white hover:text-gray-300 hidden sm:block">
                Sign In
              </Link>
              <Link href="/sign-up" className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Start Free
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

