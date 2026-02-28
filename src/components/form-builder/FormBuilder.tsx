"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BuilderHeader } from "./BuilderHeader";
import { PersonaTab, type Tone } from "./config/PersonaTab";
import { WelcomeTab } from "./config/WelcomeTab";
import { ShareTab } from "./config/ShareTab";
import { ChatPreview } from "./preview/ChatPreview";
import { GeneratingOverlay } from "./GeneratingOverlay";
import { generateChatLink, saveChatConfig } from "@/lib/api/organizations";
import { User, MessageCircle, Share2, Save } from "lucide-react";

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
const AUTOSAVE_DEBOUNCE_MS = 1200;

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function FormBuilder({ form, orgId, formId }: FormBuilderProps) {
    const [isGenerating, setIsGenerating] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("persona");

    // Config state — seeded from form.chatConfig if it exists
    const saved = form.chatConfig ?? {};
    const [aiName, setAiName] = useState<string>(saved.aiName ?? "Alex");
    const [tone, setTone] = useState<Tone>(saved.tone ?? "friendly");
    const [avatar, setAvatar] = useState<string>(saved.avatar ?? "✨");
    const [welcomeMessage, setWelcomeMessage] = useState<string>(saved.welcomeMessage ?? "");

    // Persist state
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstRender = useRef(true);

    // Publish state
    const [chatLink, setChatLink] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);

    // Mobile preview toggle
    const [previewMode, setPreviewMode] = useState(false);

    // Auto-dismiss generating overlay
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        const t = setTimeout(() => { if (mounted.current) setIsGenerating(false); }, TOTAL_GENERATE_MS);
        return () => { mounted.current = false; clearTimeout(t); };
    }, []);

    // Debounced auto-save whenever config changes
    const doSave = useCallback(async (config: { aiName: string; tone: Tone; avatar: string; welcomeMessage: string }) => {
        setSaveStatus("saving");
        try {
            await saveChatConfig(orgId, formId, config);
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    }, [orgId, formId]);

    useEffect(() => {
        // Skip save on very first render (the initial seed from chatConfig)
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => doSave({ aiName, tone, avatar, welcomeMessage }), AUTOSAVE_DEBOUNCE_MS);
        return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    }, [aiName, tone, avatar, welcomeMessage, doSave]);

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
            {isGenerating && (
                <GeneratingOverlay form={form} totalMs={TOTAL_GENERATE_MS} />
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
                saveStatus={saveStatus}
            />

            {/* Split pane */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT: Config Panel */}
                <div className={`w-full md:w-[360px] md:min-w-[320px] flex flex-col border-r border-gray-800/80 ${previewMode ? "hidden md:flex" : "flex"}`}>
                    {/* Tabs */}
                    <div className="flex border-b border-gray-800/80 shrink-0">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors relative ${activeTab === tab.id ? "text-[#9A6BFF]" : "text-gray-500 hover:text-gray-300"}`}
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
                            <PersonaTab name={aiName} tone={tone} avatar={avatar} onChange={handlePersonaChange} />
                        )}
                        {activeTab === "welcome" && (
                            <WelcomeTab message={welcomeMessage} formTitle={form.title} onChange={setWelcomeMessage} />
                        )}
                        {activeTab === "share" && (
                            <ShareTab
                                chatLink={chatLink}
                                formTitle={form.title}
                                onPublish={handlePublish}
                                isPublishing={isPublishing}
                                orgId={orgId}
                                formId={formId}
                                initialExpiresAt={form.chatLinkExpiresAt ?? null}
                            />
                        )}
                    </div>
                </div>

                {/* RIGHT: Preview Panel */}
                <div className={`flex-1 overflow-hidden ${!previewMode ? "hidden md:block" : "block"}`}>
                    <ChatPreview
                        formTitle={form.title}
                        aiName={aiName}
                        aiAvatar={avatar}
                        welcomeMessage={welcomeMessage}
                        tone={tone}
                        fields={form.fields ?? []}
                    />
                </div>
            </div>
        </div>
    );
}
