import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ChatHeaderProps {
    title?: string;
    chatState: string;
    progress: number;
}

export function ChatHeader({ title, chatState, progress }: ChatHeaderProps) {
    return (
        <>
            <header className="relative z-10 p-4 border-b border-gray-800 bg-[#0B0B0F]/80 backdrop-blur-md flex justify-between items-center sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6E8BFF] to-[#9A6BFF] flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-sm line-clamp-1">{title}</h1>
                        <p className="text-xs text-green-400">
                            {chatState === 'COMPLETED' ? 'Completed' : 'AI Agent Online'}
                        </p>
                    </div>
                </div>
                {chatState !== 'COMPLETED' && (
                    <div className="text-xs font-medium text-gray-500 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
                        {progress}% Done
                    </div>
                )}
            </header>

            {/* Progress Bar */}
            {chatState !== 'COMPLETED' && (
                <div className="relative z-10 h-1 bg-gray-900 w-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#6E8BFF] to-[#9A6BFF] transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </>
    );
}
