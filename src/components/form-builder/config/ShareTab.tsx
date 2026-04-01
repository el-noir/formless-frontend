"use client";

import React, { useState, useEffect } from "react";
import { Check, Copy, ExternalLink, Link2, QrCode, CalendarClock, X, Loader2, Code2, Globe, Clock3 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { getEmbedSnippets, saveChatConfig, setLinkExpiry } from "@/lib/api/organizations";
import type { EmbedMode } from "@/app/types/Form";
import { toast } from "sonner";

interface ShareTabProps {
    chatLink: string | null;
    formTitle: string;
    onPublish: () => void;
    isPublishing: boolean;
    orgId: string;
    formId: string;
    initialExpiresAt?: string | null;  // ISO string from form.chatLinkExpiresAt
    initialAllowedDomains?: string[];
    initialEmbedMode?: EmbedMode;
    initialEmbedPosition?: 'bottom-right' | 'bottom-left';
    initialEmbedAutoOpenDelayMs?: number;
    initialEmbedThemeInherit?: boolean;
}

export function ShareTab({
    chatLink,
    formTitle,
    onPublish,
    isPublishing,
    orgId,
    formId,
    initialExpiresAt,
    initialAllowedDomains,
    initialEmbedMode,
    initialEmbedPosition,
    initialEmbedAutoOpenDelayMs,
    initialEmbedThemeInherit,
}: ShareTabProps) {
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);

    // Expiry state
    const [expiryEnabled, setExpiryEnabled] = useState(!!initialExpiresAt);
    const [expiryDate, setExpiryDate] = useState(
        initialExpiresAt ? format(new Date(initialExpiresAt), "yyyy-MM-dd") : ""
    );
    const [expirySaving, setExpirySaving] = useState(false);
    const [expirySaved, setExpirySaved] = useState(false);

    // Embed settings (A3.2)
    const [embedMode, setEmbedMode] = useState<EmbedMode>(initialEmbedMode ?? "floating_bubble");
    const [embedPosition, setEmbedPosition] = useState<"bottom-right" | "bottom-left">(initialEmbedPosition ?? "bottom-right");
    const [autoOpenDelayMs, setAutoOpenDelayMs] = useState(initialEmbedAutoOpenDelayMs ?? 5000);
    const [themeInherit, setThemeInherit] = useState(initialEmbedThemeInherit ?? true);
    const [embedSnippet, setEmbedSnippet] = useState("");
    const [snippetLoading, setSnippetLoading] = useState(false);
    const [snippetCopied, setSnippetCopied] = useState(false);
    const [embedSettingsSaving, setEmbedSettingsSaving] = useState(false);

    // Allowed domains editor
    const [allowedDomainsRaw, setAllowedDomainsRaw] = useState((initialAllowedDomains ?? []).join("\n"));
    const [domainsSaving, setDomainsSaving] = useState(false);

    // When the toggle is turned on, default to 30 days from now
    const handleToggleExpiry = (enabled: boolean) => {
        setExpiryEnabled(enabled);
        if (enabled && !expiryDate) {
            const d = new Date();
            d.setDate(d.getDate() + 30);
            setExpiryDate(format(d, "yyyy-MM-dd"));
        }
    };

    const handleSaveExpiry = async () => {
        setExpirySaving(true);
        try {
            const iso = expiryEnabled && expiryDate ? new Date(expiryDate).toISOString() : null;
            await setLinkExpiry(orgId, formId, iso);
            setExpirySaved(true);
            setTimeout(() => setExpirySaved(false), 2000);
        } catch (e: any) {
            toast.error(e.message || "Failed to save expiry");
        } finally {
            setExpirySaving(false);
        }
    };

    const handleCopy = () => {
        if (!chatLink) return;
        navigator.clipboard.writeText(chatLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopySnippet = () => {
        if (!embedSnippet) return;
        navigator.clipboard.writeText(embedSnippet);
        setSnippetCopied(true);
        setTimeout(() => setSnippetCopied(false), 2000);
    };

    const parseAllowedDomains = () => {
        return allowedDomainsRaw
            .split(/\n|,/) 
            .map((d) => d.trim())
            .filter(Boolean);
    };

    const handleSaveAllowedDomains = async () => {
        setDomainsSaving(true);
        try {
            const allowedDomains = parseAllowedDomains();
            await saveChatConfig(orgId, formId, { allowedDomains });
            toast.success("Allowed domains saved");
        } catch (e: any) {
            toast.error(e.message || "Failed to save allowed domains");
        } finally {
            setDomainsSaving(false);
        }
    };

    const handleSaveEmbedSettings = async () => {
        setEmbedSettingsSaving(true);
        try {
            await saveChatConfig(orgId, formId, {
                embedMode,
                embedPosition,
                embedAutoOpenDelayMs: autoOpenDelayMs,
                embedThemeInherit: themeInherit,
            });
            toast.success("Embed settings saved");
        } catch (e: any) {
            toast.error(e.message || "Failed to save embed settings");
        } finally {
            setEmbedSettingsSaving(false);
        }
    };

    useEffect(() => {
        if (!chatLink) {
            setEmbedSnippet("");
            return;
        }

        setSnippetLoading(true);
        getEmbedSnippets(orgId, formId, {
            mode: embedMode,
            position: embedPosition,
            autoOpenDelayMs,
            themeInherit,
        })
            .then((data) => setEmbedSnippet(data.snippets[embedMode]))
            .catch((e: any) => {
                setEmbedSnippet("");
                toast.error(e.message || "Failed to generate embed snippet");
            })
            .finally(() => setSnippetLoading(false));
    }, [chatLink, orgId, formId, embedMode, embedPosition, autoOpenDelayMs, themeInherit]);

    const expiryIsInPast = expiryEnabled && expiryDate && isPast(new Date(expiryDate));

    return (
        <div className="space-y-5">
            {!chatLink ? (
                <div className="border border-dashed border-gray-800 rounded p-6 text-center">
                    <div className="w-10 h-10 bg-[#1C1C22] border border-gray-800 rounded-md flex items-center justify-center mx-auto mb-3">
                        <Link2 className="w-4 h-4 text-gray-500" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-200 mb-1">Not published yet</h3>
                    <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                        Configure your AI persona and welcome message, then publish to get a shareable link.
                    </p>
                    <button
                        onClick={onPublish}
                        disabled={isPublishing}
                        className="inline-flex items-center gap-2 bg-brand-purple hover:bg-[#0da372] disabled:opacity-60 text-white text-xs font-medium px-4 py-2 rounded transition-colors"
                    >
                        {isPublishing ? (
                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Link2 className="w-3 h-3" />
                        )}
                        {isPublishing ? "Generating..." : "Publish & Get Link"}
                    </button>
                </div>
            ) : (
                <>
                    {/* Published banner */}
                    <div className="bg-green-500/5 border border-green-500/20 rounded p-3 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-green-400" />
                        </div>
                        <p className="text-xs text-green-400">Live — ready to share.</p>
                    </div>

                    {/* Chat link */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-2">Chat Link</label>
                        <div className="flex gap-1.5">
                            <input
                                type="text"
                                readOnly
                                value={chatLink}
                                className="flex-1 bg-brand-surface border border-gray-800 rounded px-3 py-2 text-xs text-gray-300 focus:outline-none min-w-0"
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                            <button
                                onClick={handleCopy}
                                title="Copy link"
                                className={`flex items-center gap-1 px-2.5 py-2 rounded text-xs font-medium border transition-all ${copied
                                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                                    : "bg-brand-surface border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                                    }`}
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <a
                                href={chatLink}
                                target="_blank"
                                rel="noreferrer"
                                title="Open in new tab"
                                className="flex items-center px-2.5 py-2 bg-brand-surface border border-gray-800 text-gray-400 hover:text-white rounded text-xs transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                                onClick={() => setShowQR((v) => !v)}
                                title="Show QR code"
                                className={`flex items-center px-2.5 py-2 rounded border text-xs transition-colors ${showQR
                                    ? "bg-brand-purple/10 border-brand-purple/30 text-brand-purple"
                                    : "bg-brand-surface border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                                    }`}
                            >
                                <QrCode className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* QR Code panel */}
                    {showQR && (
                        <div className="bg-brand-surface border border-gray-800 rounded-lg p-4 flex flex-col items-center gap-3">
                            <div className="bg-white p-3 rounded-lg">
                                <QRCodeSVG
                                    value={chatLink}
                                    size={148}
                                    bgColor="#ffffff"
                                    fgColor="#0B0B0F"
                                    level="M"
                                    includeMargin={false}
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 text-center max-w-45">
                                Scan to open <span className="text-gray-300 font-medium">{formTitle}</span>'s AI chat
                            </p>
                            <button
                                onClick={() => {
                                    const svg = document.querySelector('.qr-code-svg') as SVGElement;
                                    const canvas = document.createElement("canvas");
                                    canvas.width = 180; canvas.height = 180;
                                    const ctx = canvas.getContext("2d");
                                    const img = new Image();
                                    const svgBlob = new Blob([document.querySelector('[data-qr]')?.outerHTML ?? ''], { type: 'image/svg+xml' });
                                    canvas.toBlob((blob) => {
                                        if (!blob) return;
                                        const a = document.createElement('a');
                                        a.href = URL.createObjectURL(blob);
                                        a.download = `${formTitle}-qr.png`;
                                        a.click();
                                    });
                                }}
                                className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
                            >
                                Print / Save QR
                            </button>
                        </div>
                    )}

                    {/* Link Expiry Toggle */}
                    <div className="bg-[#0f0f14] border border-gray-800 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CalendarClock className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-xs font-medium text-gray-300">Link Expiry</span>
                            </div>
                            {/* Toggle */}
                            <button
                                role="switch"
                                aria-checked={expiryEnabled}
                                onClick={() => handleToggleExpiry(!expiryEnabled)}
                                className={`relative w-9 h-5 rounded-full transition-colors ${expiryEnabled ? "bg-brand-purple" : "bg-gray-800"
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${expiryEnabled ? "translate-x-4" : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>

                        {expiryEnabled && (
                            <div className="space-y-2">
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    className="w-full bg-brand-surface border border-gray-800 rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-purple transition-colors"
                                />
                                {expiryIsInPast && (
                                    <p className="text-[10px] text-red-400 flex items-center gap-1">
                                        <X className="w-3 h-3" /> This date is in the past — link is already expired
                                    </p>
                                )}
                                {expiryDate && !expiryIsInPast && (
                                    <p className="text-[10px] text-gray-500">
                                        Link expires {formatDistanceToNow(new Date(expiryDate), { addSuffix: true })}
                                    </p>
                                )}
                                <button
                                    onClick={handleSaveExpiry}
                                    disabled={expirySaving || !expiryDate}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-all disabled:opacity-50 bg-brand-surface border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white"
                                >
                                    {expirySaving ? (
                                        <><Loader2 className="w-3 h-3 animate-spin" /> Saving</>
                                    ) : expirySaved ? (
                                        <><Check className="w-3 h-3 text-green-400" /> Saved</>
                                    ) : (
                                        "Set Expiry"
                                    )}
                                </button>
                            </div>
                        )}

                        {!expiryEnabled && (
                            <p className="text-[10px] text-gray-600">Link is permanent — no expiry</p>
                        )}

                        {expiryEnabled && !expiryDate && (
                            <p className="text-[10px] text-gray-600">Toggle on to set a date</p>
                        )}
                    </div>

                    {/* Embed (A3.2) */}
                    <div className="bg-[#0f0f14] border border-gray-800 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Code2 className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs font-medium text-gray-300">Embed</span>
                        </div>

                        {/* Mode picker */}
                        <div>
                            <label className="block text-[10px] font-medium text-gray-400 mb-1.5">Mode</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                                {([
                                    { value: "inline_iframe", label: "Inline" },
                                    { value: "popup_launcher", label: "Popup" },
                                    { value: "floating_bubble", label: "Bubble" },
                                ] as const).map((m) => (
                                    <button
                                        key={m.value}
                                        onClick={() => setEmbedMode(m.value)}
                                        className={`text-xs px-2.5 py-2 rounded border transition-colors ${
                                            embedMode === m.value
                                                ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                                                : "border-gray-800 bg-brand-surface text-gray-400 hover:text-gray-200"
                                        }`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {embedMode !== "inline_iframe" && (
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1.5">Position</label>
                                    <select
                                        value={embedPosition}
                                        onChange={(e) => setEmbedPosition(e.target.value as "bottom-right" | "bottom-left")}
                                        className="w-full bg-brand-surface border border-gray-800 rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-purple"
                                    >
                                        <option value="bottom-right">Bottom Right</option>
                                        <option value="bottom-left">Bottom Left</option>
                                    </select>
                                </div>
                            )}

                            {embedMode === "floating_bubble" && (
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1.5">Auto-open delay (ms)</label>
                                    <div className="relative">
                                        <Clock3 className="w-3 h-3 text-gray-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="number"
                                            min={0}
                                            max={60000}
                                            value={autoOpenDelayMs}
                                            onChange={(e) => setAutoOpenDelayMs(Number(e.target.value || 0))}
                                            className="w-full bg-brand-surface border border-gray-800 rounded pl-8 pr-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-purple"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <label className="flex items-center gap-2 text-xs text-gray-400">
                            <input
                                type="checkbox"
                                checked={themeInherit}
                                onChange={(e) => setThemeInherit(e.target.checked)}
                                className="rounded border-gray-700 bg-brand-surface"
                            />
                            Inherit host page theme when possible
                        </label>

                        <button
                            onClick={handleSaveEmbedSettings}
                            disabled={embedSettingsSaving}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-all disabled:opacity-50 bg-brand-surface border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white"
                        >
                            {embedSettingsSaving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving</> : "Save Embed Settings"}
                        </button>

                        {/* Allowed Domains */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5 text-gray-500" />
                                <label className="text-[10px] font-medium text-gray-400">Allowed domains (one per line, supports *.example.com)</label>
                            </div>
                            <textarea
                                value={allowedDomainsRaw}
                                onChange={(e) => setAllowedDomainsRaw(e.target.value)}
                                rows={3}
                                placeholder="example.com\n*.example.com"
                                className="w-full bg-brand-surface border border-gray-800 rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-purple resize-none"
                            />
                            <button
                                onClick={handleSaveAllowedDomains}
                                disabled={domainsSaving}
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-all disabled:opacity-50 bg-brand-surface border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white"
                            >
                                {domainsSaving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving</> : "Save Domains"}
                            </button>
                        </div>

                        {/* Snippet + Copy */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-medium text-gray-400">Snippet</label>
                                <button
                                    onClick={handleCopySnippet}
                                    disabled={!embedSnippet || snippetLoading}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] border transition-colors ${snippetCopied
                                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                                        : "bg-brand-surface border-gray-800 text-gray-400 hover:text-gray-200"
                                        }`}
                                >
                                    {snippetCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                                </button>
                            </div>
                            <div className="bg-brand-surface border border-gray-800 rounded p-3 font-mono text-[10px] text-gray-500 break-all leading-relaxed min-h-17.5">
                                {snippetLoading ? "Generating snippet..." : (embedSnippet || "No snippet available")}
                            </div>
                        </div>

                        {/* Mini Preview */}
                        <div>
                            <label className="block text-[10px] font-medium text-gray-400 mb-2">Live mini-preview</label>
                            <div className="relative h-40 rounded border border-gray-800 bg-brand-surface overflow-hidden">
                                {embedMode === "inline_iframe" && (
                                    <div className="absolute inset-3 rounded border border-gray-700 bg-brand-dark flex items-center justify-center text-[10px] text-gray-500">
                                        Inline iframe preview
                                    </div>
                                )}
                                {embedMode === "popup_launcher" && (
                                    <>
                                        <button className="absolute left-3 bottom-3 text-[10px] px-2 py-1 rounded bg-brand-purple text-white">Open chat</button>
                                        <div className="absolute right-3 bottom-10 w-32 h-20 rounded border border-gray-700 bg-brand-dark text-[10px] text-gray-500 flex items-center justify-center">
                                            Popup panel
                                        </div>
                                    </>
                                )}
                                {embedMode === "floating_bubble" && (
                                    <div className={`absolute ${embedPosition === "bottom-left" ? "left-3" : "right-3"} bottom-3 w-9 h-9 rounded-full bg-brand-purple text-white flex items-center justify-center text-xs`}>
                                        💬
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Regenerate */}
                    <button
                        onClick={onPublish}
                        disabled={isPublishing}
                        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                    >
                        Regenerate link
                    </button>
                </>
            )}
        </div>
    );
}
