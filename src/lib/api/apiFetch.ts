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
import { useOrgStore } from "@/stores/orgStore";
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
            // Only clear auth if the server explicitly rejects the refresh (401/403)
            if (res.status === 401 || res.status === 403) {
                clearAuth();
                window.location.href = "/sign-in";
            }
            return null;
        }

        const data = await res.json();
        setAccessToken(data.accessToken);
        return data.accessToken;
    } catch (error) {
        // Network errors or unexpected issues should NOT trigger a logout.
        // We just return null so the current action fails, but the session stays alive.
        console.error("Token refresh failed due to network/unexpected error:", error);
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

    // Automatically include Organization ID if we are in an organization context
    const { currentOrgId } = useOrgStore.getState();
    if (currentOrgId && !headers["x-organization-id"]) {
        headers["x-organization-id"] = currentOrgId;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Always include cookies (for the refresh token cookie)
    });

    // 401 Unauthorized — attempt silent token refresh
    if (res.status === 401 && accessToken) {
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

        if (newToken) {
            // Flush queued requests
            refreshQueue.forEach((cb) => cb(newToken));
            refreshQueue = [];

            // Retry original request
            return fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: { ...headers, Authorization: `Bearer ${newToken}` },
                credentials: "include",
            });
        }
    }

    return res;
}
