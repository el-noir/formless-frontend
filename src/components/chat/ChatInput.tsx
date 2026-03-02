import React from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSend: (e?: React.FormEvent, msg?: string) => void;
    isSubmitting: boolean;
    isTyping: boolean;
    chatState: string;
}

export function ChatInput({
    input,
    setInput,
    handleSend,
    isSubmitting,
    isTyping,
    chatState,
}: ChatInputProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const onSend = (e?: React.FormEvent) => {
        handleSend(e);
        // Focus back after a short delay to allow state updates
        setTimeout(() => textareaRef.current?.focus(), 10);
    };

    return (
        <footer className="relative z-10 p-4 border-t border-gray-800 bg-[#0B0B0F]/90 backdrop-blur-md pb-safe">
            <div className="max-w-3xl mx-auto w-full">
                {chatState === 'COMPLETED' ? (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center justify-center gap-3">
                        <CheckCircle className="w-6 h-6" />
                        <p className="font-semibold">Form submitted successfully. You can close this window.</p>
                    </div>
                ) : chatState === 'CONFIRMING' || chatState === 'READY_TO_SUBMIT' ? (
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => handleSend(undefined, 'submit')}
                            disabled={isSubmitting || isTyping}
                            className="w-full bg-[#9A6BFF] hover:bg-[#5a72e0] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group animate-in fade-in slide-in-from-bottom-2 duration-300"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <span>Submit Final Response</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => textareaRef.current?.focus()}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Or type something to change an answer
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={onSend}
                        className="relative flex items-end gap-2 bg-[#1A1A24] border border-gray-700 rounded-2xl focus-within:border-[#9A6BFF] focus-within:ring-1 focus-within:ring-[#9A6BFF] transition-all p-1.5 pl-4"
                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your response..."
                            disabled={isSubmitting || isTyping}
                            className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none text-white focus:outline-none focus:ring-0 resize-none py-3 disabled:opacity-50"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onSend();
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isSubmitting || isTyping}
                            className="shrink-0 w-11 h-11 bg-[#9A6BFF] hover:bg-[#5a72e0] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-[#9A6BFF]"
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
    );
}
