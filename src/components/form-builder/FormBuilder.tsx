"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BuilderHeader } from "./BuilderHeader";
import { PersonaTab, type Tone } from "./config/PersonaTab";
import { WelcomeTab } from "./config/WelcomeTab";
import { DesignTab } from "./config/DesignTab";
import { ShareTab } from "./config/ShareTab";
import { ChatPreview } from "./preview/ChatPreview";
import { GeneratingOverlay } from "./GeneratingOverlay";
import { generateChatLink, saveChatConfig, publishForm, syncOrgForm } from "@/lib/api/organizations";
import { User, MessageCircle, Share2, Palette } from "lucide-react";
import { toast } from "sonner";

interface FormBuilderProps {
    form: any;
    orgId: string;
    formId: string;
}

type Tab = "persona" | "welcome" | "design" | "share";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "persona", label: "Persona", icon: User },
    { id: "welcome", label: "Welcome", icon: MessageCircle },
    { id: "design", label: "Design", icon: Palette },
    { id: "share", label: "Publish", icon: Share2 },
];

const TOTAL_GENERATE_MS = 1200;
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
    const [removeBranding, setRemoveBranding] = useState<boolean>(saved.removeBranding ?? false);
    const [themeColor, setThemeColor] = useState<string>(saved.themeColor ?? "#10b981");
    const [buttonStyle, setButtonStyle] = useState<'rounded' | 'square'>(saved.buttonStyle ?? "rounded");

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

    // Sync state
    const [isSyncing, setIsSyncing] = useState(false);
    const [currentForm, setCurrentForm] = useState(form);

    // Auto-dismiss generating overlay
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        const t = setTimeout(() => { if (mounted.current) setIsGenerating(false); }, TOTAL_GENERATE_MS);
        return () => { mounted.current = false; clearTimeout(t); };
    }, []);

    // Debounced auto-save whenever config changes
    const doSave = useCallback(async (config: { 
        aiName: string; 
        tone: Tone; 
        avatar: string; 
        welcomeMessage: string; 
        removeBranding: boolean;
        themeColor: string;
        buttonStyle: 'rounded' | 'square';
    }) => {
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
        saveTimer.current = setTimeout(() => doSave({ 
            aiName, tone, avatar, welcomeMessage, removeBranding, themeColor, buttonStyle 
        }), AUTOSAVE_DEBOUNCE_MS);
        return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    }, [aiName, tone, avatar, welcomeMessage, removeBranding, themeColor, buttonStyle, doSave]);

    const handlePublish = async () => {
        setIsPublishing(true);
        setPublishError(null);
        try {
            // Ensure the form is marked as ACTIVE in the database
            await publishForm(orgId, formId);
            const data = await generateChatLink(orgId, formId);
            const fullUrl = `${window.location.origin}/chat/${data.data}`;
            setChatLink(fullUrl);
            setActiveTab("share");
        } catch (e: any) {
            setPublishError(e.message || "Failed to generate link");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncOrgForm(orgId, formId);
            setCurrentForm(result.data);
            toast.success("Form fields synced with Google Forms");
        } catch (e: any) {
            toast.error(e.message || "Failed to sync form");
        } finally {
            setIsSyncing(false);
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
                formTitle={currentForm.title}
                orgId={orgId}
                formId={formId}
                onPublish={handlePublish}
                isPublishing={isPublishing}
                chatLink={chatLink}
                previewMode={previewMode}
                onTogglePreview={() => setPreviewMode((p) => !p)}
                saveStatus={saveStatus}
                isGoogleForm={currentForm.source === "GOOGLE_FORMS"}
                onSync={handleSync}
                isSyncing={isSyncing}
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
                                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors relative ${activeTab === tab.id ? "text-brand-purple" : "text-gray-500 hover:text-gray-300"}`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                    {tab.id === "share" && chatLink && (
                                        <span className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-green-400" />
                                    )}
                                    {activeTab === tab.id && (
                                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-purple" />
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
                        {activeTab === "design" && (
                            <DesignTab
                                removeBranding={removeBranding}
                                avatar={avatar}
                                themeColor={themeColor}
                                buttonStyle={buttonStyle}
                                onBrandingChange={setRemoveBranding}
                                onAvatarChange={setAvatar}
                                onThemeColorChange={setThemeColor}
                                onButtonStyleChange={setButtonStyle}
                            />
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
                        formTitle={currentForm.title}
                        aiName={aiName}
                        aiAvatar={avatar}
                        welcomeMessage={welcomeMessage}
                        tone={tone}
                        fields={currentForm.fields ?? []}
                        removeBranding={removeBranding}
                        themeColor={themeColor}
                        buttonStyle={buttonStyle}
                    />
                </div>
            </div>
        </div>
    );
}
