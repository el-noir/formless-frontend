"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { API_BASE_URL } from "@/lib/api/config";
import { Loader2 } from "lucide-react";
import { Background } from "@/components/Background";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    // refreshToken is no longer in the URL — it's set as an httpOnly cookie by the server

    if (!accessToken) {
      router.push("/sign-in?error=auth_failed");
      return;
    }

    // Fetch user data with the access token
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();

        // Store auth data in Zustand
        setAuth(userData, { accessToken });

        // Redirect to dashboard
        router.push("/dashboard");
      } catch {
        router.push("/sign-in?error=auth_failed");
      }
    };

    fetchUserData();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
      <Background />
      <div className="text-center relative z-10">
        <Loader2 className="w-8 h-8 animate-spin text-[#6E8BFF] mx-auto mb-4" />
        <p className="text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
          <Background />
          <div className="text-center relative z-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#6E8BFF] mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
