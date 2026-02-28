"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { registerUser, loginWithGoogle } from "@/lib/api/auth";
import { RegisterDto } from "@/app/types/Auth";
import { motion } from "motion/react";
import { ChatMockup } from "@/components/ChatMockup";
import { Background } from "@/components/Background";
import { Mail, Lock, User, ArrowRight, Loader2, Building, Globe, MapPin, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDto>({
    mode: "onBlur",
  });

  const { isLoading: checkingAuth } = useAuth("/dashboard");

  const onSubmit = async (data: RegisterDto) => {
    setError("");
    setLoading(true);

    try {
      const response = await registerUser(data);

      // Redirect to dashboard or home page after successful registration
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <Background />
        <div className="text-center relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-[#6E8BFF] mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] relative">
      <Background />

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Side - Content */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
          <motion.div
            className="relative z-10 w-full max-w-lg"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                Build Forms That{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6E8BFF] via-[#9A6BFF] to-[#F4E7B8]">
                  Understand You
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                Experience the future of form building with AI-powered conversations
              </p>
            </div>
            <ChatMockup />
          </motion.div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-[#1C1C24] rounded-2xl p-10 shadow-xl border border-white/10 backdrop-blur-sm">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Create Account
                </h1>
                <p className="text-gray-400">
                  Start building intelligent forms today
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-400 text-xs">✕</span>
                  </div>
                  <p className="text-red-400 text-sm flex-1">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        id="firstName"
                        {...register("firstName", {
                          required: "First name is required",
                          minLength: {
                            value: 2,
                            message: "Must be at least 2 characters",
                          },
                        })} className={`w-full pl-12 pr-4 py-3.5 bg-[#0B0B0F] border ${errors.firstName ? "border-red-500/50" : "border-white/10"
                          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 focus:border-transparent transition-all`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        id="lastName"
                        {...register("lastName", {
                          required: "Last name is required",
                          minLength: {
                            value: 2,
                            message: "Must be at least 2 characters",
                          },
                        })}
                        className={`w-full pl-12 pr-4 py-3.5 bg-[#0B0B0F] border ${errors.lastName ? "border-red-500/50" : "border-white/10"
                          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 focus:border-transparent transition-all`}
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
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
                      className={`w-full pl-12 pr-4 py-3.5 bg-[#0B0B0F] border ${errors.email ? "border-red-500/50" : "border-white/10"
                        } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 focus:border-transparent transition-all`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      id="password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                      className={`w-full pl-12 pr-4 py-3.5 bg-[#0B0B0F] border ${errors.password ? "border-red-500/50" : "border-white/10"
                        } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 focus:border-transparent transition-all`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                  {!errors.password && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      Must be at least 8 characters
                    </p>
                  )}
                </div>

                {/* Organization Section */}
                <div className="pt-6 mt-6 border-t border-white/10 gap-x-6">
                  <h3 className="text-lg font-semibold text-white mb-1">Company Information</h3>
                  <p className="text-xs text-gray-400 mb-5">Tell us about your organization to personalize your experience.</p>

                  <div className="space-y-5">
                    {/* Organization Name & Website */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300 mb-2">
                          Company Name <span className="text-[#6E8BFF]">*</span>
                        </label>
                        <div className="relative">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="text"
                            id="organizationName"
                            {...register("organizationName", { required: "Company name is required" })}
                            className={`w-full pl-12 pr-4 py-3.5 bg-[#0B0B0F] border ${errors.organizationName ? "border-red-500/50" : "border-white/10"
                              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 transition-all`}
                            placeholder="Acme Corp"
                          />
                        </div>
                        {errors.organizationName && <p className="mt-1.5 text-xs text-red-400">{errors.organizationName.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="organizationWebsite" className="block text-sm font-medium text-gray-300 mb-2">
                          Website
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="url"
                            id="organizationWebsite"
                            {...register("organizationWebsite")}
                            className="w-full pl-12 pr-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 transition-all"
                            placeholder="https://acme.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="organizationEmail" className="block text-sm font-medium text-gray-300 mb-2">
                          Company Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="email"
                            id="organizationEmail"
                            {...register("organizationEmail")}
                            className="w-full pl-12 pr-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 transition-all"
                            placeholder="contact@acme.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="organizationPhone" className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="tel"
                            id="organizationPhone"
                            {...register("organizationPhone")}
                            className="w-full pl-12 pr-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 transition-all"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label htmlFor="organizationAddress" className="block text-sm font-medium text-gray-300 mb-2">
                        Street Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          id="organizationAddress"
                          {...register("organizationAddress")}
                          className="w-full pl-12 pr-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 transition-all"
                          placeholder="123 Innovation Way"
                        />
                      </div>
                    </div>

                    {/* Location Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="organizationCity" className="block text-sm font-medium text-gray-300 mb-2">City</label>
                        <input
                          type="text"
                          id="organizationCity"
                          {...register("organizationCity")}
                          className="w-full px-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 transition-all"
                          placeholder="San Francisco"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="organizationState" className="block text-sm font-medium text-gray-300 mb-2">State</label>
                        <input
                          type="text"
                          id="organizationState"
                          {...register("organizationState")}
                          className="w-full px-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 transition-all"
                          placeholder="CA"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="organizationZip" className="block text-sm font-medium text-gray-300 mb-2">ZIP</label>
                        <input
                          type="text"
                          id="organizationZip"
                          {...register("organizationZip")}
                          className="w-full px-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 transition-all"
                          placeholder="94105"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="organizationCountry" className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                        <input
                          type="text"
                          id="organizationCountry"
                          {...register("organizationCountry")}
                          className="w-full px-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 transition-all"
                          placeholder="US"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="organizationDescription" className="block text-sm font-medium text-gray-300 mb-2">
                        Company Description
                      </label>
                      <textarea
                        id="organizationDescription"
                        {...register("organizationDescription")}
                        rows={3}
                        className="w-full px-4 py-3.5 bg-[#0B0B0F] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]/50 transition-all resize-none"
                        placeholder="What does your company do?"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 px-6 py-4 rounded-lg bg-gradient-to-r from-[#6E8BFF] to-[#9A6BFF] text-white font-semibold hover:shadow-lg hover:shadow-[#6E8BFF]/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#1C1C24] text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-[#0B0B0F] border border-white/10 rounded-lg text-white hover:bg-white/5 transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-[#0B0B0F] border border-white/10 rounded-lg text-white hover:bg-white/5 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <a
                    href="/sign-in"
                    className="text-[#6E8BFF] hover:text-[#9A6BFF] font-medium transition-colors"
                  >
                    Sign in
                  </a>
                </p>
              </div>

              {/* Terms */}
              <p className="mt-6 text-xs text-gray-500 text-center leading-relaxed">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-gray-400 hover:text-white transition-colors underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-gray-400 hover:text-white transition-colors underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;


