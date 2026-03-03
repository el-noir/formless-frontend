import React from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSend: (e?: React.FormEvent, msg?: string) => void;
    isSubmitting: boolean;
    isTyping: boolean;
    chatState: string;
    isEmbed?: boolean;
}

export function ChatInput({ input, setInput, handleSend, isSubmitting, isTyping, chatState, isEmbed = false }: ChatInputProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const onSend = (e?: React.FormEvent) => {
        handleSend(e);
        setTimeout(() => textareaRef.current?.focus(), 10);
    };

    return (
        <footer className="shrink-0 border-t border-gray-800/60 bg-[#0B0B0F] pb-safe relative z-10">
            <div className="max-w-2xl mx-auto px-4 py-3">
                {chatState === 'COMPLETED' ? (
                    <div className="flex items-center gap-3 bg-[#111116] border border-gray-800 rounded-xl px-4 py-3.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-white">{isEmbed ? "Got it, thanks!" : "All responses submitted"}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{isEmbed ? "We'll be in touch soon." : "You can close this tab."}</p>
                        </div>
                    </div>
                ) : chatState === 'CONFIRMING' || chatState === 'READY_TO_SUBMIT' ? (
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => handleSend(undefined, 'submit')}
                            disabled={isSubmitting || isTyping}
                            className={`w-full ${isEmbed ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-500'} disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm`}
                        >
                            {isSubmitting
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> {isEmbed ? 'Sending...' : 'Submitting...'}</>
                                : <><CheckCircle2 className="w-4 h-4" /> {isEmbed ? 'Looks good!' : 'Confirm & Submit'}</>
                            }
                        </button>
                        <button
                            onClick={() => textareaRef.current?.focus()}
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-center py-1"
                        >
                            Change an answer? Type below
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={onSend}
                        className="flex items-end gap-2 bg-[#111116] border border-gray-800 rounded-xl focus-within:border-gray-700 transition-colors px-3 pt-2.5 pb-2"
                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your response..."
                            disabled={isSubmitting || isTyping}
                            className="flex-1 max-h-28 min-h-[36px] bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none resize-none disabled:opacity-50 leading-relaxed py-0.5"
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
                            className="shrink-0 w-8 h-8 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-colors mb-0.5"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </form>
                )}
                <p className="text-center text-[10px] text-gray-700 mt-2">
                    Powered by <span className="text-gray-600">Formless</span>
                </p>
            </div>
        </footer>
    );
}
