import { apiFetch } from './apiFetch';

const BASE = `/public/chat`;

export const getPublicFormInfo = async (token: string) => {
    const res = await apiFetch(`${BASE}/${token}`);
    const data = await res.json();
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
    return data.data;
};

export const sendPublicChatMessage = async (token: string, sessionId: string, message: string) => {
    const res = await apiFetch(`${BASE}/${token}/message`, {
        method: 'POST',
        body: JSON.stringify({ sessionId, message }),
    });
    const data = await res.json();
    return data.data;
};
