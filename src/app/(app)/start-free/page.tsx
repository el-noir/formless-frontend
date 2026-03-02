'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { ArrowRight, Send, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSearchParams } from 'next/navigation';
import { Background } from '@/components/Background';
import { startChat, replyChat } from '@/lib/api/chat';

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
  const [collectedData, setCollectedData] = useState<any>(null);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const searchParams = useSearchParams();

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

      if (response.isComplete) {
        setIsComplete(true);
        setCollectedData(response.collectedData);
      }
    } catch (err: any) {
      setError("Failed to send message. Please try again.");
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
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
                className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-[#1C1C24] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#9A6BFF]"
              />

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#1C1C24] text-white font-semibold rounded-lg border border-white/10 hover:border-[#9A6BFF]/50 transition-colors shadow-[0_0_20px_rgba(110,139,255,0.15)] flex items-center gap-2 disabled:opacity-50"
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
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-[#15151A]/80 backdrop-blur-sm flex justify-between items-center z-10 relative">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <h2 className="text-white font-medium text-lg tracking-wide">Formless Assistant</h2>
                  <p className="text-xs text-gray-400 font-medium">Session active</p>
                </div>
              </div>
              <button
                onClick={() => { setSessionId(null); setMessages([]); setIsComplete(false); }}
                className="text-xs text-gray-300 hover:text-white transition-all px-4 py-2 border border-white/10 rounded-lg bg-[#252530]/50 hover:bg-[#252530] flex items-center gap-2"
              >
                Restart Session
              </button>
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
                      ? 'bg-gradient-to-br from-[#9A6BFF] to-[#5a76e8] text-white rounded-2xl rounded-tr-sm'
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
                    <span className="w-2 h-2 bg-[#9A6BFF]/70 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-[#9A6BFF]/70 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-2 h-2 bg-[#9A6BFF]/70 rounded-full animate-bounce [animation-delay:0.3s]"></span>
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
                <div className="mt-8 p-8 bg-gradient-to-br from-[#9A6BFF]/10 to-[#1C1C24]/50 border border-[#9A6BFF]/20 rounded-2xl text-center shadow-[0_0_40px_-10px_rgba(110,139,255,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-16 h-16 bg-[#9A6BFF]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#9A6BFF]/30">
                    <svg className="w-8 h-8 text-[#9A6BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-2xl mb-2 tracking-tight">Form Completed!</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">All required information has been successfully collected.</p>

                  {collectedData && (
                    <div className="bg-black/50 border border-white/5 rounded-xl overflow-hidden mt-4">
                      <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Captured Data</span>
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
                  className="w-full bg-[#1C1C24] text-white rounded-2xl pl-6 pr-16 py-4 md:py-5 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#9A6BFF]/50 border border-white/5 focus:border-[#9A6BFF]/50 transition-all placeholder:text-gray-500 text-base"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || sendingMsg || isComplete}
                  className="absolute right-3 p-2.5 md:p-3 bg-gradient-to-br from-brand-purple to-[#8B5CF6] text-white rounded-xl hover:shadow-[0_0_15px_theme(colors.brand.purple/40)] transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100 active:scale-95 flex items-center justify-center"
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
            <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF] mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <StartFreeContent />
    </Suspense>
  );
}
