"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/api/auth";

/**
 * Hook to check authentication status
 * @param redirectTo - Path to redirect if authenticated (default: '/dashboard')
 * @returns { isAuthenticated, isLoading }
 */
export function useAuth(redirectTo?: string) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAccessToken();
      const isAuth = !!token;
      setIsAuthenticated(isAuth);
      setIsLoading(false);

      if (isAuth && redirectTo) {
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 * @param redirectTo - Path to redirect if not authenticated (default: '/sign-in')
 */
export function useRequireAuth(redirectTo: string = "/sign-in") {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAccessToken();
      const isAuth = !!token;
      setIsAuthenticated(isAuth);
      setIsLoading(false);

      if (!isAuth) {
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  return { isAuthenticated, isLoading };
}
