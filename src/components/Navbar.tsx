'use client';

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { logoutUser } from '@/lib/api/auth';

const navItems = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Integrations', href: '#integrations' },
  { name: "Case Studies", href: "/case-studies" }
];

const authNavItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Organizations', href: '/organizations' },
  { name: 'My Forms', href: '/forms' },
  { name: 'Integrations', href: '/integrations' }
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // logoutUser already clears local state in its finally block
    }
    window.location.href = "/";
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center px-4 pointer-events-none transition-all duration-300">
      <motion.nav
        className={`pointer-events-auto rounded-full transition-all duration-300 ${scrolled ? 'bg-[#111116]/80 backdrop-blur-md border border-gray-800 shadow-xl' : 'bg-transparent border border-transparent'
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md focus:font-semibold"
        >
          Skip to content
        </a>

        <div className="px-6 md:px-8 h-14 flex items-center justify-between gap-6 md:gap-12">
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[#6E8BFF] focus:ring-offset-2 focus:ring-offset-[#0B0B0F] rounded-lg"
            aria-label="FormAI home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6E8BFF] to-[#9A6BFF] flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform" aria-hidden="true">
              F
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FormAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {(isAuthenticated && !isLoading ? authNavItems : navItems).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group focus:outline-none focus:text-white"
                aria-label={`Navigate to ${item.name}`}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#6E8BFF] transition-all group-hover:w-full group-focus:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Show profile and logout if authenticated */}
            {isAuthenticated && !isLoading ? (
              <>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                  <span className="text-white font-medium">{user?.firstName} {user?.lastName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-[#6E8BFF] text-white font-semibold text-sm hover:bg-[#4B6BFF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6E8BFF] focus:ring-offset-2 focus:ring-offset-[#0B0B0F]"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-white hover:text-gray-300 hidden sm:block focus:outline-none focus:ring-2 focus:ring-[#6E8BFF] focus:ring-offset-2 focus:ring-offset-[#0B0B0F] rounded px-2 py-1"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] focus:outline-none focus:ring-2 focus:ring-[#6E8BFF] focus:ring-offset-2 focus:ring-offset-[#0B0B0F]"
                  aria-label="Start free trial"
                >
                  Start Free
                </Link>
              </>
            )}
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden p-2 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF] rounded-lg"
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-[#0B0B0F] border-l border-white/10 w-[300px]"
                id="mobile-menu"
              >
                <SheetHeader>
                  <SheetTitle className="text-white text-left">Navigation</SheetTitle>
                  <SheetDescription className="text-gray-400 text-left">
                    Explore FormAI features and resources
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                  {(isAuthenticated && !isLoading ? authNavItems : navItems).map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleNavClick}
                      className="text-lg font-medium text-gray-300 hover:text-white transition-colors focus:outline-none focus:text-white focus:pl-2"
                      aria-label={`Navigate to ${item.name}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {/* Show profile and logout if authenticated */}
                  {isAuthenticated && !isLoading ? (
                    <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                        <span className="text-white font-medium">{user?.firstName} {user?.lastName}</span>
                      </div>
                      <button
                        onClick={() => { handleNavClick(); handleLogout(); }}
                        className="px-6 py-3 rounded-full bg-[#6E8BFF] text-white font-semibold text-center hover:bg-[#4B6BFF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]"
                        aria-label="Logout"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
                      <Link
                        href="/sign-in"
                        onClick={handleNavClick}
                        className="text-lg font-medium text-gray-300 hover:text-white transition-colors focus:outline-none focus:text-white"
                        aria-label="Sign in to your account"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/sign-up"
                        onClick={handleNavClick}
                        className="px-6 py-3 rounded-full bg-white text-black font-semibold text-center hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]"
                        aria-label="Start free trial"
                      >
                        Start Free Trial
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
