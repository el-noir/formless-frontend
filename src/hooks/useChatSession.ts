import { useState, useEffect, useRef } from 'react';
import { getPublicFormInfo, startPublicChat, sendPublicChatMessage } from '@/lib/api/public-chat';
import { Message } from '@/components/chat/types';

interface FormInfo {
    title?: string;
    description?: string;
    questionCount?: number;
    estimatedMinutes?: number;
}

import { toast } from 'sonner';

export function useChatSession(token: string) {
    const [formInfo, setFormInfo] = useState<FormInfo | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatState, setChatState] = useState<string>('IDLE'); // IDLE, STARTING, IN_PROGRESS, COMPLETED
    const [progress, setProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleStart = async () => {
        setChatState('STARTING');
        setIsTyping(true);
        try {
            const data = await startPublicChat(token);
            setSessionId(data.sessionId);
            setChatState(data.state);
            if (data.greeting) {
                setMessages([
                    {
                        role: 'assistant',
                        content: data.greeting.content,
                        state: data.greeting.metadata?.state,
                        progress: data.greeting.metadata?.progress || 0,
                        timestamp: data.greeting.timestamp,
                    },
                ]);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to start conversation.';
            setError(msg);
            setChatState('ERROR');
            toast.error(msg);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !sessionId || isSubmitting) return;

        const userMsg = input.trim();
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

            if (result.state === 'READY_TO_SUBMIT' || result.state === 'COMPLETED') {
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
                    },
                ]);
            }

            if (result.state === 'COMPLETED') {
                toast.success("Form submitted successfully!");
                if (!result.nextMessage) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: 'assistant',
                            content: 'Done! Your form has been submitted successfully.',
                            state: 'COMPLETED',
                            timestamp: new Date().toISOString(),
                        },
                    ]);
                }
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
        isSubmitting,
        messagesEndRef,
        handleStart,
        handleSend,
    };
}
