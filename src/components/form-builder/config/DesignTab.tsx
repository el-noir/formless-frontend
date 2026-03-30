"use client";

import React from "react";
import { Shield, Trash2, Image as ImageIcon, Palette, Square, Circle } from "lucide-react";

interface DesignTabProps {
    removeBranding: boolean;
    canRemoveBranding: boolean;
    avatar: string;
    themeColor: string;
    buttonStyle: 'rounded' | 'square';
    onBrandingChange: (enabled: boolean) => void;
    onAvatarChange: (avatar: string) => void;
    onThemeColorChange: (color: string) => void;
    onButtonStyleChange: (style: 'rounded' | 'square') => void;
}

const THEME_COLORS = [
    "#10b981", // Emerald (Default)
    "#8b5cf6", // Violet
    "#3b82f6", // Blue
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#ec4899", // Pink
];

const EMOJI_AVATARS = ["✨", "🤖", "💬", "🎯", "🧠", "⚡", "🌟", "💡"];

export function DesignTab({ 
    removeBranding, 
    canRemoveBranding,
    avatar, 
    themeColor,
    buttonStyle,
    onBrandingChange, 
    onAvatarChange,
    onThemeColorChange,
    onButtonStyleChange
}: DesignTabProps) {
    const isUrl = avatar.startsWith('http') || avatar.startsWith('/');

    return (
        <div className="space-y-8">
            {/* Whitelabeling Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-brand-purple" />
                    <h3 className="text-sm font-semibold text-white">Whitelabeling</h3>
                </div>

                {canRemoveBranding ? (
                    <div className="bg-brand-surface border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white mb-0.5">Remove 0Fill Branding</p>
                                <p className="text-[10px] text-gray-500 leading-relaxed">
                                    Hides the "Powered by 0Fill" badge and logo from your public chat interface.
                                </p>
                            </div>
                            <button
                                onClick={() => onBrandingChange(!removeBranding)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${removeBranding ? 'bg-brand-purple' : 'bg-gray-700'}`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${removeBranding ? 'translate-x-4' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-brand-surface border border-gray-800 rounded-xl p-4">
                        <p className="text-sm font-medium text-white mb-0.5">0Fill Branding Included</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            Starter plan includes a small "Powered by 0Fill" badge on public chats.
                        </p>
                    </div>
                )}

                {!canRemoveBranding && (
                    <div className="mt-3 p-3 bg-brand-purple/5 border border-brand-purple/20 rounded-lg">
                        <p className="text-[10px] text-brand-purple/80 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-brand-purple animate-pulse" />
                            Upgrade to Pro to remove branding.
                        </p>
                    </div>
                )}
            </div>

            {/* Custom Avatar Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-4 h-4 text-brand-purple" />
                    <h3 className="text-sm font-semibold text-white">Custom Chat Avatar</h3>
                </div>

                <div className="space-y-4">
                    {/* URL Input */}
                    <div>
                        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">Avatar Image URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={isUrl ? avatar : ''}
                                onChange={(e) => onAvatarChange(e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className="flex-1 bg-brand-surface border border-gray-800 rounded text-sm text-white px-3 py-2 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-700"
                            />
                            {isUrl && (
                                <button
                                    onClick={() => onAvatarChange("✨")}
                                    className="p-2 border border-gray-800 rounded hover:bg-red-500/10 hover:border-red-500/30 text-gray-500 hover:text-red-400 transition-all"
                                    title="Reset to default"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Emoji Picker Fallback */}
                    <div>
                        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">Or choose an emoji</label>
                        <div className="flex gap-2 flex-wrap">
                            {EMOJI_AVATARS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => onAvatarChange(emoji)}
                                    className={`w-9 h-9 rounded text-lg transition-all flex items-center justify-center border ${!isUrl && avatar === emoji
                                        ? "border-brand-purple bg-brand-purple/10 scale-110"
                                        : "border-gray-800 bg-brand-surface hover:border-gray-600"
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Theme Color Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-4 h-4 text-brand-purple" />
                    <h3 className="text-sm font-semibold text-white">Theme Color</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                        {THEME_COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => onThemeColorChange(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${themeColor === color ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-transparent hover:scale-105"}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        <div className="flex items-center gap-2 ml-2">
                             <input 
                                type="text"
                                value={themeColor}
                                onChange={(e) => onThemeColorChange(e.target.value)}
                                          className="w-20 bg-brand-surface border border-gray-800 rounded text-[10px] text-white px-2 py-1.5 focus:outline-none focus:border-brand-purple"
                                placeholder="#HEX"
                             />
                        </div>
                    </div>
                </div>
            </div>

            {/* Button Style Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Square className="w-4 h-4 text-brand-purple" />
                    <h3 className="text-sm font-semibold text-white">Button Style</h3>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => onButtonStyleChange('rounded')}
                        className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${buttonStyle === 'rounded' ? "border-brand-purple bg-brand-purple/10" : "border-gray-800 bg-brand-surface hover:border-gray-700"}`}
                    >
                        <div className="w-12 h-6 rounded-full bg-gray-700 border border-gray-600 flex items-center px-1">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                        </div>
                        <span className="text-[10px] text-gray-400">Pill</span>
                    </button>
                    <button
                        onClick={() => onButtonStyleChange('square')}
                        className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${buttonStyle === 'square' ? "border-brand-purple bg-brand-purple/10" : "border-gray-800 bg-brand-surface hover:border-gray-700"}`}
                    >
                        <div className="w-12 h-6 rounded bg-gray-700 border border-gray-600 flex items-center px-1">
                            <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                        </div>
                        <span className="text-[10px] text-gray-400">Modern</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
