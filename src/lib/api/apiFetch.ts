/**
 * apiFetch — Authenticated fetch wrapper with automatic token refresh.
 *
 * Security model:
 * - Access token: stored in Zustand/localStorage, sent in Authorization header
 * - Refresh token: stored in an httpOnly cookie (set/read by server only, never accessible to JS)
 *
 * How refresh works:
 * 1. If an API call returns 401, call POST /auth/refresh
 * 2. The browser sends the httpOnly refresh cookie automatically (credentials: 'include')
 * 3. The server validates the cookie, rotates the refresh token, returns a new access token
 * 4. The new access token is saved and the original request is retried
 * 5. If refresh fails → clear auth + redirect to /sign-in
 */

import { useAuthStore } from "@/stores/authStore";
import { API_BASE_URL } from "./config";

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function attemptTokenRefresh(): Promise<string | null> {
    const { setAccessToken, clearAuth } = useAuthStore.getState();

    try {
        // The httpOnly refresh token cookie is sent automatically via credentials: 'include'
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            clearAuth();
            window.location.href = "/sign-in";
            return null;
        }

        const data = await res.json();
        setAccessToken(data.accessToken);
        return data.accessToken;
    } catch {
        clearAuth();
        window.location.href = "/sign-in";
        return null;
    }
}

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const { accessToken } = useAuthStore.getState();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Always include cookies (for the refresh token cookie)
    });

    // Not a 401 — return as-is
    if (res.status !== 401) {
        return res;
    }

    // --- 401: attempt silent token refresh ---

    if (isRefreshing) {
        // Queue this request while another refresh is in progress
        return new Promise((resolve) => {
            refreshQueue.push(async (newToken: string) => {
                const retried = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers: { ...headers, Authorization: `Bearer ${newToken}` },
                    credentials: "include",
                });
                resolve(retried);
            });
        });
    }

    isRefreshing = true;
    const newToken = await attemptTokenRefresh();
    isRefreshing = false;

    if (!newToken) {
        return res; // Return original 401 if refresh failed
    }

    // Flush queued requests with the new token
    refreshQueue.forEach((cb) => cb(newToken));
    refreshQueue = [];

    // Retry the original request
    return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
        credentials: "include",
    });
}
