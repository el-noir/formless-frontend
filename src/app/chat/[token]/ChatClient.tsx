"use client";

import React from 'react';
import { Background } from '@/components/Background';
import { Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatSession } from '@/hooks/useChatSession';

interface ChatClientProps {
    token: string;
}

export function ChatClient({ token }: ChatClientProps) {
    const {
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
    } = useChatSession(token);

    if (loadingInfo) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
                <Background />
                <div className="text-center relative z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF] mx-auto mb-4" />
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
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/10 to-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-brand-purple" />
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
                        className="w-full bg-[#9A6BFF] hover:bg-[#5a72e0] text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

            <ChatHeader
                title={formInfo.title}
                chatState={chatState}
                progress={progress}
            />

            <MessageList
                messages={messages}
                isTyping={isTyping}
                messagesEndRef={messagesEndRef}
            />

            <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                isSubmitting={isSubmitting}
                isTyping={isTyping}
                chatState={chatState}
            />
        </div>
    );
}
