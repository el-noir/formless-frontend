"use client";

import React, { useEffect, useRef } from 'react';
import { Background } from '@/components/Background';
import { Loader2, Sparkles } from 'lucide-react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatProgressCompact } from '@/components/chat/ChatProgress';
import { useChatSession } from '@/hooks/useChatSession';

interface ChatClientProps {
    token: string;
    isEmbed?: boolean;
}

export function ChatClient({ token, isEmbed = false }: ChatClientProps) {
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
        progressDetail,
        isSubmitting,
        activeFieldType,
        messagesEndRef,
        handleStart,
        handleSend,
    } = useChatSession(token, isEmbed);

    // In embed mode: auto-start the conversation as soon as form info is loaded.
    useEffect(() => {
        if (isEmbed && !loadingInfo && formInfo && chatState === 'IDLE') {
            handleStart();
        }
    }, [isEmbed, loadingInfo, formInfo, chatState, handleStart]);

    const aiName: string = formInfo?.aiName || 'Assistant';
    const aiAvatar: string | undefined = formInfo?.aiAvatar as string | undefined;

    /* ── Loading / Auto-starting ─────────────────────── */
    if (loadingInfo || (isEmbed && (chatState === 'IDLE' || chatState === 'STARTING'))) {
        return (
            <div className="h-[100dvh] bg-[#0B0B0F] flex flex-col">
                {/* Slim AI header for embed */}
                {isEmbed && formInfo && (
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                        <div 
                            className="w-8 h-8 rounded-full border flex items-center justify-center text-base shrink-0 overflow-hidden"
                            style={{ backgroundColor: `${formInfo.themeColor || '#10b981'}20`, borderColor: `${formInfo.themeColor || '#10b981'}30` }}
                        >
                            {aiAvatar?.startsWith('http') || aiAvatar?.startsWith('/')
                                ? <img src={aiAvatar} alt="" className="w-full h-full object-cover" />
                                : (aiAvatar ? <span className="text-base">{aiAvatar}</span> : <Sparkles className="w-4 h-4" style={{ color: formInfo.themeColor || '#10b981' }} />)
                            }
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-white leading-none">{formInfo.aiName || 'Assistant'}</p>
                            <p className="text-[10px] text-emerald-400 mt-0.5">● Online</p>
                        </div>
                    </div>
                )}
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: formInfo?.themeColor || '#10b981' }} />
                        {isEmbed && <p className="text-xs text-gray-600">Connecting...</p>}
                        {!isEmbed && <p className="text-sm text-gray-500">Loading...</p>}
                    </div>
                </div>
            </div>
        );
    }

    /* ── Error ──────────────────────────────────────── */
    if (error || !formInfo) {
        return (
            <div className="h-[100dvh] bg-[#0B0B0F] flex items-center justify-center px-6 relative">
                {!isEmbed && <Background />}
                <div className="max-w-sm w-full relative z-10 text-center">
                    <p className="text-gray-400 text-sm mb-1">This link isn't available</p>
                    <p className="text-gray-600 text-xs">{error || 'The form may be expired or inactive.'}</p>
                </div>
            </div>
        );
    }

    /* ── Standalone Welcome Screen (non-embed only) ── */
    if (!isEmbed && (chatState === 'IDLE' || chatState === 'STARTING')) {
        return (
            <div className="min-h-[100dvh] bg-[#0B0B0F] flex flex-col items-center justify-center px-5 py-12 relative">
                <Background />
                <div className="max-w-sm w-full relative z-10 flex flex-col gap-8">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">0Fill</span>
                    </div>
                    <div>
                        <div className="mb-5 flex items-center gap-3">
                            <div 
                                className="w-10 h-10 rounded-full border flex items-center justify-center text-lg shrink-0 overflow-hidden"
                                style={{ backgroundColor: `${formInfo.themeColor || '#10b981'}20`, borderColor: `${formInfo.themeColor || '#10b981'}30` }}
                            >
                                {aiAvatar?.startsWith('http') || aiAvatar?.startsWith('/')
                                    ? <img src={aiAvatar} alt="" className="w-full h-full object-cover" />
                                    : (aiAvatar ? <span className="text-base">{aiAvatar}</span> : <Sparkles className="w-5 h-5" style={{ color: formInfo.themeColor || '#10b981' }} />)
                                }
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{aiName}</p>
                                <p className="text-white text-sm font-semibold">Ready to chat</p>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2 leading-tight">{formInfo.title}</h1>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {formInfo.description || `${aiName} will guide you through ${formInfo.questionCount} questions conversationally.`}
                        </p>
                    </div>
                    <div className="flex items-center gap-5 text-sm text-gray-500">
                        <span><span className="text-white font-medium">{formInfo.questionCount}</span> questions</span>
                        <span className="text-gray-700">·</span>
                        <span>~<span className="text-white font-medium">{formInfo.estimatedMinutes}</span> min</span>
                    </div>
                    <button
                        onClick={handleStart}
                        disabled={chatState === 'STARTING'}
                        className={`w-full hover:opacity-90 disabled:opacity-50 text-white font-semibold py-3 transition-all text-sm flex items-center justify-center gap-2 ${formInfo.buttonStyle === 'rounded' ? 'rounded-xl' : 'rounded'}`}
                        style={{ backgroundColor: formInfo.themeColor || '#10b981' }}
                    >
                        {chatState === 'STARTING'
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</>
                            : 'Start Conversation'
                        }
                    </button>
                </div>
            </div>
        );
    }

    /* ── Active chat ────────────────────────────────── */
    return (
        <div className="h-[100dvh] bg-[#0B0B0F] flex flex-col relative text-white">
            {!isEmbed && <Background />}

            {/* Embed: slim top bar instead of full ChatHeader */}
            {isEmbed ? (
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 shrink-0">
                    <div 
                        className="w-8 h-8 rounded-full border flex items-center justify-center text-base shrink-0 overflow-hidden"
                        style={{ backgroundColor: `${formInfo.themeColor || '#10b981'}20`, borderColor: `${formInfo.themeColor || '#10b981'}30` }}
                    >
                        {aiAvatar?.startsWith('http') || aiAvatar?.startsWith('/')
                            ? <img src={aiAvatar} alt="" className="w-full h-full object-cover" />
                            : (aiAvatar ? <span className="text-base">{aiAvatar}</span> : <Sparkles className="w-4 h-4" style={{ color: formInfo.themeColor || '#10b981' }} />)
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white leading-none truncate">{aiName}</p>
                        <p className="text-[10px] text-emerald-400 mt-0.5">● Online</p>
                    </div>
                    {progressDetail ? (
                        <ChatProgressCompact progressDetail={progressDetail} chatState={chatState} />
                    ) : progress > 0 ? (
                        <div className="text-[10px] text-gray-500">{progress}%</div>
                    ) : null}
                </div>
            ) : (
                <ChatHeader
                    title={formInfo.title}
                    aiName={aiName}
                    chatState={chatState}
                    progress={progress}
                    progressDetail={progressDetail}
                    removeBranding={formInfo.removeBranding}
                    themeColor={formInfo.themeColor}
                />
            )}

            <MessageList
                messages={messages}
                isTyping={isTyping}
                messagesEndRef={messagesEndRef}
                aiName={aiName}
                aiAvatar={aiAvatar}
                isEmbed={isEmbed}
                themeColor={formInfo.themeColor}
            />

            <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                isSubmitting={isSubmitting}
                isTyping={isTyping}
                chatState={chatState}
                isEmbed={isEmbed}
                removeBranding={formInfo.removeBranding}
                themeColor={formInfo.themeColor}
                buttonStyle={formInfo.buttonStyle}
                activeFieldType={activeFieldType}
            />
        </div>
    );
}
