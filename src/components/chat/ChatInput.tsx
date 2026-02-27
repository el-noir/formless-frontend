import React from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSend: (e?: React.FormEvent) => void;
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
                ) : (
                    <form
                        onSubmit={onSend}
                        className="relative flex items-end gap-2 bg-[#1A1A24] border border-gray-700 rounded-2xl focus-within:border-[#6E8BFF] focus-within:ring-1 focus-within:ring-[#6E8BFF] transition-all p-1.5 pl-4"
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
    );
}
