"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { registerUser } from "@/lib/api/auth";
import { RegisterDto } from "@/app/types/Auth";
import { motion } from "motion/react";
import { ChatMockup } from "@/components/ChatMockup";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
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
      console.log("Registration successful:", response);

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
      <div className="min-h-screen bg-[#1a1a24] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7c8aff] mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a24] relative">
      {/* Navbar */}
      <Navbar />

      <div className="flex min-h-[calc(100vh-80px)] pt-20">
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
                <span className="bg-linear-to-r from-[#8B9FFF] to-[#B39DFF] bg-clip-text text-transparent">
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
            <div className="bg-[#2a2a38] rounded-2xl p-10 shadow-xl border border-white/5">
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
                      })}
                      className={`w-full pl-12 pr-4 py-3.5 bg-[#1f1f2e] border ${
                        errors.firstName ? "border-red-500/50" : "border-[#3a3a4a]"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c8aff]/50 focus:border-transparent transition-all`}
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
                      className={`w-full pl-12 pr-4 py-3.5 bg-[#1f1f2e] border ${
                        errors.lastName ? "border-red-500/50" : "border-[#3a3a4a]"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c8aff]/50 focus:border-transparent transition-all`}
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
                    className={`w-full pl-12 pr-4 py-3.5 bg-[#1f1f2e] border ${
                      errors.email ? "border-red-500/50" : "border-[#3a3a4a]"
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c8aff]/50 focus:border-transparent transition-all`}
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
                    className={`w-full pl-12 pr-4 py-3.5 bg-[#1f1f2e] border ${
                      errors.password ? "border-red-500/50" : "border-[#3a3a4a]"
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c8aff]/50 focus:border-transparent transition-all`}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 px-6 py-4 rounded-lg bg-linear-to-r from-[#7c8aff] to-[#b39dff] text-white font-semibold hover:shadow-lg hover:shadow-[#7c8aff]/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <a
                  href="/sign-in"
                  className="text-[#8b9fff] hover:text-[#b39dff] font-medium transition-colors"
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


