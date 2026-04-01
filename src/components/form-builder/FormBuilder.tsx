"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BuilderHeader } from "./BuilderHeader";
import { PersonaTab, type Tone } from "./config/PersonaTab";
import { WelcomeTab } from "./config/WelcomeTab";
import { DesignTab } from "./config/DesignTab";
import { ShareTab } from "./config/ShareTab";
import { ChatPreview } from "./preview/ChatPreview";
import { GeneratingOverlay } from "./GeneratingOverlay";
import { generateChatLink, saveChatConfig, publishForm, syncOrgForm, aiRefineForm, updateForm } from "@/lib/api/organizations";
import { useOrgStore } from "@/stores/orgStore";
import { User, MessageCircle, Share2, Palette } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

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
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentOrg = useOrgStore((s) => s.getCurrentOrg());
    const canRemoveBranding = currentOrg?.plan === 'pro' || currentOrg?.plan === 'enterprise';

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
    const hasAppliedPromptRef = useRef(false);

    // Publish state
    const [chatLink, setChatLink] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);

    // Mobile preview toggle
    const [previewMode, setPreviewMode] = useState(false);

    // Sync state
    const [isSyncing, setIsSyncing] = useState(false);
    const [currentForm, setCurrentForm] = useState(form);
    const [isAutoRefining, setIsAutoRefining] = useState(false);

    // Auto-dismiss generating overlay
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        const t = setTimeout(() => { if (mounted.current) setIsGenerating(false); }, TOTAL_GENERATE_MS);
        return () => { mounted.current = false; clearTimeout(t); };
    }, []);

    // ─────────────────────────────────────────────────────────────────────────────
    // Preview internal state (B1 WYSIWYG)
    // ─────────────────────────────────────────────────────────────────────────────
    const [testAnswers, setTestAnswers] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<any>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    
    const abortControllerRef = useRef<AbortController | null>(null);
    const previewCacheRef = useRef<Map<string, any>>(new Map());

    const fields = currentForm?.fields || [];
    
    const triggerPreviewUpdate = useCallback(async (currentFields: any[], config: any, currentAnswers: string[]) => {
        const answerableFields = currentFields.filter((f: any) => f.type !== "SECTION_HEADER" && f.type !== "STATEMENT");
        if (answerableFields.length === 0) return;

        const safeFields = currentFields.map(f => ({
            id: f.id,
            entryId: f.entryId,
            label: f.label,
            type: f.type,
            required: f.required,
            description: f.description,
            placeholder: f.placeholder,
            options: f.options ? f.options.map((o: any) => ({ label: o.label, value: o.value })) : undefined,
            scaleConfig: f.scaleConfig ? {
                min: f.scaleConfig.min,
                max: f.scaleConfig.max,
                minLabel: f.scaleConfig.minLabel,
                maxLabel: f.scaleConfig.maxLabel,
                step: f.scaleConfig.step
            } : undefined
        }));

        const safeConfig = {
            tone: config.tone,
            welcomeMessage: config.welcomeMessage,
            aiName: config.aiName
        };

        const payload = { fields: safeFields, chatConfig: safeConfig, testAnswers: currentAnswers };
        const cacheKey = JSON.stringify(payload);

        if (previewCacheRef.current.has(cacheKey)) {
            setPreviewData(previewCacheRef.current.get(cacheKey));
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsPreviewLoading(true);
        try {
            const { previewForm } = await import('@/lib/api/organizations');
            const result = await previewForm(orgId, formId, payload, abortControllerRef.current.signal);
            if (result) {
                previewCacheRef.current.set(cacheKey, result);
                if (previewCacheRef.current.size > 50) {
                    const firstKey = previewCacheRef.current.keys().next().value;
                    if (firstKey) previewCacheRef.current.delete(firstKey);
                }
                setPreviewData(result);
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Preview fetch err:", err);
                toast.error(err?.message || 'Preview update failed');
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setIsPreviewLoading(false);
            }
        }
    }, [orgId, formId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            triggerPreviewUpdate(fields, { tone, welcomeMessage, aiName }, testAnswers);
        }, 450);
        return () => clearTimeout(timer);
    }, [fields, tone, welcomeMessage, aiName, testAnswers, triggerPreviewUpdate]);

    const handleTestAnswerSubmit = useCallback((ans: string) => {
        setTestAnswers(prev => [...prev, ans]);
    }, []);

    const handleResetTestAnswers = useCallback(() => {
        setTestAnswers([]);
    }, []);

    useEffect(() => {
        const prompt = searchParams.get("prompt");
        if (!prompt || !currentForm || hasAppliedPromptRef.current) return;

        hasAppliedPromptRef.current = true;

        let cancelled = false;
        const runAutoRefine = async () => {
            setIsAutoRefining(true);
            setIsGenerating(true);

            try {
                const preview = {
                    title: currentForm.title,
                    description: currentForm.description || "",
                    fields: fields,
                    chatConfig: {
                        aiName: aiName || "Alex",
                        tone: tone,
                        welcomeMessage: welcomeMessage || "",
                        closingMessage: "",
                    },
                    tags: currentForm.tags || [],
                    fieldCount: fields.length,
                    estimatedMinutes: Math.max(1, Math.ceil(fields.length / 3)),
                };

                const refined = await aiRefineForm(orgId, {
                    instruction: prompt,
                    currentForm: preview,
                });

                if (cancelled) return;

                await updateForm(orgId, formId, {
                    title: refined.title,
                    description: refined.description,
                    fields: refined.fields,
                    chatConfig: {
                        aiName: refined.chatConfig?.aiName || aiName,
                        tone: (refined.chatConfig?.tone as Tone) || tone,
                        welcomeMessage: refined.chatConfig?.welcomeMessage || welcomeMessage,
                        avatar,
                    },
                    tags: refined.tags,
                });

                setCurrentForm((prev: any) => ({
                    ...prev,
                    title: refined.title,
                    description: refined.description,
                    fields: refined.fields,
                    tags: refined.tags,
                }));
                setAiName(refined.chatConfig?.aiName || aiName);
                setTone((refined.chatConfig?.tone as Tone) || tone);
                setWelcomeMessage(refined.chatConfig?.welcomeMessage || welcomeMessage);

                toast.success("AI customization applied");
            } catch (e: any) {
                if (!cancelled) {
                    toast.error(e?.message || "Failed to auto-customize with AI");
                }
            } finally {
                if (!cancelled) {
                    setIsAutoRefining(false);
                    setIsGenerating(false);
                    router.replace(`/dashboard/${orgId}/forms/${formId}/builder`);
                }
            }
        };

        runAutoRefine();
        return () => {
            cancelled = true;
        };
    }, [searchParams, currentForm, orgId, formId, aiName, tone, welcomeMessage, avatar, router, fields]);

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

    useEffect(() => {
        if (!canRemoveBranding && removeBranding) {
            setRemoveBranding(false);
        }
    }, [canRemoveBranding, removeBranding]);

    const handlePublish = async () => {
        setIsPublishing(true);
        setPublishError(null);
        try {
            // Ensure the form is marked as ACTIVE in the database
            await publishForm(orgId, formId);
            const data = await generateChatLink(orgId, formId);
            const fullUrl = `${window.location.origin}/chat/${data.data.token}`;
            setChatLink(fullUrl);
            setActiveTab("share");

            if (currentForm?.source === "TEMPLATE") {
                trackEvent('template_publish', {
                    orgId,
                    formId,
                    formTitle: currentForm.title,
                    source: currentForm.source,
                });
            }
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
            {(isGenerating || isAutoRefining) && (
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
                <div className={`w-full md:w-90 md:min-w-[320px] flex flex-col border-r border-gray-800/80 ${previewMode ? "hidden md:flex" : "flex"}`}>
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
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-purple" />
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
                                canRemoveBranding={canRemoveBranding}
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
                                initialAllowedDomains={currentForm?.chatConfig?.allowedDomains ?? []}
                                initialEmbedMode={currentForm?.chatConfig?.embedMode}
                                initialEmbedPosition={currentForm?.chatConfig?.embedPosition}
                                initialEmbedAutoOpenDelayMs={currentForm?.chatConfig?.embedAutoOpenDelayMs}
                                initialEmbedThemeInherit={currentForm?.chatConfig?.embedThemeInherit}
                            />
                        )}
                    </div>
                </div>

                {/* RIGHT: Preview Panel */}
                <div className={`flex-1 overflow-hidden ${!previewMode ? "hidden md:block" : "block"}`}>
                    <ChatPreview
                        orgId={orgId}
                        formId={formId}
                        formTitle={currentForm.title}
                        aiName={aiName}
                        aiAvatar={avatar}
                        welcomeMessage={welcomeMessage}
                        tone={tone}
                        fields={currentForm.fields ?? []}
                        removeBranding={removeBranding}
                        themeColor={themeColor}
                        buttonStyle={buttonStyle}
                        previewData={previewData}
                        isLoading={isPreviewLoading}
                        isDraft={true}
                        onTestAnswerSubmit={handleTestAnswerSubmit}
                        onResetTestAnswers={handleResetTestAnswers}
                    />
                </div>
            </div>
        </div>
    );
}
