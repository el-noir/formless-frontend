"use client";

import React, { useState, useEffect } from "react";
import {
    ArrowLeft, Sparkles, Loader2, RefreshCw, Save, Check,
    MessageSquare, ListChecks, Settings, ChevronDown, ChevronUp
} from "lucide-react";
import { useFormCreationStore } from "@/stores/formCreationStore";
import { getFormTones, aiGenerateForm, aiRefineForm, aiSaveForm } from "@/lib/api/organizations";
import { TonePicker } from "./TonePicker";
import { toast } from "sonner";
import type { FormField, FormTone, AiGeneratedFormPreview } from "@/app/types/Form";

interface AiFormGeneratorProps {
    orgId: string;
    onCreated: (formId: string) => void;
    onBack: () => void;
}

type AiStep = "prompt" | "preview";

// ─── Field type icon/label for display ───────────────────────────────────────

const FIELD_TYPE_LABELS: Record<string, string> = {
    SHORT_TEXT: "Short Text",
    LONG_TEXT: "Long Text",
    MULTIPLE_CHOICE: "Multiple Choice",
    DROPDOWN: "Dropdown",
    CHECKBOXES: "Checkboxes",
    LINEAR_SCALE: "Linear Scale",
    DATE: "Date",
    TIME: "Time",
    RATING: "Rating",
    NPS: "NPS",
    YES_NO: "Yes/No",
    PHONE: "Phone",
    EMAIL: "Email",
    URL: "URL",
    NUMBER: "Number",
    RANKING: "Ranking",
    FILE_UPLOAD: "File Upload",
    STATEMENT: "Statement",
    SECTION_HEADER: "Section",
};

export function AiFormGenerator({ orgId, onCreated, onBack }: AiFormGeneratorProps) {
    const store = useFormCreationStore();
    const [step, setStep] = useState<AiStep>("prompt");
    const [tonesLoading, setTonesLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [refineInput, setRefineInput] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Load tones
    useEffect(() => {
        if (store.tones.length > 0) return;
        setTonesLoading(true);
        getFormTones(orgId)
            .then((tones) => store.setTones(tones))
            .catch(() => {})
            .finally(() => setTonesLoading(false));
    }, [orgId, store.tones.length]);

    const handleGenerate = async () => {
        if (store.aiPrompt.trim().length < 10) {
            toast.error("Please describe your form in at least 10 characters.");
            return;
        }
        setIsGenerating(true);
        store.setError(null);
        try {
            const preview = await aiGenerateForm(orgId, {
                prompt: store.aiPrompt,
                tone: store.chatConfig.tone,
                fieldCount: store.aiFieldCount,
                context: store.aiContext || undefined,
            });
            store.setAiPreview(preview);
            setStep("preview");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to generate form";
            store.setError(msg);
            toast.error(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRefine = async () => {
        if (!store.aiPreview || refineInput.trim().length < 5) {
            toast.error("Please provide refinement instructions (min 5 chars).");
            return;
        }
        setIsRefining(true);
        try {
            const refined = await aiRefineForm(orgId, {
                instruction: refineInput,
                currentForm: store.aiPreview,
            });
            store.setAiPreview(refined);
            setRefineInput("");
            toast.success("Form refined!");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to refine form";
            toast.error(msg);
        } finally {
            setIsRefining(false);
        }
    };

    const handleSave = async () => {
        if (!store.aiPreview) return;
        setIsSaving(true);
        try {
            const result = await aiSaveForm(orgId, {
                preview: store.aiPreview,
                isPublished: false,
            });
            toast.success("AI form saved!");
            onCreated(result.id);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to save form";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegenerate = () => {
        store.setAiPreview(null);
        setStep("prompt");
    };

    // ─── Prompt Step ─────────────────────────────────────────────────────────

    if (step === "prompt") {
        return (
            <div className="max-w-2xl mx-auto w-full">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                </button>

                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-1">AI Form Generator</h2>
                    <p className="text-gray-500 text-xs">
                        Describe what you need and AI will build the entire form for you.
                    </p>
                </div>

                <div className="space-y-5">
                    {/* Main prompt */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            Describe your form *
                        </label>
                        <textarea
                            value={store.aiPrompt}
                            onChange={(e) => store.setAiPrompt(e.target.value)}
                            placeholder="e.g. Create a customer feedback form for a coffee shop. Ask about their drink, experience, staff friendliness, and if they'd come back."
                            rows={4}
                            maxLength={2000}
                            className="w-full bg-[#111116] border border-gray-800 rounded-lg text-sm text-white px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-600 resize-none"
                        />
                        <p className="text-[10px] text-gray-600 mt-1 text-right">
                            {store.aiPrompt.length}/2000
                        </p>
                    </div>

                    {/* Tone (optional) */}
                    <TonePicker
                        tones={store.tones}
                        selected={store.chatConfig.tone}
                        onSelect={(tone: FormTone) => store.setChatConfig({ tone })}
                        loading={tonesLoading}
                    />

                    {/* Advanced options toggle */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-400 transition-colors"
                    >
                        <Settings className="w-3 h-3" />
                        Advanced options
                        {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {showAdvanced && (
                        <div className="space-y-4 bg-[#0B0B0F] border border-gray-800/60 rounded-lg p-4">
                            {/* Field count */}
                            <div>
                                <label className="block text-[10px] font-medium text-gray-400 mb-1">
                                    Approximate number of questions
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={store.aiFieldCount}
                                    onChange={(e) => store.setAiFieldCount(Number(e.target.value))}
                                    className="w-24 bg-[#111116] border border-gray-800 rounded text-xs text-white px-3 py-2 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {/* Context */}
                            <div>
                                <label className="block text-[10px] font-medium text-gray-400 mb-1">
                                    Business context (optional)
                                </label>
                                <textarea
                                    value={store.aiContext}
                                    onChange={(e) => store.setAiContext(e.target.value)}
                                    placeholder="e.g. We're a B2B SaaS targeting enterprise clients..."
                                    rows={2}
                                    className="w-full bg-[#111116] border border-gray-800 rounded text-xs text-white px-3 py-2 focus:outline-none focus:border-purple-500 placeholder-gray-600 resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {store.error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
                            {store.error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-8 pt-4 border-t border-gray-800">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || store.aiPrompt.trim().length < 10}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 px-6 rounded-lg transition-colors"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Generate Form
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // ─── Preview Step ────────────────────────────────────────────────────────

    const preview = store.aiPreview!;

    return (
        <div className="max-w-3xl mx-auto w-full">
            <button
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Start Over
            </button>

            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">AI Preview</h2>
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                        Not saved yet
                    </span>
                </div>
                <p className="text-gray-500 text-xs">
                    Review the generated form. Refine with instructions or save when ready.
                </p>
            </div>

            {/* Preview card */}
            <div className="bg-[#111116] border border-gray-800 rounded-lg p-5 mb-5">
                <h3 className="text-base font-semibold text-white mb-1">{preview.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{preview.description}</p>

                {/* Meta row */}
                <div className="flex items-center gap-4 mb-4 text-[10px] text-gray-600">
                    <span className="flex items-center gap-1">
                        <ListChecks className="w-3 h-3" />
                        {preview.fieldCount} questions
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {preview.chatConfig.aiName} · {preview.chatConfig.tone}
                    </span>
                    <span>~{preview.estimatedMinutes} min</span>
                </div>

                {/* Chat config preview */}
                <div className="bg-[#0B0B0F] border border-gray-800/60 rounded-lg p-3 mb-4">
                    <p className="text-[10px] text-gray-600 mb-1">Welcome message</p>
                    <p className="text-xs text-gray-400 italic">{preview.chatConfig.welcomeMessage}</p>
                </div>

                {/* Fields list */}
                <div className="space-y-1.5">
                    {preview.fields.map((field: FormField, i: number) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 bg-[#0B0B0F] border border-gray-800/60 rounded px-3 py-2"
                        >
                            <span className="text-[10px] text-gray-600 font-mono w-4">{i + 1}.</span>
                            <span className="text-xs text-white flex-1 truncate">{field.label}</span>
                            <span className="text-[10px] text-gray-600">
                                {FIELD_TYPE_LABELS[field.type] ?? field.type}
                            </span>
                            {field.required && (
                                <span className="text-[9px] text-red-400 bg-red-500/5 px-1.5 py-0.5 rounded">req</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Tags */}
                {preview.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                        {preview.tags.map((tag: string) => (
                            <span
                                key={tag}
                                className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Refine section */}
            <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-lg p-4 mb-5">
                <h4 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3" />
                    Refine with AI
                </h4>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={refineInput}
                        onChange={(e) => setRefineInput(e.target.value)}
                        placeholder='e.g. "Make it shorter" or "Add a question about pricing"'
                        className="flex-1 bg-[#111116] border border-gray-800 rounded text-xs text-white px-3 py-2 focus:outline-none focus:border-purple-500 placeholder-gray-600"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !isRefining) handleRefine();
                        }}
                    />
                    <button
                        onClick={handleRefine}
                        disabled={isRefining || refineInput.trim().length < 5}
                        className="flex items-center gap-1.5 bg-[#111116] border border-gray-800 hover:border-purple-500/50 text-xs text-gray-400 hover:text-purple-400 px-3 py-2 rounded transition-colors disabled:opacity-40"
                    >
                        {isRefining ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        Refine
                    </button>
                </div>

                {/* Quick refine suggestions */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                    {["Make it shorter", "Add an email field", "Make it more casual", "Add a rating question"].map(
                        (suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => setRefineInput(suggestion)}
                                className="text-[10px] bg-gray-900 border border-gray-800 text-gray-500 hover:text-gray-400 px-2 py-1 rounded transition-colors"
                            >
                                {suggestion}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <button
                    onClick={handleRegenerate}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-brand-purple hover:bg-[#0da372] disabled:opacity-50 text-white text-sm font-medium py-2.5 px-6 rounded-lg transition-colors"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Form
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
