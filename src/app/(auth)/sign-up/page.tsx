"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { registerUser, loginWithGoogle } from "@/lib/api/auth";
import { RegisterDto } from "@/app/types/Auth";
import { motion, AnimatePresence } from "motion/react";
import { ChatMockup } from "@/components/ChatMockup";
import { Background } from "@/components/Background";
import {
  Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, Building, Globe, MapPin,
  Phone, Eye, EyeOff, CheckCircle2, Circle, Check, Zap, ShieldCheck, BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const FEATURE_PILLS = [
  { icon: Zap, label: 'AI-Powered Conversations' },
  { icon: ShieldCheck, label: 'Secure Data Collection' },
  { icon: BarChart3, label: 'Real-time Analytics' },
];

// ─── Password Strength ──────────────────────────────────────────────────────
type StrengthLevel = "weak" | "fair" | "good" | "strong";

function getPasswordStrength(password: string): {
  level: StrengthLevel;
  score: number;
  checks: Record<string, boolean>;
} {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  let level: StrengthLevel = "weak";
  if (score >= 5) level = "strong";
  else if (score >= 4) level = "good";
  else if (score >= 3) level = "fair";
  return { level, score, checks };
}

const strengthConfig: Record<
  StrengthLevel,
  { label: string; color: string; bars: number }
> = {
  weak: { label: "Weak", color: "#ef4444", bars: 1 },
  fair: { label: "Fair", color: "#f59e0b", bars: 2 },
  good: { label: "Good", color: "#3b82f6", bars: 3 },
  strong: { label: "Strong", color: "#10b981", bars: 4 },
};

// ─── Step Indicator ─────────────────────────────────────────────────────────
const steps = [
  { label: "Account", icon: User },
  { label: "Security", icon: Lock },
  { label: "Company", icon: Building },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  done
                    ? "bg-brand-purple border-brand-purple"
                    : active
                    ? "border-brand-purple bg-brand-purple/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {done ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Icon
                    className={`w-4 h-4 ${
                      active ? "text-brand-purple" : "text-gray-500"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-brand-purple" : done ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 rounded transition-all duration-500 ${
                  i < current ? "bg-brand-purple" : "bg-white/10"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Shared Input Props ──────────────────────────────────────────────────────
interface InputFieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

function InputField({ id, label, icon, error, hint, required, children }: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-brand-purple ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          {icon}
        </div>
        {children}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegisterDto & { confirmPassword: string }>({
    mode: "onBlur",
  });

  const { isLoading: checkingAuth } = useAuth("/dashboard");

  const strength = getPasswordStrength(passwordValue);
  const strengthCfg = strengthConfig[strength.level];

  const nextStep = useCallback(async () => {
    const fieldsPerStep: Array<(keyof (RegisterDto & { confirmPassword: string }))[]> = [
      ["firstName", "lastName", "email"],
      ["password", "confirmPassword"],
      ["organizationName"],
    ];
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, 2));
  }, [step, trigger]);

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: RegisterDto & { confirmPassword: string }) => {
    setError("");
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      await registerUser(payload);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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

  const passwordInputCls = (hasError: boolean) =>
    `w-full pl-12 pr-12 py-3.5 bg-[#0B0B0F] border ${
      hasError ? "border-red-500/50" : "border-white/10"
    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/30 transition-all`;

  return (
    <div className="min-h-screen bg-[#0B0B0F] relative">
      <Background />
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Panel */}
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
                Build Forms That{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-purple to-brand-gold">
                  Understand You
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                Experience the future of form building with AI-powered conversations
              </p>

              {/* Feature bullets */}
              <div className="mt-8 space-y-3">
                {[
                  "No more static dropdowns — AI adapts in real-time",
                  "Collect richer data with conversational UX",
                  "Connect Google Sheets, Notion, Webhooks & more",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
                    <p className="text-gray-300 text-sm">{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview - Mini version of hero reveal */}
            <div className="relative mt-8 group cursor-default">
               {/* Card frame */}
               <div className="relative rounded-2xl overflow-hidden border border-brand-purple/30 bg-[#0B0B0F] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(16,185,129,0.2)] transition-all duration-500 group-hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9),0_0_50px_-10px_rgba(16,185,129,0.3)] group-hover:-translate-y-1">
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
                          className="object-cover object-left-top select-none filter brightness-[1.18] contrast-[1.08] transition-transform duration-700 group-hover:scale-[1.02]"
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

        {/* Right Panel – Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-[#1C1C24] rounded-2xl p-8 shadow-xl border border-white/10 backdrop-blur-sm">
              {/* Logo + Header */}
              <div className="mb-6 p-1 flex flex-col items-center justify-center text-center">
                <Link
                  href="/"
                  className="inline-block mb-6 group focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-lg"
                >
                  <div className="relative w-16 h-16 rounded-2xl border border-brand-purple/20 bg-[#111116] flex items-center justify-center shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.4)] transition-all overflow-hidden p-3">
                    <Image src="/logo.png" alt="0Fill Logo" fill className="object-contain p-3" />
                  </div>
                </Link>
                <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Create Account</h1>
                <p className="text-gray-400 text-sm">Start building intelligent forms today</p>
              </div>

              {/* Step Indicator */}
              <StepIndicator current={step} />

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
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
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {/* ── STEP 0: Account ── */}
                  {step === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          id="firstName"
                          label="First Name"
                          icon={<User className="w-5 h-5" />}
                          error={errors.firstName?.message}
                          required
                        >
                          <input
                            type="text"
                            id="firstName"
                            {...register("firstName", {
                              required: "Required",
                              minLength: { value: 2, message: "Min 2 chars" },
                            })}
                            className={inputCls(!!errors.firstName)}
                            placeholder="John"
                          />
                        </InputField>

                        <InputField
                          id="lastName"
                          label="Last Name"
                          icon={<User className="w-5 h-5" />}
                          error={errors.lastName?.message}
                          required
                        >
                          <input
                            type="text"
                            id="lastName"
                            {...register("lastName", {
                              required: "Required",
                              minLength: { value: 2, message: "Min 2 chars" },
                            })}
                            className={inputCls(!!errors.lastName)}
                            placeholder="Doe"
                          />
                        </InputField>
                      </div>

                      <InputField
                        id="email"
                        label="Email Address"
                        icon={<Mail className="w-5 h-5" />}
                        error={errors.email?.message}
                        required
                      >
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
                        />
                      </InputField>

                      <button
                        type="button"
                        onClick={nextStep}
                        className="w-full mt-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-purple/80 text-white font-semibold hover:shadow-lg hover:shadow-brand-purple/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                      >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}

                  {/* ── STEP 1: Security ── */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {/* Password */}
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                          Password <span className="text-brand-purple">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            {...register("password", {
                              required: "Password is required",
                              minLength: { value: 8, message: "Min 8 characters" },
                              onChange: (e) => setPasswordValue(e.target.value),
                            })}
                            className={passwordInputCls(!!errors.password)}
                            placeholder="••••••••"
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

                        {/* Strength meter */}
                        {passwordValue && (
                          <div className="mt-3">
                            <div className="flex gap-1 mb-1.5">
                              {[1, 2, 3, 4].map((bar) => (
                                <div
                                  key={bar}
                                  className="h-1 flex-1 rounded-full transition-all duration-400"
                                  style={{
                                    backgroundColor:
                                      bar <= strengthCfg.bars
                                        ? strengthCfg.color
                                        : "rgba(255,255,255,0.1)",
                                  }}
                                />
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium" style={{ color: strengthCfg.color }}>
                                {strengthCfg.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {strength.score}/5 criteria met
                              </span>
                            </div>

                            {/* Checklist */}
                            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                              {[
                                { key: "length", label: "8+ characters" },
                                { key: "uppercase", label: "Uppercase letter" },
                                { key: "lowercase", label: "Lowercase letter" },
                                { key: "number", label: "Number" },
                                { key: "special", label: "Special character" },
                              ].map(({ key, label }) => (
                                <div key={key} className="flex items-center gap-1.5">
                                  {strength.checks[key] ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                                  )}
                                  <span
                                    className={`text-[11px] ${
                                      strength.checks[key] ? "text-gray-300" : "text-gray-600"
                                    }`}
                                  >
                                    {label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                          Confirm Password <span className="text-brand-purple">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                          <input
                            type={showConfirm ? "text" : "password"}
                            id="confirmPassword"
                            {...register("confirmPassword", {
                              required: "Please confirm your password",
                              validate: (val) =>
                                val === watch("password") || "Passwords do not match",
                              onChange: (e) => setConfirmValue(e.target.value),
                            })}
                            className={passwordInputCls(!!errors.confirmPassword)}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            aria-label="Toggle confirm password visibility"
                          >
                            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>
                        )}
                        {confirmValue && !errors.confirmPassword && confirmValue === passwordValue && (
                          <p className="mt-1.5 text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 mt-2">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 px-6 py-3.5 rounded-lg bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                          <ArrowLeft className="w-5 h-5" />
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={nextStep}
                          className="flex-1 px-6 py-3.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-purple/80 text-white font-semibold hover:shadow-lg hover:shadow-brand-purple/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                          Continue
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 2: Company ── */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                          id="organizationName"
                          label="Company Name"
                          icon={<Building className="w-5 h-5" />}
                          error={errors.organizationName?.message}
                          required
                        >
                          <input
                            type="text"
                            id="organizationName"
                            {...register("organizationName", { required: "Company name is required" })}
                            className={inputCls(!!errors.organizationName)}
                            placeholder="Acme Corp"
                          />
                        </InputField>

                        <InputField
                          id="organizationWebsite"
                          label="Website"
                          icon={<Globe className="w-5 h-5" />}
                        >
                          <input
                            type="url"
                            id="organizationWebsite"
                            {...register("organizationWebsite")}
                            className={inputCls(false)}
                            placeholder="https://acme.com"
                          />
                        </InputField>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                          id="organizationEmail"
                          label="Company Email"
                          icon={<Mail className="w-5 h-5" />}
                        >
                          <input
                            type="email"
                            id="organizationEmail"
                            {...register("organizationEmail")}
                            className={inputCls(false)}
                            placeholder="contact@acme.com"
                          />
                        </InputField>

                        <InputField
                          id="organizationPhone"
                          label="Phone Number"
                          icon={<Phone className="w-5 h-5" />}
                        >
                          <input
                            type="tel"
                            id="organizationPhone"
                            {...register("organizationPhone")}
                            className={inputCls(false)}
                            placeholder="+1 (555) 000-0000"
                          />
                        </InputField>
                      </div>

                      <InputField
                        id="organizationAddress"
                        label="Street Address"
                        icon={<MapPin className="w-5 h-5" />}
                      >
                        <input
                          type="text"
                          id="organizationAddress"
                          {...register("organizationAddress")}
                          className={inputCls(false)}
                          placeholder="123 Innovation Way"
                        />
                      </InputField>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                          <label htmlFor="organizationCity" className="block text-sm font-medium text-gray-300 mb-1.5">
                            City
                          </label>
                          <input
                            type="text"
                            id="organizationCity"
                            {...register("organizationCity")}
                            className="w-full px-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/30 transition-all"
                            placeholder="SF"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label htmlFor="organizationState" className="block text-sm font-medium text-gray-300 mb-1.5">
                            State
                          </label>
                          <input
                            type="text"
                            id="organizationState"
                            {...register("organizationState")}
                            className="w-full px-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/30 transition-all"
                            placeholder="CA"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label htmlFor="organizationZip" className="block text-sm font-medium text-gray-300 mb-1.5">
                            ZIP
                          </label>
                          <input
                            type="text"
                            id="organizationZip"
                            {...register("organizationZip")}
                            className="w-full px-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/30 transition-all"
                            placeholder="94105"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label htmlFor="organizationCountry" className="block text-sm font-medium text-gray-300 mb-1.5">
                            Country
                          </label>
                          <input
                            type="text"
                            id="organizationCountry"
                            {...register("organizationCountry")}
                            className="w-full px-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/30 transition-all"
                            placeholder="US"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="organizationDescription" className="block text-sm font-medium text-gray-300 mb-1.5">
                          Company Description{" "}
                          <span className="text-gray-600 font-normal">(optional)</span>
                        </label>
                        <textarea
                          id="organizationDescription"
                          {...register("organizationDescription")}
                          rows={2}
                          className="w-full px-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/30 transition-all resize-none"
                          placeholder="What does your company do?"
                        />
                      </div>

                      <div className="flex gap-3 mt-2">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 px-6 py-3.5 rounded-lg bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                          <ArrowLeft className="w-5 h-5" />
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-6 py-3.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-purple/80 text-white font-semibold hover:shadow-lg hover:shadow-brand-purple/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              Create Account
                              <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Social Auth – only on step 0 */}
              {step === 0 && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-[#1C1C24] text-gray-500">Or sign up with</span>
                    </div>
                  </div>

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
                </>
              )}

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-brand-purple font-semibold hover:underline transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Terms */}
              <p className="mt-4 text-xs text-gray-600 text-center leading-relaxed">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-gray-400 hover:text-white transition-colors underline">Terms</a>{" "}
                and{" "}
                <a href="#" className="text-gray-400 hover:text-white transition-colors underline">Privacy Policy</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
