"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Search, Check } from "lucide-react";
import { getFormTemplates, getFormTones, createFormFromTemplate } from "@/lib/api/organizations";
import { useFormCreationStore } from "@/stores/formCreationStore";
import { TonePicker } from "./TonePicker";
import { toast } from "sonner";
import type { TemplateSummary, TemplateCategory, FormTone } from "@/app/types/Form";

const CATEGORIES: { value: TemplateCategory | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "lead_generation", label: "Lead Gen" },
    { value: "feedback", label: "Feedback" },
    { value: "survey", label: "Survey" },
    { value: "registration", label: "Registration" },
    { value: "application", label: "Application" },
    { value: "support", label: "Support" },
    { value: "order", label: "Order" },
    { value: "quiz", label: "Quiz" },
    { value: "hr", label: "HR" },
    { value: "education", label: "Education" },
];

interface TemplatePickerProps {
    orgId: string;
    onCreated: (formId: string) => void;
    onBack: () => void;
}

export function TemplatePicker({ orgId, onCreated, onBack }: TemplatePickerProps) {
    const store = useFormCreationStore();
    const [templates, setTemplates] = useState<TemplateSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [tonesLoading, setTonesLoading] = useState(false);
    const [objective, setObjective] = useState<TemplateCategory | "all">("all");
    const [niche, setNiche] = useState<string>("all");
    const [complexity, setComplexity] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateSummary | null>(null);

    // Customization state
    const [customTitle, setCustomTitle] = useState("");
    const [customTone, setCustomTone] = useState<FormTone | undefined>(undefined);
    const [customAiName, setCustomAiName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        getFormTemplates(orgId, objective === "all" ? undefined : objective)
            .then((loadedTemplates) => {
                setTemplates(loadedTemplates);
                // Track template view
                const signatureCount = loadedTemplates.filter((t) => t.signature).length;
                console.log('[A2-Tracking] Templates Loaded:', {
                    category: objective === "all" ? "all" : objective,
                    totalCount: loadedTemplates.length,
                    signatureCount,
                    templates: loadedTemplates.map((t) => ({
                        id: t.id,
                        name: t.name,
                        signature: t.signature,
                        nicheSlug: t.nicheSlug,
                    })),
                });
            })
            .catch(() => toast.error("Failed to load templates"))
            .finally(() => setLoading(false));
    }, [orgId, objective]);

    // Load tones when entering customize step
    useEffect(() => {
        if (!selectedTemplate || store.tones.length > 0) return;
        setTonesLoading(true);
        getFormTones(orgId)
            .then((tones) => store.setTones(tones))
            .catch(() => {})
            .finally(() => setTonesLoading(false));
    }, [orgId, selectedTemplate, store.tones.length]);

    useEffect(() => {
        if (selectedTemplate) {
            setCustomTone(selectedTemplate.recommendedTone);
        }
    }, [selectedTemplate]);

    const filtered = templates.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

        const matchesNiche = niche === "all" || (t.nicheSlug && t.nicheSlug.includes(niche));

        // Basic skeleton logic for complexity (fieldCount)
        const matchesComplexity = complexity === "all" ||
            (complexity === "short" && t.fieldCount <= 3) ||
            (complexity === "medium" && t.fieldCount > 3 && t.fieldCount <= 8) ||
            (complexity === "long" && t.fieldCount > 8);

        return matchesSearch && matchesNiche && matchesComplexity;
    });

    const filteredSignature = filtered.filter((t) => t.signature === true);
    const filteredRegular = filtered.filter((t) => t.signature !== true);

    const handleCreate = async () => {
        if (!selectedTemplate) return;
        setIsSubmitting(true);
        try {
            // Track template selection
            const trackingData = {
                templateId: selectedTemplate.id,
                templateName: selectedTemplate.name,
                isSignature: selectedTemplate.signature || false,
                nicheSlug: selectedTemplate.nicheSlug || null,
                customTone: customTone,
                hasCustomTitle: customTitle.length > 0,
            };
            console.log('[A2-Tracking] Template Selected:', trackingData);
            
            const result = await createFormFromTemplate(orgId, {
                templateId: selectedTemplate.id,
                title: customTitle.trim() || undefined,
                chatConfig: {
                    tone: customTone,
                    aiName: customAiName.trim() || undefined,
                },
            });
            toast.success("Form created from template!");
            onCreated(result.id);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to create form";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Template selected — show customization
    if (selectedTemplate) {
        return (
            <div className="max-w-2xl mx-auto w-full">
                <button
                    onClick={() => setSelectedTemplate(null)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Templates
                </button>

                <div className="text-center mb-8">
                    <span className="text-3xl mb-3 block">{selectedTemplate.icon}</span>
                    <h2 className="text-lg font-semibold text-white mb-1">{selectedTemplate.name}</h2>
                    <p className="text-gray-500 text-xs">{selectedTemplate.description}</p>
                    <p className="text-gray-600 text-[10px] mt-1">
                        {selectedTemplate.fieldCount} questions · Recommended tone: {selectedTemplate.recommendedTone}
                    </p>
                </div>

                <div className="space-y-5">
                    {/* Custom title */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            Custom Title (optional)
                        </label>
                        <input
                            type="text"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            placeholder={selectedTemplate.name}
                            className="w-full bg-[#111116] border border-gray-800 rounded-lg text-sm text-white px-4 py-2.5 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-600"
                        />
                    </div>

                    {/* AI Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            AI Assistant Name (optional)
                        </label>
                        <input
                            type="text"
                            value={customAiName}
                            onChange={(e) => setCustomAiName(e.target.value)}
                            placeholder="e.g. Alex"
                            maxLength={30}
                            className="w-full bg-[#111116] border border-gray-800 rounded-lg text-sm text-white px-4 py-2.5 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-600"
                        />
                    </div>

                    {/* Tone */}
                    <TonePicker
                        tones={store.tones}
                        selected={customTone}
                        onSelect={setCustomTone}
                        loading={tonesLoading}
                    />
                </div>

                <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-800">
                    <button
                        onClick={() => setSelectedTemplate(null)}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-brand-purple hover:bg-[#0da372] disabled:opacity-50 text-white text-sm font-medium py-2 px-5 rounded-lg transition-colors"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        Create from Template
                    </button>
                </div>
            </div>
        );
    }

    // Template browser
    return (
        <div className="max-w-3xl mx-auto w-full">
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
            </button>

            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">Choose a Template</h2>
                <p className="text-gray-500 text-xs">Pick a pre-built template to get started quickly.</p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full bg-[#111116] border border-gray-800 rounded-lg text-sm text-white pl-9 pr-4 py-2.5 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-600"
                />
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-[#111116] border border-gray-800 rounded-xl p-3">
                <div className="flex-1">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Objective</label>
                    <select
                        value={objective}
                        onChange={(e) => setObjective(e.target.value as any)}
                        className="w-full bg-[#0B0B0F] border border-gray-800 rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-brand-purple"
                    >
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Niche</label>
                    <select
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        className="w-full bg-[#0B0B0F] border border-gray-800 rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-brand-purple"
                    >
                        <option value="all">All Niches</option>
                        <option value="lead">Lead Generation</option>
                        <option value="support">Customer Support</option>
                        <option value="hr">HR & Operations</option>
                        <option value="education">Education</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Complexity</label>
                    <select
                        value={complexity}
                        onChange={(e) => setComplexity(e.target.value)}
                        className="w-full bg-[#0B0B0F] border border-gray-800 rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-brand-purple"
                    >
                        <option value="all">Any Length</option>
                        <option value="short">Quick (1-3 qs)</option>
                        <option value="medium">Standard (4-8 qs)</option>
                        <option value="long">Deep Dive (9+ qs)</option>
                    </select>
                </div>
            </div>

            {/* Templates grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-purple" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-xs">No templates found.</p>
                </div>
            ) : (
                <>
                    {/* Featured Signature Templates */}
                    {filteredSignature.length > 0 && (
                        <>
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-xs font-semibold text-gray-300">⭐ Featured Templates</h3>
                                    <span className="text-[8px] px-1.5 py-0.5 bg-brand-purple/20 text-brand-purple rounded-full">
                                        {filteredSignature.length} picked
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-800">
                                    {filteredSignature.map((tmpl) => (
                                        <button
                                            key={tmpl.id}
                                            onClick={() => setSelectedTemplate(tmpl)}
                                            className="text-left bg-gradient-to-br from-[#1a1a20] to-[#0B0B0F] border border-brand-purple/30 rounded-lg p-4 hover:border-brand-purple hover:from-[#2a1a2f] transition-all group relative"
                                        >
                                            <span className="absolute top-2 right-2 text-[8px] font-semibold px-2 py-1 bg-brand-purple/20 text-brand-purple rounded-full">
                                                Featured
                                            </span>
                                            <div className="flex items-start gap-3 pr-12">
                                                <span className="text-2xl shrink-0">{tmpl.icon}</span>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-medium text-white mb-0.5 group-hover:text-brand-purple transition-colors">
                                                        {tmpl.name}
                                                    </h3>
                                                    <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{tmpl.description}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-600">
                                                        <span>{tmpl.fieldCount} questions</span>
                                                        <span>·</span>
                                                        <span className="capitalize">{tmpl.recommendedTone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* All Templates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredRegular.map((tmpl) => (
                            <button
                                key={tmpl.id}
                                onClick={() => setSelectedTemplate(tmpl)}
                                className="text-left bg-[#0B0B0F] border border-gray-800/80 rounded-lg p-4 hover:border-gray-700 transition-all group"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl shrink-0">{tmpl.icon}</span>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-medium text-white mb-0.5 group-hover:text-brand-purple transition-colors">
                                            {tmpl.name}
                                        </h3>
                                        <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{tmpl.description}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-600">
                                            <span>{tmpl.fieldCount} questions</span>
                                            <span>·</span>
                                            <span className="capitalize">{tmpl.recommendedTone}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
