'use client'

import { API_BASE_URL } from "./config"
import axios from "axios"
import { useAuthStore } from "@/stores/authStore"

function getAuthHeaders() {
    const token = useAuthStore.getState().accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getOAuthUrl(): Promise<string> {
    try {
        const response = await axios.get(`${API_BASE_URL}/google/auth`, {
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
        });
        return response.data.url;
    } catch (error) {
        throw error;
    }
}

/**
 * Exchange Google OAuth code for access + refresh tokens.
 * Backend: GET /google/callback?code=...
 * Returns { success, accessToken, refreshToken, expiresIn, message }
 */
export async function handleGoogleCallback(code: string) {
    try {
        const response = await axios.get(`${API_BASE_URL}/google/callback`, {
            params: { code },
            headers: { ...getAuthHeaders() },
        });
        return response.data as {
            success: boolean;
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
            message: string;
        };
    } catch (error) {
        throw error;
    }
}

/**
 * Fetch forms from backend using an access token returned by the OAuth flow.
 * Backend: GET /google/forms?accessToken=...
 */
export async function getForms(accessToken: string) {
    try {
        const response = await axios.get(`${API_BASE_URL}/google/forms`, {
            params: { accessToken },
            headers: { ...getAuthHeaders() },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * Import a Google Form into the user's library.
 * Backend: POST /forms/import
 */
export async function importForm(formIdOrUrl: string, accessToken: string) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/forms/import`,
            { formIdOrUrl, accessToken },
            { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } },
        );
        return response.data as {
            success: boolean;
            message: string;
            data: {
                id: string;
                title: string;
                description: string;
                sourceUrl: string;
                questionCount: number;
                status: string;
            };
        };
    } catch (error) {
        throw error;
    }
}
