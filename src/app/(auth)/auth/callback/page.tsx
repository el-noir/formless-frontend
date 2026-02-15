"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";
import { Background } from "@/components/Background";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      // If no tokens, redirect to sign-in with error
      router.push("/sign-in?error=auth_failed");
      return;
    }

    // Fetch user data with the access token
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();

        // Store auth data in Zustand
        setAuth(userData, {
          accessToken,
          refreshToken,
        });

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("Error fetching user data:", error);
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
