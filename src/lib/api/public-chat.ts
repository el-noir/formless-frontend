// Base URL for the NestJS API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Standard fetch wrapper for public, unauthenticated calls.
 */
async function publicApiFetch(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });
}

const BASE = `/public/chat`;

export const getPublicFormInfo = async (token: string) => {
    const res = await publicApiFetch(`${BASE}/${token}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to open chat link');
    }
    const data = await res.json();
    return data.data;
};

export const startPublicChat = async (token: string) => {
    const res = await publicApiFetch(`${BASE}/${token}/start`, {
        method: 'POST',
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to start chat session');
    }
    const data = await res.json();
    return data.data;
};

export const sendPublicChatMessage = async (token: string, sessionId: string, message: string) => {
    const res = await publicApiFetch(`${BASE}/${token}/message`, {
        method: 'POST',
        body: JSON.stringify({ sessionId, message }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send message');
    }
    const data = await res.json();
    return data.data;
};
