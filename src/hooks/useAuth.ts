"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

/**
 * Hook to check authentication status
 * @param redirectTo - Path to redirect if authenticated (default: '/dashboard')
 * @returns { isAuthenticated, isLoading }
 */
export function useAuth(redirectTo?: string) {
  const router = useRouter();
  const { isAuthenticated, isLoading: storeLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for store to rehydrate
    if (!storeLoading) {
      if (isAuthenticated && redirectTo) {
        router.push(redirectTo);
      } else {
        setIsChecking(false);
      }
    }
  }, [isAuthenticated, storeLoading, redirectTo, router]);

  return { isAuthenticated, isLoading: storeLoading || isChecking };
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 * @param redirectTo - Path to redirect if not authenticated (default: '/sign-in')
 */
export function useRequireAuth(redirectTo: string = "/sign-in") {
  const router = useRouter();
  const { isAuthenticated, isLoading: storeLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for store to rehydrate
    if (!storeLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else {
        setIsChecking(false);
      }
    }
  }, [isAuthenticated, storeLoading, redirectTo, router]);

  return { isAuthenticated, isLoading: storeLoading || isChecking };
}
