'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { ArrowRight, Send, Loader2, RotateCcw, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Background } from '@/components/Background';
import { startChat, replyChat } from '@/lib/api/chat';
import { ChatProgress } from '@/components/chat/ChatProgress';
import { ProgressDetail, FieldProgress } from '@/components/chat/types';

type CheckFreeForm = {
  url: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

function StartFreeContent() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, string> | null>(null);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chatState, setChatState] = useState<string>('IDLE');
  const [progressDetail, setProgressDetail] = useState<ProgressDetail | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [totalFields, setTotalFields] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number>(0);
  const searchParams = useSearchParams();

  /** Build a synthetic ProgressDetail from message count when backend doesn't provide one */
  const buildSyntheticProgress = useCallback((answered: number, total: number): ProgressDetail => {
    const clamped = Math.min(answered, total);
    const percentage = total > 0 ? Math.round((clamped / total) * 100) : 0;
    const fields: FieldProgress[] = Array.from({ length: total }, (_, i) => ({
      fieldId: `field-${i}`,
      label: `Question ${i + 1}`,
      status: i < clamped ? 'completed' : i === clamped ? 'current' : 'upcoming',
      questionNumber: i + 1,
      sectionIndex: 0,
    }));
    return {
      percentage,
      answeredCount: clamped,
      totalFields: total,
      currentFieldIndex: clamped,
      fields,
      totalPages: 1,
      currentPage: 1,
    };
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckFreeForm>({
    mode: "onBlur",
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onStart = async (data: CheckFreeForm) => {
    setError("");
    setLoading(true);

    try {
      const response = await startChat(data.url);
      setSessionId(response.sessionId);
      setChatState(response.state || 'IN_PROGRESS');
      setFormTitle(response.formTitle || '');
      const total = response.totalFields ?? response.progressDetail?.totalFields ?? 0;
      setTotalFields(total);
      setAnsweredCount(0);
      if (response.progressDetail) {
        setProgressDetail(response.progressDetail);
      } else if (total > 0) {
        setProgressDetail(buildSyntheticProgress(0, total));
      }
      setMessages([{ id: Date.now().toString(), role: 'assistant', content: response.message }]);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to start conversation from the URL.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-start from query param if redirected from Hero
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam && !sessionId && !loading) {
      onStart({ url: urlParam });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionId || sendingMsg || isComplete) return;

    const userText = inputValue.trim();
    setInputValue("");
    setError("");
    setSendingMsg(true);

    // Add user message to UI immediately
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await replyChat(sessionId, userText);
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response.message };
      setMessages(prev => [...prev, assistantMsg]);

      if (response.state) {
        setChatState(response.state);
      }

      const newAnswered = answeredCount + 1;
      if (response.progressDetail) {
        setProgressDetail(response.progressDetail);
        setAnsweredCount(response.progressDetail.answeredCount);
      } else if (totalFields > 0) {
        setAnsweredCount(newAnswered);
        setProgressDetail(buildSyntheticProgress(newAnswered, totalFields));
      }

      if (response.isComplete) {
        setIsComplete(true);
        setChatState('COMPLETED');
        if (totalFields > 0 && !response.progressDetail) {
          setProgressDetail(buildSyntheticProgress(totalFields, totalFields));
        }
        setCollectedData(response.collectedData);
      }
    } catch (err: any) {
      setError("Failed to send message. Please try again.");
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleRestart = () => {
    setSessionId(null);
    setMessages([]);
    setIsComplete(false);
    setCollectedData(null);
    setChatState('IDLE');
    setProgressDetail(null);
    setFormTitle('');
    setTotalFields(0);
    setAnsweredCount(0);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] relative flex flex-col">
      <Background />

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col px-4 py-8 relative z-10">

        {!sessionId ? (
          <div className="flex-1 flex flex-col justify-center items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
              Convert Form to Conversation
            </h1>
            <p className="text-lg text-gray-400 mb-8 text-center max-w-xl">
              Enter your Google Form URL to instantly transform it into a fluid AI chat experience.
            </p>

            <form
              onSubmit={handleSubmit(onStart)}
              className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl"
            >
              <input
                type="text"
                placeholder="Enter Google Form URL"
                {...register("url", { required: "URL is required" })}
                className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-[#1C1C24] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#1C1C24] text-white font-semibold rounded-lg border border-white/10 hover:border-brand-purple/50 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting
                  </>
                ) : (
                  <>
                    Start Chat
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {errors.url && (
              <p className="text-red-500 mt-2 text-center w-full max-w-2xl text-left pl-2">
                {errors.url.message}
              </p>
            )}
            {error && (
              <p className="text-red-500 mt-4 text-center">
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-[#0B0B0F]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl ring-1 ring-white/5 mx-auto w-full max-w-4xl h-[700px] max-h-[85vh]">
            {/* Header with progress */}
            <div className="shrink-0">
              <div className="p-5 border-b border-white/10 bg-[#15151A]/80 backdrop-blur-sm flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                  <div className="min-w-0">
                    <h2 className="text-white font-medium text-lg tracking-wide truncate">
                      {formTitle || '0Fill Assistant'}
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">
                      {chatState === 'COMPLETED' ? (
                        <span className="text-emerald-400">Completed</span>
                      ) : chatState === 'ERROR' ? (
                        <span className="text-red-400">Submission failed</span>
                      ) : progressDetail ? (
                        <span>Question {progressDetail.currentFieldIndex + 1} of {progressDetail.totalFields} &middot; {progressDetail.percentage}%</span>
                      ) : (
                        <span>Session active</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRestart}
                  className="text-xs text-gray-300 hover:text-white transition-all px-4 py-2 border border-white/10 rounded-lg bg-[#252530]/50 hover:bg-[#252530] flex items-center gap-2 shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restart
                </button>
              </div>

              {/* Progress panel — always show when session is active */}
              {progressDetail && chatState !== 'COMPLETED' && (
                <ChatProgress progressDetail={progressDetail} chatState={chatState} />
              )}
              {!progressDetail && chatState !== 'COMPLETED' && chatState !== 'IDLE' && totalFields > 0 && (
                <div className="px-4 py-2 border-b border-gray-800/60 bg-[#0B0B0F]/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400">
                      Question {Math.min(answeredCount + 1, totalFields)} of {totalFields}
                    </span>
                    <span className="text-[10px] text-gray-600 tabular-nums">
                      {totalFields > 0 ? Math.round((answeredCount / totalFields) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${totalFields > 0 ? Math.round((answeredCount / totalFields) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] p-5 shadow-sm text-sm md:text-base ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-brand-purple to-[#0da372] text-white rounded-2xl rounded-tr-sm'
                      : 'bg-[#1C1C24] text-gray-100 border border-white/5 rounded-2xl rounded-tl-sm shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]'
                      }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {sendingMsg && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="bg-[#1C1C24] border border-white/5 py-4 px-5 rounded-2xl rounded-tl-sm flex gap-1.5 items-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]">
                    <span className="w-2 h-2 bg-brand-purple/70 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-brand-purple/70 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-2 h-2 bg-brand-purple/70 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center w-full animate-in fade-in duration-300">
                  <span className="inline-block text-red-400 bg-red-400/10 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm">
                    {error}
                  </span>
                </div>
              )}

              {isComplete && (
                <div className="mt-8 p-8 bg-gradient-to-br from-brand-purple/10 to-[#1C1C24]/50 border border-brand-purple/20 rounded-2xl text-center shadow-[0_0_40px_-10px_rgba(16,185,129,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                  
                  {/* Decorative background glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-brand-purple/20 blur-[100px] rounded-full pointer-events-none" />

                  <div className="w-16 h-16 bg-brand-purple/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-purple/30 relative z-10">
                    <svg className="w-8 h-8 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-2xl mb-2 tracking-tight relative z-10">Magic Complete! ✨</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto relative z-10">
                    You just experienced how much better a conversational form feels. Imagine if your clients saw this instead of a static page.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                    <Link 
                      href={`/sign-up?url=${encodeURIComponent(searchParams.get('url') || '')}`}
                      className="w-full sm:w-auto px-8 py-3.5 bg-brand-purple hover:bg-[#0da372] text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 flex items-center justify-center gap-2 group"
                    >
                      <Save className="w-4 h-4" />
                      Save & Publish this Form
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {collectedData && (
                    <div className="bg-black/50 border border-white/5 rounded-xl overflow-hidden mt-8 relative z-10">
                      <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                           Captured Data Payload
                        </span>
                      </div>
                      <div className="p-4 text-left overflow-x-auto text-sm text-gray-300 font-mono">
                        <pre>{JSON.stringify(collectedData, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 md:p-6 bg-[#0B0B0F]/90 border-t border-white/10 transition-opacity z-10 relative ${isComplete ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <form onSubmit={handleSendMessage} className="relative flex items-center max-w-3xl mx-auto w-full group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={sendingMsg || isComplete}
                  className="w-full bg-[#1C1C24] text-white rounded-2xl pl-6 pr-16 py-4 md:py-5 shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-purple/50 border border-white/5 focus:border-brand-purple/50 transition-all placeholder:text-gray-500 text-base"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || sendingMsg || isComplete}
                  className="absolute right-3 p-2.5 md:p-3 bg-gradient-to-br from-brand-purple to-[#0da372] text-white rounded-xl hover:shadow-[0_0_15px_theme(colors.brand.purple/40)] transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100 active:scale-95 flex items-center justify-center"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default function StartFreePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
          <Background />
          <div className="text-center relative z-10">
            <Loader2 className="w-8 h-8 animate-spin text-brand-purple mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <StartFreeContent />
    </Suspense>
  );
}
