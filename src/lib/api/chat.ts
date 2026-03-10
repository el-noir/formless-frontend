import { API_BASE_URL } from "./config";
import axios from "axios";
import { ProgressDetail } from "@/components/chat/types";

export interface StartChatResponse {
    sessionId: string;
    message: string;
    formTitle?: string;
    totalFields?: number;
    estimatedMinutes?: number;
    state?: string;
    progressDetail?: ProgressDetail;
}

export interface ReplyChatResponse {
    message: string;
    isComplete: boolean;
    collectedData: Record<string, string>;
    state?: string;
    progressDetail?: ProgressDetail;
    progress?: number;
}

export async function startChat(url: string): Promise<StartChatResponse> {
    const response = await axios.post(`${API_BASE_URL}/conversation/start`, { url }, {
        headers: { 'Content-Type': 'application/json' },
    });

    // Backend wraps: { success, data: { sessionId, message, progressDetail, ... } }
    const payload = response.data?.data ?? response.data;

    const progressDetail: ProgressDetail | undefined =
        payload.progressDetail
        ?? payload.greeting?.metadata?.progressDetail
        ?? undefined;

    return {
        sessionId: payload.sessionId,
        message: payload.message ?? payload.greeting?.content ?? '',
        formTitle: payload.formTitle,
        totalFields: payload.totalFields ?? progressDetail?.totalFields,
        estimatedMinutes: payload.estimatedMinutes,
        state: payload.state,
        progressDetail,
    };
}

export async function replyChat(sessionId: string, message: string): Promise<ReplyChatResponse> {
    const response = await axios.post(
        `${API_BASE_URL}/conversation/${sessionId}/message`,
        { message },
        { headers: { 'Content-Type': 'application/json' } },
    );

    // Backend wraps: { success, data: { reply, state, progressDetail, isComplete, ... } }
    const payload = response.data?.data ?? response.data;

    const progressDetail: ProgressDetail | undefined =
        payload.progressDetail
        ?? payload.reply?.metadata?.progressDetail
        ?? undefined;

    return {
        message: payload.message ?? payload.reply?.content ?? '',
        isComplete: payload.isComplete ?? (payload.state === 'COMPLETED'),
        collectedData: payload.collectedData ?? payload.reply?.metadata?.collectedData ?? {},
        state: payload.state,
        progressDetail,
        progress: payload.progress ?? payload.reply?.metadata?.progress,
    };
}
