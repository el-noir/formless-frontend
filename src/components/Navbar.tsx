'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useOrgStore } from '@/stores/orgStore';
import { logoutUser } from '@/lib/api/auth';

const navItems = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Integrations', href: '#integrations' },
  { name: 'Case Studies', href: '/case-studies' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const { user } = useAuthStore();
  const { currentOrgId } = useOrgStore();
  const pathname = usePathname();

  const authNavItems = [
    { name: 'Dashboard', href: `/dashboard/${currentOrgId || ''}` },
    { name: 'My Forms', href: `/dashboard/${currentOrgId || ''}/forms` },
    { name: 'Integrations', href: `/dashboard/${currentOrgId || ''}/integrations` },
  ];

  const handleLogout = async () => {
    setDropdownOpen(false);
    try { await logoutUser(); } catch { /* clearAuth runs in finally */ }
    window.location.href = '/';
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = isAuthenticated && !isLoading ? authNavItems : navItems;

  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto relative" ref={dropdownRef}>
        {/* ─── Pill ───────────────────────────────────────────────── */}
        <motion.nav
          className={`rounded-full transition-all duration-300 ${scrolled
            ? 'bg-[#0B0B0F]/80 backdrop-blur-md border border-gray-800 shadow-xl'
            : 'bg-[#111116] border border-gray-700 shadow-lg md:bg-transparent md:border-transparent md:shadow-none'
            }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="px-5 md:px-8 h-14 flex items-center justify-between gap-3 md:gap-12">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[#9A6BFF] rounded-lg shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[#9A6BFF] flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform shrink-0">
                F
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Formless</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors relative group ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {item.name}
                    <span className={`absolute -bottom-1 left-0 h-[2px] bg-[#9A6BFF] transition-all ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && !isLoading ? (
                <>
                  <span className="text-white text-sm font-medium bg-white/10 px-3 py-1.5 rounded-lg">
                    {user?.firstName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#9A6BFF] text-white font-semibold text-sm hover:bg-[#8B5CF6] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/sign-in" className="text-sm font-medium text-white hover:text-gray-300 transition-colors px-2 py-1 rounded">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Start Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger — inside the pill */}
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="md:hidden p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg"
              aria-label="Open menu"
              aria-expanded={dropdownOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </motion.nav>

        {/* ─── Dropdown below the pill (mobile only) ──────────────── */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[#111116] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Nav links */}
              <div className="p-2">
                {items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${isActive
                        ? 'bg-[#9A6BFF]/10 text-white font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                      {item.name}
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#9A6BFF]" />}
                    </Link>
                  );
                })}
              </div>

              {/* Auth section */}
              <div className="border-t border-gray-800/80 p-3 space-y-2">
                {isAuthenticated && !isLoading ? (
                  <>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5">
                      <div className="w-7 h-7 rounded-full bg-[#9A6BFF]/20 flex items-center justify-center text-xs font-semibold text-[#9A6BFF]">
                        {user?.firstName?.charAt(0)}
                      </div>
                      <span className="text-white text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/sign-in"
                      onClick={() => setDropdownOpen(false)}
                      className="text-center py-2.5 rounded-xl border border-gray-800 text-sm font-medium text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setDropdownOpen(false)}
                      className="text-center py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors"
                    >
                      Start Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
