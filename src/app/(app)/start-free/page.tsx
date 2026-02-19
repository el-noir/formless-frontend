'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Send, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navbar } from '@/components/Navbar';
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

function StartFreePage() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [collectedData, setCollectedData] = useState<any>(null);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [inputValue, setInputValue] = useState("");

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
      <Navbar />

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
                className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-[#1C1C24] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]"
              />

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#1C1C24] text-white font-semibold rounded-lg border border-white/10 hover:border-[#6E8BFF]/50 transition-colors shadow-[0_0_20px_rgba(110,139,255,0.15)] flex items-center gap-2 disabled:opacity-50"
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
          <div className="flex-1 flex flex-col bg-[#1C1C24]/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#15151A] flex justify-between items-center">
              <div>
                <h2 className="text-white font-semibold">Formless AI Chat</h2>
                <p className="text-xs text-gray-400">Session active</p>
              </div>
              <button
                onClick={() => { setSessionId(null); setMessages([]); setIsComplete(false); }}
                className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1 border border-white/10 rounded-md bg-[#252530]"
              >
                Restart
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                      ? 'bg-[#6E8BFF] text-white rounded-br-sm'
                      : 'bg-[#252530] text-gray-200 border border-white/5 rounded-bl-sm'
                      }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {sendingMsg && (
                <div className="flex justify-start">
                  <div className="bg-[#252530] border border-white/5 p-4 rounded-2xl rounded-bl-sm flex gap-2 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center">
                  <span className="text-red-500 bg-red-500/10 px-4 py-2 rounded-lg text-sm">{error}</span>
                </div>
              )}

              {isComplete && (
                <div className="mt-8 p-6 bg-[#6E8BFF]/10 border border-[#6E8BFF]/30 rounded-xl text-center">
                  <h3 className="text-[#6E8BFF] font-semibold text-xl mb-2">Form Completed Successfully!</h3>
                  <p className="text-gray-300 mb-4">You have answered all required questions.</p>
                  <div className="text-left bg-black/40 p-4 rounded-lg overflow-auto text-sm text-gray-300">
                    <pre>{JSON.stringify(collectedData, null, 2)}</pre>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 bg-[#15151A] border-t border-white/10 transition-opacity ${isComplete ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer..."
                  disabled={sendingMsg || isComplete}
                  className="w-full bg-[#252530] text-white rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-[#6E8BFF] border border-transparent focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || sendingMsg || isComplete}
                  className="absolute right-2 p-2 bg-[#6E8BFF] text-white rounded-full hover:bg-[#5a76e8] transition-colors disabled:opacity-50 disabled:hover:bg-[#6E8BFF]"
                >
                  <Send className="w-5 h-5 ml-[2px]" />
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default StartFreePage;
