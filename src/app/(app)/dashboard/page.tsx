"use client";

import React from "react";
import { motion } from "motion/react";
import { useRequireAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

function Dashboard() {
  const { isLoading } = useRequireAuth();

  // Show loading while checking authentication
  if (isLoading) {
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
    <div className="min-h-screen bg-[#1a1a24] pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back to Formless AI</p>
        </motion.div>

        {/* Content */}
        <motion.div
          className="bg-[#2a2a38] rounded-2xl p-8 shadow-xl border border-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-[#7c8aff] to-[#b39dff] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Your Dashboard
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Start building intelligent forms with AI-powered conversations
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
