import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Message } from './types';
import { Sparkles } from 'lucide-react';

interface MessageItemProps {
    message: Message;
    aiName?: string;
    aiAvatar?: string;
    isEmbed?: boolean;
    themeColor?: string;
}

const isImageUrl = (url: string) => {
    return typeof url === 'string' && url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;
};

const isFileUrl = (url: string) => {
    return typeof url === 'string' && url.startsWith('http') && (url.includes('/uploads/') || url.match(/\.[a-z0-9]{2,5}$/i));
};

const getFileName = (url: string) => {
    try {
        const parts = url.split('/');
        return parts[parts.length - 1];
    } catch {
        return 'file';
    }
};

export function MessageItem({ message, aiName, aiAvatar, isEmbed = false, themeColor = "#10b981" }: MessageItemProps) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            <div className="shrink-0 pt-0.5">
                {isUser ? (
                    <div className="w-7 h-7 rounded-full bg-gray-700/50 border border-white/5 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-gray-300">You</span>
                    </div>
                ) : (
                    <div 
                        className="w-7 h-7 rounded-full border flex items-center justify-center text-sm leading-none overflow-hidden shrink-0"
                        style={{ backgroundColor: `${themeColor}20`, borderColor: `${themeColor}30` }}
                    >
                        {aiAvatar?.startsWith('http') || aiAvatar?.startsWith('/')
                            ? <img src={aiAvatar} alt="" className="w-full h-full object-cover" />
                            : (aiAvatar ? <span className="text-base">{aiAvatar}</span> : <Sparkles className="w-3.5 h-3.5" style={{ color: themeColor }} />)
                        }
                    </div>
                )}
            </div>

            <div className={cn('flex flex-col gap-1 max-w-[80%] md:max-w-[70%]', isUser && 'items-end')}>
                {/* Sender */}
                <span className="text-[11px] text-gray-500 font-medium px-1">
                    {isUser ? 'You' : (aiName || 'Assistant')}
                </span>

                {/* Bubble */}
                <div className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed relative overflow-hidden',
                    isUser
                        ? 'text-white rounded-tr-none shadow-lg'
                        : 'bg-[#111116] border border-gray-800 text-gray-200 rounded-tl-none'
                )}
                style={isUser ? { backgroundColor: themeColor } : {}}
                >
                    {isUser ? (
                        <>
                            {isFileUrl(message.content) ? (
                                <div className="flex flex-col gap-2 min-w-[120px]">
                                    {isImageUrl(message.content) ? (
                                        <div className="rounded-lg overflow-hidden border border-white/10 bg-black/20">
                                            <img 
                                                src={message.content} 
                                                alt="Uploaded file" 
                                                className="max-w-full h-auto max-h-60 object-contain mx-auto"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-white/10">
                                            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                                                <span className="text-[10px] font-bold">FILE</span>
                                            </div>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="text-[11px] font-medium truncate opacity-90">{getFileName(message.content)}</p>
                                                <p className="text-[9px] opacity-60 uppercase font-bold tracking-wider">File Attachment</p>
                                            </div>
                                        </div>
                                    )}
                                    <a 
                                        href={message.content} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] underline opacity-70 hover:opacity-100 transition-opacity self-start"
                                    >
                                        View full size
                                    </a>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            )}
                        </>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed prose-a:text-emerald-400 prose-strong:text-white">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Answer summary */}
                {message.fieldSummaries && message.fieldSummaries.length > 0 && (
                    <div className="w-full mt-1 rounded-xl border border-gray-800 overflow-hidden bg-[#0f0f14]">
                        {!isEmbed && (
                            <div className="px-3 py-2 border-b border-gray-800 bg-[#111116]">
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Summary</span>
                            </div>
                        )}
                        <div className={cn("divide-y divide-gray-800/60", isEmbed && "mt-1")}>
                            {message.fieldSummaries.map((s, idx) => (
                                <div key={s.fieldId || idx} className="flex items-baseline justify-between px-3 py-2.5 gap-4">
                                    <span className="text-[12px] text-gray-400 shrink-0 max-w-[45%] leading-snug">{s.label}</span>
                                    <span className="text-[12px] text-gray-200 text-right leading-snug">
                                        {Array.isArray(s.value) ? s.value.join(', ') : s.value || '—'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
