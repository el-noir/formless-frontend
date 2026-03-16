import { useState, useEffect, useRef, useCallback } from 'react';
import { getPublicFormInfo, startPublicChat, sendPublicChatMessage } from '@/lib/api/public-chat';
import { Message, ProgressDetail } from '@/components/chat/types';

interface FormInfo {
    title?: string;
    description?: string;
    questionCount?: number;
    estimatedMinutes?: number;
    aiName?: string;
    aiAvatar?: string;
    removeBranding?: boolean;
    themeColor?: string;
    buttonStyle?: 'rounded' | 'square';
}

import { toast } from 'sonner';

export function useChatSession(token: string, isEmbed: boolean = false) {
    const [formInfo, setFormInfo] = useState<FormInfo | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatState, setChatState] = useState<string>('IDLE'); // IDLE, STARTING, IN_PROGRESS, CLARIFYING, CONFIRMING, READY_TO_SUBMIT, COMPLETED, ERROR, ABANDONED
    const [progress, setProgress] = useState(0);
    const [progressDetail, setProgressDetail] = useState<ProgressDetail | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeFieldType, setActiveFieldType] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!token) return;
        setLoadingInfo(true);
        getPublicFormInfo(token)
            .then((data) => setFormInfo(data))
            .catch((err) => {
                const msg = err instanceof Error ? err.message : 'Failed to load form.';
                setError(msg);
                toast.error(msg);
            })
            .finally(() => setLoadingInfo(false));
    }, [token]);

    useEffect(() => {
        // Auto scroll to latest message
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleStart = useCallback(async () => {
        setChatState('STARTING');
        setIsTyping(true);
        try {
            // Read page context injected by widget.js via URL search params
            const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
            const pageContext = (params?.get('pageTitle') || params?.get('pageUrl') || isEmbed) ? {
                pageTitle: params?.get('pageTitle') ?? undefined,
                pageUrl: params?.get('pageUrl') ?? undefined,
                isEmbed,
            } : undefined;

            const data = await startPublicChat(token, pageContext);
            setSessionId(data.sessionId);
            setChatState(data.state);
            if (data.progressDetail) {
                setProgressDetail(data.progressDetail);
                setProgress(data.progressDetail.percentage);
            }
            if (data.greeting) {
                setMessages([
                    {
                        role: 'assistant',
                        content: data.greeting.content,
                        state: data.greeting.metadata?.state,
                        progress: data.greeting.metadata?.progress || 0,
                        timestamp: data.greeting.timestamp,
                        fieldType: data.greeting.metadata?.fieldType,
                    },
                ]);
                if (data.greeting.metadata?.fieldType) {
                    setActiveFieldType(data.greeting.metadata.fieldType);
                }
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to start conversation.';
            setError(msg);
            setChatState('ERROR');
            toast.error(msg);
        } finally {
            setIsTyping(false);
        }
    }, [token, isEmbed]);

    useEffect(() => {
        if (isEmbed && !loadingInfo && formInfo && chatState === 'IDLE') {
            handleStart();
        }
    }, [isEmbed, loadingInfo, formInfo, chatState, handleStart]);

    const handleSend = async (e?: React.FormEvent, messageOverride?: string) => {
        e?.preventDefault();
        const userMsg = (messageOverride || input).trim();
        if (!userMsg || !sessionId || isSubmitting) return;

        setInput('');
        setMessages((prev) => [
            ...prev,
            { role: 'user', content: userMsg, timestamp: new Date().toISOString() },
        ]);
        setIsSubmitting(true);
        setIsTyping(true);

        try {
            const result = await sendPublicChatMessage(token, sessionId, userMsg);
            setChatState(result.state);

            if (result.progressDetail) {
                setProgressDetail(result.progressDetail);
                setProgress(result.progressDetail.percentage);
            } else if (result.state === 'READY_TO_SUBMIT' || result.state === 'COMPLETED') {
                setProgress(100);
            } else if (result.reply?.metadata?.progress) {
                setProgress(result.reply.metadata.progress);
            }

            if (result.reply) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: result.reply.content,
                        state: result.state,
                        progress: result.reply.metadata?.progress,
                        timestamp: result.reply.timestamp,
                        fieldSummaries: result.reply.metadata?.fieldSummaries,
                        fieldType: result.reply.metadata?.fieldType,
                    },
                ]);
                if (result.reply.metadata?.fieldType) {
                    setActiveFieldType(result.reply.metadata.fieldType);
                } else {
                    setActiveFieldType(null);
                }
            }

            if (result.state === 'COMPLETED') {
                toast.success("Form submitted successfully!");
            } else if (result.state === 'ERROR') {
                toast.error(result.reply?.content || "Submission failed. Please try again.");
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to send message.';
            toast.error(msg);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `Error: ${msg}`,
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsSubmitting(false);
            setIsTyping(false);
        }
    };

    return {
        formInfo,
        loadingInfo,
        error,
        messages,
        input,
        setInput,
        isTyping,
        chatState,
        progress,
        progressDetail,
        isSubmitting,
        activeFieldType,
        messagesEndRef,
        handleStart,
        handleSend: (e?: React.FormEvent, msg?: string) => handleSend(e, msg),
    };
}
