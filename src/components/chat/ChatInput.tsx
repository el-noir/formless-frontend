import React from 'react';
import { Send, CheckCircle2, Loader2, AlertCircle, RotateCcw, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSend: (e?: React.FormEvent, msg?: string) => void;
    isSubmitting: boolean;
    isTyping: boolean;
    chatState: string;
    isEmbed?: boolean;
    removeBranding?: boolean;
    themeColor?: string;
    buttonStyle?: 'rounded' | 'square';
    activeFieldType?: string | null;
}

export function ChatInput({ 
    input, 
    setInput, 
    handleSend, 
    isSubmitting, 
    isTyping, 
    chatState, 
    isEmbed = false, 
    removeBranding,
    themeColor = "#10b981",
    buttonStyle = "rounded",
    activeFieldType = null
}: ChatInputProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState(false);

    const onSend = (e?: React.FormEvent) => {
        handleSend(e);
        setTimeout(() => textareaRef.current?.focus(), 10);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const res = await fetch(`${apiUrl}/storage/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            
            // Send the file URL as a hidden message
            handleSend(undefined, data.url);
            toast.success('File uploaded successfully');
        } catch (err) {
            toast.error('Failed to upload file');
            console.error(err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <footer className="shrink-0 border-t border-gray-800/60 bg-[#0B0B0F] pb-safe relative z-10">
            <div className="max-w-2xl mx-auto px-4 py-3">
                {chatState === 'COMPLETED' ? (
                    <div className="flex items-center gap-3 bg-[#111116] border border-gray-800 rounded-xl px-4 py-3.5">
                        <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: themeColor }} />
                        <div>
                            <p className="text-sm font-medium text-white">{isEmbed ? "Got it, thanks!" : "All responses submitted"}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{isEmbed ? "We'll be in touch soon." : "You can close this tab."}</p>
                        </div>
                    </div>
                ) : chatState === 'ERROR' ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                            <p className="text-sm text-red-300/80 flex-1">Submission failed — see the message above for details.</p>
                        </div>
                        <button
                            onClick={() => handleSend(undefined, 'retry')}
                            disabled={isSubmitting || isTyping}
                            className={`w-full hover:opacity-90 disabled:opacity-50 text-white font-semibold py-3 px-6 transition-all flex items-center justify-center gap-2 text-sm ${buttonStyle === 'rounded' ? 'rounded-xl' : 'rounded'}`}
                            style={{ backgroundColor: themeColor }}
                        >
                            {isSubmitting
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Retrying...</>
                                : <><RotateCcw className="w-4 h-4" /> Try Again</>
                            }
                        </button>
                    </div>
                ) : chatState === 'CONFIRMING' || chatState === 'READY_TO_SUBMIT' ? (
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => handleSend(undefined, 'submit')}
                            disabled={isSubmitting || isTyping}
                            className={`w-full hover:opacity-90 disabled:opacity-50 text-white font-semibold py-3 px-6 transition-all flex items-center justify-center gap-2 text-sm ${buttonStyle === 'rounded' ? 'rounded-xl' : 'rounded'}`}
                            style={{ backgroundColor: themeColor }}
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
                        
                        {(activeFieldType === 'FILE_UPLOAD' || activeFieldType === 'FILE') && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    disabled={isSubmitting || isTyping || isUploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="shrink-0 w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-all mb-0.5 text-gray-400 disabled:opacity-30"
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Paperclip className="w-4 h-4" />
                                    )}
                                </button>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={!input.trim() || isSubmitting || isTyping || isUploading}
                            className={`shrink-0 w-8 h-8 hover:opacity-90 disabled:opacity-30 text-white flex items-center justify-center transition-all mb-0.5 ${buttonStyle === 'rounded' ? 'rounded-lg' : 'rounded'}`}
                            style={{ backgroundColor: themeColor }}
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </form>
                )}
                {!removeBranding && (
                    <p className="text-center text-[10px] text-gray-700 mt-2">
                        Powered by <span className="text-gray-600">0Fill</span>
                    </p>
                )}
            </div>
        </footer>
    );
}
