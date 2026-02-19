"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { Background } from "@/components/Background";
import { Loader2 } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { getOAuthUrl, getForms } from "@/lib/api/oAuthForm";

const STORAGE_KEY = "google_access_token";

function Dashboard() {
  const { isLoading } = useRequireAuth();
  const { user } = useAuthStore();

  const [forms, setForms] = useState<any[] | null>(null);
  const [loadingForms, setLoadingForms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectGoogleForm = async () => {
    try {
      const url = await getOAuthUrl();
      window.location.href = url;
    } catch (err) {
      console.error("Error getting OAuth URL:", err);
      alert("Failed to connect Google Form. Please try again.");
    }
  };

  const fetchForms = async (token: string) => {
    setLoadingForms(true);
    setError(null);
    try {
      const data = await getForms(token);
      setForms(data.forms || data || []);
    } catch (err: any) {
      console.error("Error fetching forms:", err);
      setError(err?.message || "Failed to fetch forms");
    } finally {
      setLoadingForms(false);
    }
  };

  // On mount: check localStorage for a stored accessToken and auto-fetch forms
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      fetchForms(stored);
    }
  }, []);

  if (isLoading) {
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
    <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 pb-12 relative">
      <Background />
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-white mb-6">Welcome, { 'user'}!</h1>
        <p className="text-gray-400 mb-4">Your connected Google Forms will appear here.</p>

        {loadingForms ? (
          <div className="text-gray-400">Fetching forms...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forms.map((f: any) => (
              <div key={f.formId || f.id || f.name} className="bg-[#0f0f14] p-4 rounded-md border border-gray-800">
                <h3 className="text-white font-medium">{f.title || f.name}</h3>
                <p className="text-sm text-gray-400">{f.formId || f.id}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center text-gray-500">
            No forms connected yet. Click the button below to connect your first Google Form.
          </div>
        )}

        <MagneticButton onClick={connectGoogleForm} className="mt-4 bg-[#6E8BFF] hover:bg-[#5a72e0] text-white font-bold py-2 px-4 rounded transition duration-200">
          Connect Google Form
        </MagneticButton>
      </div>
    </div>
  );
}

export default Dashboard;
