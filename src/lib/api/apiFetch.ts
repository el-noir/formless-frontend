/**
 * apiFetch — Authenticated fetch wrapper with automatic token refresh.
 *
 * How it works:
 * 1. Attaches the current access token to every request.
 * 2. If a 401 is returned, it tries to refresh using the stored refresh token.
 * 3. On successful refresh, the new tokens are saved and the original request is retried.
 * 4. If the refresh also fails (e.g. refresh token expired), the user is logged out.
 */

import { useAuthStore } from "@/stores/authStore";
import { API_BASE_URL } from "./config";

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function attemptTokenRefresh(): Promise<string | null> {
    const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

    if (!refreshToken) {
        clearAuth();
        window.location.href = "/sign-in";
        return null;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${refreshToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            clearAuth();
            window.location.href = "/sign-in";
            return null;
        }

        const data = await res.json();
        setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
        });

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
    });

    // If not 401, return the response as-is
    if (res.status !== 401) {
        return res;
    }

    // --- 401 handling: attempt token refresh ---

    if (isRefreshing) {
        // Another request is already refreshing; queue this one
        return new Promise((resolve) => {
            refreshQueue.push(async (newToken: string) => {
                const retryHeaders = {
                    ...headers,
                    Authorization: `Bearer ${newToken}`,
                };
                const retried = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers: retryHeaders,
                });
                resolve(retried);
            });
        });
    }

    isRefreshing = true;
    const newToken = await attemptTokenRefresh();
    isRefreshing = false;

    if (!newToken) {
        // Refresh failed — return the original 401 response
        return res;
    }

    // Flush the queue with the new token
    refreshQueue.forEach((cb) => cb(newToken));
    refreshQueue = [];

    // Retry the original request with the new token
    const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
    };

    return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
    });
}
