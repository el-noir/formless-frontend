"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Background } from '@/components/Background';
import { Loader2, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { getPublicFormInfo, startPublicChat, sendPublicChatMessage } from '@/lib/api/public-chat';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    progress?: number;
    state?: string;
    timestamp?: string;
};

export default function PublicChatPage() {
    const params = useParams();
    const token = params.token as string;

    const [formInfo, setFormInfo] = useState<{ title?: string; description?: string; questionCount?: number; estimatedMinutes?: number } | null>(null);
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
            .then(data => setFormInfo(data))
            .catch(err => setError(err.message || 'Failed to load form.'))
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
                setMessages([{
                    role: 'assistant',
                    content: data.greeting.content,
                    state: data.greeting.metadata?.state,
                    progress: data.greeting.metadata?.progress || 0,
                    timestamp: data.greeting.timestamp
                }]);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to start conversation.";
            setError(msg);
            setChatState('ERROR');
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !sessionId || isSubmitting) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date().toISOString() }]);
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
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: result.reply.content,
                    state: result.state,
                    progress: result.reply.metadata?.progress,
                    timestamp: result.reply.timestamp
                }]);
            }

            // Immediately handle final confirmation flow if needed (depends on BE returning final message with COMPLETED state)
            if (result.state === 'COMPLETED' && !result.nextMessage) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Done! Your form has been submitted successfully.',
                    state: 'COMPLETED',
                    timestamp: new Date().toISOString()
                }]);
            }

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to send message.";
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${msg}`,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsSubmitting(false);
            setIsTyping(false);
        }
    };

    if (loadingInfo) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
                <Background />
                <div className="text-center relative z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6E8BFF] mx-auto mb-4" />
                    <p className="text-gray-400">Loading form...</p>
                </div>
            </div>
        );
    }

    if (error || !formInfo) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] pt-24 px-6 relative">
                <Background />
                <div className="max-w-md mx-auto relative z-10 bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center">
                    <h2 className="text-lg font-bold mb-2">Error Loading form</h2>
                    <p>{error || "Form not found or inactive."}</p>
                </div>
            </div>
        );
    }

    if (chatState === 'IDLE' || chatState === 'STARTING') {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center relative p-6">
                <Background />
                <div className="max-w-md w-full relative z-10 bg-[#0f0f14] border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#6E8BFF]/10 to-[#9A6BFF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-8 h-8 text-[#6E8BFF]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{formInfo.title}</h1>
                    <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                        {formInfo.description || "You've been invited to complete this form via AI chat. The AI will ask you questions to collect your responses."}
                    </p>

                    <div className="bg-black/30 border border-gray-800 rounded-xl p-4 mb-8 flex justify-around text-sm text-gray-400">
                        <div className="text-center">
                            <span className="block font-semibold text-white mb-1">{formInfo.questionCount}</span>
                            Questions
                        </div>
                        <div className="text-center">
                            <span className="block font-semibold text-white mb-1">~{formInfo.estimatedMinutes} min</span>
                            Estimate
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={chatState === 'STARTING'}
                        className="w-full bg-[#6E8BFF] hover:bg-[#5a72e0] text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {chatState === 'STARTING' ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {chatState === 'STARTING' ? 'Starting...' : 'Start Conversation'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[#0B0B0F] flex flex-col relative text-white">
            <Background />

            {/* Header */}
            <header className="relative z-10 p-4 border-b border-gray-800 bg-[#0B0B0F]/80 backdrop-blur-md flex justify-between items-center sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6E8BFF] to-[#9A6BFF] flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-sm line-clamp-1">{formInfo.title}</h1>
                        <p className="text-xs text-green-400">
                            {chatState === 'COMPLETED' ? 'Completed' : 'AI Agent Online'}
                        </p>
                    </div>
                </div>
                {chatState !== 'COMPLETED' && (
                    <div className="text-xs font-medium text-gray-500 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
                        {progress}% Done
                    </div>
                )}
            </header>

            {/* Progress Bar */}
            {chatState !== 'COMPLETED' && (
                <div className="relative z-10 h-1 bg-gray-900 w-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#6E8BFF] to-[#9A6BFF] transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Chat Area */}
            <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <div className="max-w-3xl mx-auto space-y-6 w-full">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn(
                            "flex w-full",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}>
                            <div className={cn(
                                "max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5",
                                msg.role === 'user'
                                    ? "bg-[#6E8BFF] text-white rounded-br-sm"
                                    : "bg-[#1A1A24] border border-gray-800 text-gray-100 rounded-bl-sm"
                            )}>
                                {msg.role === 'assistant' ? (
                                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-a:text-[#6E8BFF]">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                )}
                                {msg.timestamp && (
                                    <p className={cn(
                                        "text-[10px] mt-2 text-right",
                                        msg.role === 'user' ? "text-white/60" : "text-gray-500"
                                    )}>
                                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start w-full">
                            <div className="bg-[#1A1A24] border border-gray-800 rounded-2xl rounded-bl-sm px-5 py-4 max-w-[85%]">
                                <div className="flex gap-1.5 items-center">
                                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </main>

            {/* Input Area */}
            <footer className="relative z-10 p-4 border-t border-gray-800 bg-[#0B0B0F]/90 backdrop-blur-md pb-safe">
                <div className="max-w-3xl mx-auto w-full">
                    {chatState === 'COMPLETED' ? (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center justify-center gap-3">
                            <CheckCircle className="w-6 h-6" />
                            <p className="font-semibold">Form submitted successfully. You can close this window.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-[#1A1A24] border border-gray-700 rounded-2xl focus-within:border-[#6E8BFF] focus-within:ring-1 focus-within:ring-[#6E8BFF] transition-all p-1.5 pl-4">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your response..."
                                disabled={isSubmitting || isTyping}
                                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none text-white focus:outline-none focus:ring-0 resize-none py-3 disabled:opacity-50"
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isSubmitting || isTyping}
                                className="shrink-0 w-11 h-11 bg-[#6E8BFF] hover:bg-[#5a72e0] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-[#6E8BFF]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5 ml-1" />
                                )}
                            </button>
                        </form>
                    )}
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-gray-600">Powered by Formless AI</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
