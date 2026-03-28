import { apiFetch } from './apiFetch';

const BASE = `/public/chat`;

export const getPublicFormInfo = async (token: string) => {
    const res = await apiFetch(`${BASE}/${token}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data.data;
};

export const startPublicChat = async (
    token: string,
    pageContext?: { pageTitle?: string; pageUrl?: string; isEmbed?: boolean }
) => {
    const res = await apiFetch(`${BASE}/${token}/start`, {
        method: 'POST',
        body: pageContext ? JSON.stringify(pageContext) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data.data;
};

export const sendPublicChatMessage = async (token: string, sessionId: string, message: string) => {
    const res = await apiFetch(`${BASE}/${token}/message`, {
        method: 'POST',
        body: JSON.stringify({ sessionId, message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data.data;
};

/**
 * Streaming variant of sendPublicChatMessage.
 * Calls onToken() for each text delta, then onMetadata() when the stream ends.
 */
export const sendPublicChatMessageStream = async (
    token: string,
    sessionId: string,
    message: string,
    onToken: (delta: string) => void,
    onMetadata: (meta: { state: string; progress: number; isComplete: boolean; currentFieldIndex: number; totalFields: number }) => void,
): Promise<void> => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    const res = await fetch(`${apiBase}/api/public/chat/${token}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
    });

    if (!res.ok || !res.body) {
        const errText = await res.text();
        throw new Error(errText || `Stream request failed with ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last (possibly incomplete) line in the buffer
        buffer = lines.pop() ?? '';

        let currentEvent = '';
        for (const line of lines) {
            if (line.startsWith('event: ')) {
                currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
                const payload = line.slice(6).trim();
                try {
                    const parsed = JSON.parse(payload);
                    if (currentEvent === 'token' && parsed.token) {
                        onToken(parsed.token);
                    } else if (currentEvent === 'metadata') {
                        onMetadata(parsed);
                    } else if (currentEvent === 'error') {
                        throw new Error(parsed.message || 'Stream error');
                    }
                } catch (e) {
                    if (currentEvent === 'error') throw e;
                    // Ignore JSON parse errors for other events
                }
            }
        }
    }
};
