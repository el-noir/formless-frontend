import { API_BASE_URL } from "./config";
import axios from "axios";

export interface StartChatResponse {
    sessionId: string;
    message: string;
}

export interface ReplyChatResponse {
    message: string;
    isComplete: boolean;
    collectedData: any;
}

export async function startChat(url: string): Promise<StartChatResponse> {
    try {
        const response = await axios.post(`${API_BASE_URL}/ai/form/start`, { url }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function replyChat(sessionId: string, message: string): Promise<ReplyChatResponse> {
    try {
        const response = await axios.post(`${API_BASE_URL}/ai/form/reply`, { sessionId, message }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}
