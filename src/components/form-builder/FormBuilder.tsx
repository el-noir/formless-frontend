"use client";

import React, { useState, useEffect, useRef } from "react";
import { BuilderHeader } from "./BuilderHeader";
import { PersonaTab, type Tone } from "./config/PersonaTab";
import { WelcomeTab } from "./config/WelcomeTab";
import { ShareTab } from "./config/ShareTab";
import { ChatPreview } from "./preview/ChatPreview";
import { GeneratingOverlay } from "./GeneratingOverlay";
import { generateChatLink } from "@/lib/api/organizations";
import { User, MessageCircle, Share2 } from "lucide-react";

interface FormBuilderProps {
    form: any;
    orgId: string;
    formId: string;
}

type Tab = "persona" | "welcome" | "share";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "persona", label: "Persona", icon: User },
    { id: "welcome", label: "Welcome", icon: MessageCircle },
    { id: "share", label: "Publish", icon: Share2 },
];

const TOTAL_GENERATE_MS = 2600;

export function FormBuilder({ form, orgId, formId }: FormBuilderProps) {
    const [isGenerating, setIsGenerating] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("persona");

    // Config state
    const [aiName, setAiName] = useState("Alex");
    const [tone, setTone] = useState<Tone>("friendly");
    const [avatar, setAvatar] = useState("✨");
    const [welcomeMessage, setWelcomeMessage] = useState("");

    // Publish state
    const [chatLink, setChatLink] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);

    // Mobile: toggle between config and preview
    const [previewMode, setPreviewMode] = useState(false);

    // Auto-dismiss the generating overlay
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        const t = setTimeout(() => {
            if (mounted.current) setIsGenerating(false);
        }, TOTAL_GENERATE_MS);
        return () => {
            mounted.current = false;
            clearTimeout(t);
        };
    }, []);

    const handlePublish = async () => {
        setIsPublishing(true);
        setPublishError(null);
        try {
            const data = await generateChatLink(orgId, formId);
            const fullUrl = `${window.location.origin}${data.data.url}`;
            setChatLink(fullUrl);
            setActiveTab("share");
        } catch (e: any) {
            setPublishError(e.message || "Failed to generate link");
        } finally {
            setIsPublishing(false);
        }
    };

    const handlePersonaChange = (updates: { name?: string; tone?: Tone; avatar?: string }) => {
        if (updates.name !== undefined) setAiName(updates.name);
        if (updates.tone !== undefined) setTone(updates.tone);
        if (updates.avatar !== undefined) setAvatar(updates.avatar);
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden relative">
            {/* Generating overlay — shown on mount, dismisses automatically */}
            {isGenerating && (
                <GeneratingOverlay formTitle={form.title} totalMs={TOTAL_GENERATE_MS} />
            )}

            <BuilderHeader
                formTitle={form.title}
                orgId={orgId}
                formId={formId}
                onPublish={handlePublish}
                isPublishing={isPublishing}
                chatLink={chatLink}
                previewMode={previewMode}
                onTogglePreview={() => setPreviewMode((p) => !p)}
            />

            {/* Split pane */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT: Config Panel — hidden on mobile when preview mode is active */}
                <div className={`w-full md:w-[360px] md:min-w-[320px] flex flex-col border-r border-gray-800/80 ${previewMode ? "hidden md:flex" : "flex"}`}>
                    {/* Tabs */}
                    <div className="flex border-b border-gray-800/80 shrink-0">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors relative ${activeTab === tab.id
                                        ? "text-[#9A6BFF]"
                                        : "text-gray-500 hover:text-gray-300"
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                    {tab.id === "share" && chatLink && (
                                        <span className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-green-400" />
                                    )}
                                    {activeTab === tab.id && (
                                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#9A6BFF]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {publishError && (
                            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded">
                                {publishError}
                            </div>
                        )}

                        {activeTab === "persona" && (
                            <PersonaTab
                                name={aiName}
                                tone={tone}
                                avatar={avatar}
                                onChange={handlePersonaChange}
                            />
                        )}
                        {activeTab === "welcome" && (
                            <WelcomeTab
                                message={welcomeMessage}
                                formTitle={form.title}
                                onChange={setWelcomeMessage}
                            />
                        )}
                        {activeTab === "share" && (
                            <ShareTab
                                chatLink={chatLink}
                                formTitle={form.title}
                                onPublish={handlePublish}
                                isPublishing={isPublishing}
                            />
                        )}
                    </div>
                </div>

                {/* RIGHT: Preview Panel — always visible on desktop, toggled on mobile */}
                <div className={`flex-1 overflow-hidden ${!previewMode ? "hidden md:block" : "block"}`}>
                    <ChatPreview
                        formTitle={form.title}
                        aiName={aiName}
                        aiAvatar={avatar}
                        welcomeMessage={welcomeMessage}
                        tone={tone}
                    />
                </div>
            </div>
        </div>
    );
}
