"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { loginUser, loginWithGoogle } from "@/lib/api/auth";
import { LoginDto } from "@/app/types/Auth";
import { motion, AnimatePresence } from "motion/react";
import { ChatMockup } from "@/components/ChatMockup";
import { Background } from "@/components/Background";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const FEATURE_PILLS = [
  { icon: Zap, label: 'AI-Powered Conversations' },
  { icon: ShieldCheck, label: 'Secure Data Collection' },
  { icon: BarChart3, label: 'Real-time Analytics' },
];

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({ mode: "onBlur" });

  const { isLoading: checkingAuth } = useAuth("/dashboard");

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError === "auth_failed") {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginDto) => {
    setError("");
    setLoading(true);
    try {
      await loginUser(data);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 600);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <Background />
        <div className="text-center relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const inputCls = (hasError: boolean) =>
    `w-full pl-12 pr-4 py-3.5 bg-[#0B0B0F] border ${
      hasError ? "border-red-500/50" : "border-white/10"
    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/30 transition-all`;

  return (
    <div className="min-h-screen bg-[#0B0B0F] relative">
      <Background />

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
          {/* Background Aura */}
          <div className="absolute inset-x-0 w-[150%] h-[150%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_50%)] blur-[100px] pointer-events-none z-0" />

          <motion.div
            className="relative z-10 w-full max-w-lg"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Welcome back
              </h1>
              <p className="text-gray-400 text-lg">
                Continue building with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-purple to-brand-gold font-semibold">
                  0Fill
                </span>
              </p>

              {/* Trust indicators */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { value: "10K+", label: "Active users" },
                  { value: "1M+", label: "Responses collected" },
                  { value: "99.9%", label: "Uptime SLA" },
                  { value: "50+", label: "Integrations" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[#111116] border border-gray-800/60 rounded-xl px-4 py-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]"
                  >
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview - Mini version of hero reveal */}
            <div className="relative mt-8">
               {/* Card frame */}
               <div className="relative rounded-2xl overflow-hidden border border-brand-purple/30 bg-[#0B0B0F] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(16,185,129,0.2)]">
                  {/* Top bar chrome */}
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-[#111116] border-b border-gray-800/60">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                      <div className="ml-auto flex items-center gap-1 bg-[#1C1C24] rounded px-2 py-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
                          <span className="text-[9px] text-gray-500 font-mono">0Fill.app/dashboard</span>
                      </div>
                  </div>

                  {/* Dashboard image */}
                  <div className="relative w-full aspect-[4/3]">
                      <Image
                          src="/dashboard.png"
                          alt="0Fill Dashboard"
                          fill
                          className="object-cover object-left-top select-none filter brightness-[1.18] contrast-[1.08]"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B0B0F] to-transparent pointer-events-none" />
                  </div>
              </div>
              
              {/* Feature pills row */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {FEATURE_PILLS.map(({ icon: Icon, label }) => (
                      <div
                          key={label}
                          className="flex items-center gap-1.5 bg-[#111116] border border-gray-800/60 rounded-full px-3 py-1.5 backdrop-blur-sm"
                      >
                          <Icon className="w-3 h-3 text-brand-purple shrink-0" />
                          <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">{label}</span>
                      </div>
                  ))}
              </div>
            </div>
            
          </motion.div>
        </div>

        {/* Right Side – Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-[#1C1C24] rounded-2xl p-10 shadow-xl border border-white/10 backdrop-blur-sm">
              {/* Header */}
              <div className="mb-8 p-1 flex flex-col items-center text-center">
                <Link
                  href="/"
                  className="inline-block mb-6 group focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-lg"
                >
                  <div className="relative w-16 h-16 rounded-2xl border border-brand-purple/20 bg-[#111116] flex items-center justify-center shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.4)] transition-all overflow-hidden p-3">
                    <Image src="/logo.png" alt="0Fill Logo" fill className="object-contain p-3" />
                  </div>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Sign In</h1>
                <p className="text-gray-400 text-sm">Access your account and continue building</p>
              </div>

              {/* Success banner */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                    <p className="text-green-400 text-sm">Signed in! Redirecting to dashboard…</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-red-400 text-xs">✕</span>
                    </div>
                    <p className="text-red-400 text-sm flex-1">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    <input
                      type="email"
                      id="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className={inputCls(!!errors.email)}
                      placeholder="john@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs text-brand-purple hover:underline transition-colors focus:outline-none"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                      className={`w-full pl-12 pr-12 py-3.5 bg-[#0B0B0F] border ${
                        errors.password ? "border-red-500/50" : "border-white/10"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/30 transition-all`}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-white/10 bg-[#0B0B0F] text-brand-purple focus:ring-2 focus:ring-brand-purple/50 accent-brand-purple"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-400 select-none cursor-pointer">
                    Remember me for 30 days
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full mt-2 px-6 py-4 rounded-lg bg-gradient-to-r from-brand-purple to-brand-purple/80 text-white font-semibold hover:shadow-lg hover:shadow-brand-purple/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : success ? (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#1C1C24] text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-[#1f1f2e] border border-[#3a3a4a] rounded-lg text-white hover:bg-[#252533] transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  disabled
                  title="Coming Soon"
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-[#0B0B0F] border border-white/10 rounded-lg text-gray-500 cursor-not-allowed opacity-60 transition-all relative group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Coming Soon
                  </span>
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm font-medium">
                  Don't have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-brand-purple hover:underline transition-colors focus:outline-none rounded font-semibold"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
          <Background />
          <div className="text-center relative z-10">
            <Loader2 className="w-8 h-8 animate-spin text-brand-purple mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
