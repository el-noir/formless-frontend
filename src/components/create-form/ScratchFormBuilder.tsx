"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import { useFormCreationStore } from "@/stores/formCreationStore";
import { FieldEditor } from "./FieldEditor";
import { TonePicker } from "./TonePicker";
import { getFormTones, createForm } from "@/lib/api/organizations";
import { toast } from "sonner";
import type { FormTone } from "@/app/types/Form";

interface ScratchFormBuilderProps {
    orgId: string;
    onCreated: (formId: string) => void;
    onBack: () => void;
}

type ScratchStep = "fields" | "config" | "review";

const STEPS: { id: ScratchStep; label: string }[] = [
    { id: "fields", label: "Questions" },
    { id: "config", label: "Configuration" },
    { id: "review", label: "Review & Create" },
];

export function ScratchFormBuilder({ orgId, onCreated, onBack }: ScratchFormBuilderProps) {
    const [step, setStep] = useState<ScratchStep>("fields");
    const store = useFormCreationStore();
    const [tonesLoading, setTonesLoading] = useState(false);

    // Load tones on mount
    useEffect(() => {
        if (store.tones.length > 0) return;
        setTonesLoading(true);
        getFormTones(orgId)
            .then((tones) => store.setTones(tones))
            .catch(() => {})
            .finally(() => setTonesLoading(false));
    }, [orgId, store.tones.length]);

    const stepIndex = STEPS.findIndex((s) => s.id === step);
    const canProceed = step === "fields"
        ? store.title.trim().length > 0 && store.fields.length > 0
        : step === "config"
        ? true
        : true;

    const handleNext = () => {
        if (stepIndex < STEPS.length - 1) {
            setStep(STEPS[stepIndex + 1].id);
        }
    };

    const handlePrev = () => {
        if (stepIndex > 0) {
            setStep(STEPS[stepIndex - 1].id);
        } else {
            onBack();
        }
    };

    const handleCreate = async () => {
        store.setIsSubmitting(true);
        store.setError(null);
        try {
            const result = await createForm(orgId, {
                title: store.title,
                description: store.description || undefined,
                fields: store.fields,
                chatConfig: store.chatConfig,
                settings: store.settings,
                branding: store.branding,
                tags: store.tags.length > 0 ? store.tags : undefined,
            });
            toast.success("Form created successfully!");
            onCreated(result.id);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to create form";
            store.setError(msg);
            toast.error(msg);
        } finally {
            store.setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto w-full">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
                {STEPS.map((s, i) => (
                    <React.Fragment key={s.id}>
                        <button
                            onClick={() => {
                                if (i <= stepIndex || canProceed) setStep(s.id);
                            }}
                            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                                s.id === step
                                    ? "text-brand-purple"
                                    : i < stepIndex
                                    ? "text-gray-400 hover:text-gray-300"
                                    : "text-gray-600"
                            }`}
                        >
                            <span
                                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center border ${
                                    s.id === step
                                        ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                                        : i < stepIndex
                                        ? "border-gray-600 bg-gray-800 text-gray-400"
                                        : "border-gray-800 text-gray-600"
                                }`}
                            >
                                {i + 1}
                            </span>
                            {s.label}
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className="flex-1 h-px bg-gray-800" />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step content */}
            {step === "fields" && (
                <div className="space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">Form Title *</label>
                        <input
                            type="text"
                            value={store.title}
                            onChange={(e) => store.setTitle(e.target.value)}
                            placeholder="e.g. Customer Feedback Survey"
                            className="w-full bg-[#111116] border border-gray-800 rounded-lg text-sm text-white px-4 py-2.5 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-600"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">Description (optional)</label>
                        <textarea
                            value={store.description}
                            onChange={(e) => store.setDescription(e.target.value)}
                            placeholder="Brief description of this form..."
                            rows={2}
                            className="w-full bg-[#111116] border border-gray-800 rounded-lg text-sm text-white px-4 py-2.5 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-600 resize-none"
                        />
                    </div>

                    {/* Fields */}
                    <FieldEditor
                        fields={store.fields}
                        onAdd={store.addField}
                        onUpdate={store.updateField}
                        onRemove={store.removeField}
                        onReorder={store.reorderFields}
                    />
                </div>
            )}

            {step === "config" && (
                <div className="space-y-6">
                    {/* AI Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">AI Assistant Name</label>
                        <input
                            type="text"
                            value={store.chatConfig.aiName ?? ""}
                            onChange={(e) => store.setChatConfig({ aiName: e.target.value })}
                            placeholder="e.g. Alex"
                            maxLength={30}
                            className="w-full bg-[#111116] border border-gray-800 rounded-lg text-sm text-white px-4 py-2.5 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-600"
                        />
                    </div>

                    {/* Tone Picker */}
                    <TonePicker
                        tones={store.tones}
                        selected={store.chatConfig.tone}
                        onSelect={(tone: FormTone) => store.setChatConfig({ tone })}
                        loading={tonesLoading}
                    />

                    {/* Welcome Message */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">Welcome Message (optional)</label>
                        <textarea
                            value={store.chatConfig.welcomeMessage ?? ""}
                            onChange={(e) => store.setChatConfig({ welcomeMessage: e.target.value })}
                            placeholder="Custom greeting when the chat starts..."
                            rows={2}
                            maxLength={300}
                            className="w-full bg-[#111116] border border-gray-800 rounded-lg text-sm text-white px-4 py-2.5 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-600 resize-none"
                        />
                    </div>

                    {/* Closing Message */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">Closing Message (optional)</label>
                        <textarea
                            value={store.chatConfig.closingMessage ?? ""}
                            onChange={(e) => store.setChatConfig({ closingMessage: e.target.value })}
                            placeholder="Message shown after form completion..."
                            rows={2}
                            maxLength={300}
                            className="w-full bg-[#111116] border border-gray-800 rounded-lg text-sm text-white px-4 py-2.5 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-600 resize-none"
                        />
                    </div>

                    {/* Settings */}
                    <div className="border-t border-gray-800 pt-5">
                        <h3 className="text-xs font-medium text-gray-300 mb-3">Settings</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={store.settings.showProgressBar ?? true}
                                    onChange={(e) => store.setSettings({ showProgressBar: e.target.checked })}
                                    className="w-3.5 h-3.5 rounded border-gray-700 bg-[#111116] text-brand-purple focus:ring-brand-purple focus:ring-offset-0"
                                />
                                <span className="text-xs text-gray-400">Show progress bar</span>
                            </label>
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={store.settings.notifyOnSubmission ?? false}
                                    onChange={(e) => store.setSettings({ notifyOnSubmission: e.target.checked })}
                                    className="w-3.5 h-3.5 rounded border-gray-700 bg-[#111116] text-brand-purple focus:ring-brand-purple focus:ring-offset-0"
                                />
                                <span className="text-xs text-gray-400">Email notification on new response</span>
                            </label>
                            {store.settings.notifyOnSubmission && (
                                <input
                                    type="email"
                                    value={store.settings.notificationEmail ?? ""}
                                    onChange={(e) => store.setSettings({ notificationEmail: e.target.value })}
                                    placeholder="notification@company.com"
                                    className="w-full bg-[#111116] border border-gray-800 rounded text-xs text-white px-3 py-2 focus:outline-none focus:border-brand-purple placeholder-gray-600"
                                />
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">Tags (comma-separated, optional)</label>
                        <input
                            type="text"
                            value={store.tags.join(", ")}
                            onChange={(e) =>
                                store.setTags(
                                    e.target.value
                                        .split(",")
                                        .map((t) => t.trim())
                                        .filter(Boolean)
                                )
                            }
                            placeholder="e.g. feedback, survey, q1"
                            className="w-full bg-[#111116] border border-gray-800 rounded-lg text-sm text-white px-4 py-2.5 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-600"
                        />
                    </div>
                </div>
            )}

            {step === "review" && (
                <div className="space-y-5">
                    <div className="bg-[#111116] border border-gray-800 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-white mb-1">{store.title}</h3>
                        {store.description && (
                            <p className="text-xs text-gray-500 mb-3">{store.description}</p>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-[#0B0B0F] border border-gray-800/60 rounded p-2.5">
                                <p className="text-gray-600 text-[10px] mb-0.5">Questions</p>
                                <p className="text-white font-medium">{store.fields.length}</p>
                            </div>
                            <div className="bg-[#0B0B0F] border border-gray-800/60 rounded p-2.5">
                                <p className="text-gray-600 text-[10px] mb-0.5">Tone</p>
                                <p className="text-white font-medium capitalize">{store.chatConfig.tone ?? "friendly"}</p>
                            </div>
                            <div className="bg-[#0B0B0F] border border-gray-800/60 rounded p-2.5">
                                <p className="text-gray-600 text-[10px] mb-0.5">AI Name</p>
                                <p className="text-white font-medium">{store.chatConfig.aiName ?? "Alex"}</p>
                            </div>
                            <div className="bg-[#0B0B0F] border border-gray-800/60 rounded p-2.5">
                                <p className="text-gray-600 text-[10px] mb-0.5">Progress Bar</p>
                                <p className="text-white font-medium">{store.settings.showProgressBar ? "Yes" : "No"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Fields summary */}
                    <div>
                        <h4 className="text-xs font-medium text-gray-300 mb-2">Questions</h4>
                        <div className="space-y-1">
                            {store.fields.map((field, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 bg-[#0B0B0F] border border-gray-800/60 rounded px-3 py-2 text-xs"
                                >
                                    <span className="text-gray-600 text-[10px] font-mono w-4">{i + 1}.</span>
                                    <span className="text-white flex-1 truncate">{field.label || "Untitled"}</span>
                                    <span className="text-gray-600 text-[10px] uppercase">{field.type.replace(/_/g, " ")}</span>
                                    {field.required && (
                                        <span className="text-[9px] text-red-400">Required</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {store.error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
                            {store.error}
                        </div>
                    )}
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-800">
                <button
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {stepIndex === 0 ? "Back" : "Previous"}
                </button>

                {step === "review" ? (
                    <button
                        onClick={handleCreate}
                        disabled={store.isSubmitting || !canProceed}
                        className="flex items-center gap-2 bg-brand-purple hover:bg-[#0da372] disabled:opacity-50 text-white text-sm font-medium py-2 px-5 rounded-lg transition-colors"
                    >
                        {store.isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Create Form
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className="flex items-center gap-1.5 bg-brand-purple hover:bg-[#0da372] disabled:opacity-50 text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Next <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
