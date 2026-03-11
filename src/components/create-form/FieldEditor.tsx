"use client";

import React, { useState } from "react";
import {
    Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
    Type, AlignLeft, ListChecks, ChevronDownSquare, CheckSquare,
    BarChart3, Calendar, Clock, Hash, Star, ThumbsUp,
    Phone, Mail, Link, FileUp, MessageSquare, Minus
} from "lucide-react";
import type { FormField, FieldType, FieldOption, ScaleConfig } from "@/app/types/Form";

// ─── Field Type Config ───────────────────────────────────────────────────────

const FIELD_TYPES: { value: FieldType; label: string; icon: React.ElementType; group: string }[] = [
    { value: "SHORT_TEXT", label: "Short Text", icon: Type, group: "Text" },
    { value: "LONG_TEXT", label: "Long Text", icon: AlignLeft, group: "Text" },
    { value: "EMAIL", label: "Email", icon: Mail, group: "Text" },
    { value: "PHONE", label: "Phone", icon: Phone, group: "Text" },
    { value: "URL", label: "URL", icon: Link, group: "Text" },
    { value: "NUMBER", label: "Number", icon: Hash, group: "Text" },
    { value: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: ListChecks, group: "Choice" },
    { value: "DROPDOWN", label: "Dropdown", icon: ChevronDownSquare, group: "Choice" },
    { value: "CHECKBOXES", label: "Checkboxes", icon: CheckSquare, group: "Choice" },
    { value: "YES_NO", label: "Yes / No", icon: ThumbsUp, group: "Choice" },
    { value: "LINEAR_SCALE", label: "Linear Scale", icon: BarChart3, group: "Scale" },
    { value: "RATING", label: "Rating", icon: Star, group: "Scale" },
    { value: "NPS", label: "NPS (0–10)", icon: BarChart3, group: "Scale" },
    { value: "DATE", label: "Date", icon: Calendar, group: "Other" },
    { value: "TIME", label: "Time", icon: Clock, group: "Other" },
    { value: "STATEMENT", label: "Statement", icon: MessageSquare, group: "Other" },
    { value: "FILE_UPLOAD", label: "File Upload", icon: FileUp, group: "Other" },
];

const NEEDS_OPTIONS: FieldType[] = ["MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOXES", "RANKING"];
const NEEDS_SCALE: FieldType[] = ["LINEAR_SCALE", "RATING"];

function getDefaultField(): FormField {
    return { label: "", type: "SHORT_TEXT", required: false };
}

// ─── Single Field Card ───────────────────────────────────────────────────────

interface FieldCardProps {
    field: FormField;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    onChange: (field: FormField) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

function FieldCard({
    field, index, isExpanded, onToggle, onChange, onRemove,
    onMoveUp, onMoveDown, isFirst, isLast,
}: FieldCardProps) {
    const typeConfig = FIELD_TYPES.find((t) => t.value === field.type);
    const Icon = typeConfig?.icon ?? Type;

    const updateField = (updates: Partial<FormField>) => {
        onChange({ ...field, ...updates });
    };

    const needsOptions = NEEDS_OPTIONS.includes(field.type);
    const needsScale = NEEDS_SCALE.includes(field.type);

    return (
        <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-lg overflow-hidden group">
            {/* Header — always visible */}
            <div
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-[#111116] transition-colors"
                onClick={onToggle}
            >
                <GripVertical className="w-3.5 h-3.5 text-gray-700 shrink-0" />
                <div className="w-6 h-6 rounded bg-[#1C1C22] border border-gray-800 flex items-center justify-center shrink-0">
                    <Icon className="w-3 h-3 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">
                        {field.label || <span className="text-gray-600 italic">Untitled question</span>}
                    </p>
                    <p className="text-[10px] text-gray-600">{typeConfig?.label ?? field.type}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {field.required && (
                        <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">
                            Required
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
                    ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                    )}
                </div>
            </div>

            {/* Expanded body */}
            {isExpanded && (
                <div className="border-t border-gray-800/80 p-3 space-y-3">
                    {/* Label */}
                    <div>
                        <label className="block text-[10px] font-medium text-gray-400 mb-1">Question Label</label>
                        <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField({ label: e.target.value })}
                            placeholder="e.g. What's your name?"
                            className="w-full bg-[#111116] border border-gray-800 rounded text-xs text-white px-3 py-2 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-600"
                        />
                    </div>

                    {/* Type selector */}
                    <div>
                        <label className="block text-[10px] font-medium text-gray-400 mb-1">Field Type</label>
                        <select
                            value={field.type}
                            onChange={(e) => {
                                const newType = e.target.value as FieldType;
                                const updates: Partial<FormField> = { type: newType };
                                // Init options if switching to an options-based type
                                if (NEEDS_OPTIONS.includes(newType) && !field.options?.length) {
                                    updates.options = [{ label: "Option 1", value: "option_1" }];
                                }
                                // Init scale if switching to a scale type
                                if (NEEDS_SCALE.includes(newType) && !field.scaleConfig) {
                                    updates.scaleConfig = { min: 1, max: 5, step: 1 };
                                }
                                updateField(updates);
                            }}
                            className="w-full bg-[#111116] border border-gray-800 rounded text-xs text-white px-3 py-2 focus:outline-none focus:border-brand-purple transition-colors"
                        >
                            {Object.entries(
                                FIELD_TYPES.reduce<Record<string, typeof FIELD_TYPES>>((acc, ft) => {
                                    (acc[ft.group] ??= []).push(ft);
                                    return acc;
                                }, {})
                            ).map(([group, types]) => (
                                <optgroup key={group} label={group}>
                                    {types.map((ft) => (
                                        <option key={ft.value} value={ft.value}>
                                            {ft.label}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {/* Placeholder */}
                    <div>
                        <label className="block text-[10px] font-medium text-gray-400 mb-1">Placeholder (optional)</label>
                        <input
                            type="text"
                            value={field.placeholder ?? ""}
                            onChange={(e) => updateField({ placeholder: e.target.value || undefined })}
                            placeholder="e.g. Type here..."
                            className="w-full bg-[#111116] border border-gray-800 rounded text-xs text-white px-3 py-2 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-600"
                        />
                    </div>

                    {/* Options editor */}
                    {needsOptions && (
                        <OptionsEditor
                            options={field.options ?? []}
                            onChange={(options) => updateField({ options })}
                        />
                    )}

                    {/* Scale editor */}
                    {needsScale && (
                        <ScaleEditor
                            config={field.scaleConfig ?? { min: 1, max: 5, step: 1 }}
                            onChange={(scaleConfig) => updateField({ scaleConfig })}
                        />
                    )}

                    {/* Required toggle + actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField({ required: e.target.checked })}
                                className="w-3.5 h-3.5 rounded border-gray-700 bg-[#111116] text-brand-purple focus:ring-brand-purple focus:ring-offset-0"
                            />
                            <span className="text-[10px] text-gray-400">Required</span>
                        </label>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={onMoveUp}
                                disabled={isFirst}
                                className="p-1 text-gray-600 hover:text-gray-400 disabled:opacity-30 transition-colors"
                                title="Move up"
                            >
                                <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={onMoveDown}
                                disabled={isLast}
                                className="p-1 text-gray-600 hover:text-gray-400 disabled:opacity-30 transition-colors"
                                title="Move down"
                            >
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={onRemove}
                                className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                                title="Remove field"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Options Editor ──────────────────────────────────────────────────────────

function OptionsEditor({
    options,
    onChange,
}: {
    options: FieldOption[];
    onChange: (options: FieldOption[]) => void;
}) {
    const addOption = () => {
        onChange([...options, { label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` }]);
    };

    const updateOption = (index: number, label: string) => {
        const updated = [...options];
        updated[index] = { ...updated[index], label, value: label.toLowerCase().replace(/\s+/g, '_') };
        onChange(updated);
    };

    const removeOption = (index: number) => {
        onChange(options.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-1">Options</label>
            <div className="space-y-1.5">
                {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <input
                            type="text"
                            value={opt.label}
                            onChange={(e) => updateOption(i, e.target.value)}
                            className="flex-1 bg-[#111116] border border-gray-800 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-brand-purple transition-colors"
                        />
                        <button
                            onClick={() => removeOption(i)}
                            disabled={options.length <= 1}
                            className="p-1 text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors"
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={addOption}
                className="mt-1.5 text-[10px] text-brand-purple hover:text-brand-purple/80 flex items-center gap-1 transition-colors"
            >
                <Plus className="w-3 h-3" /> Add option
            </button>
        </div>
    );
}

// ─── Scale Editor ────────────────────────────────────────────────────────────

function ScaleEditor({
    config,
    onChange,
}: {
    config: ScaleConfig;
    onChange: (config: ScaleConfig) => void;
}) {
    return (
        <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-1">Scale Configuration</label>
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="text-[9px] text-gray-600">Min</label>
                    <input
                        type="number"
                        value={config.min}
                        onChange={(e) => onChange({ ...config, min: Number(e.target.value) })}
                        className="w-full bg-[#111116] border border-gray-800 rounded text-xs text-white px-2 py-1.5 focus:outline-none focus:border-brand-purple"
                    />
                </div>
                <div>
                    <label className="text-[9px] text-gray-600">Max</label>
                    <input
                        type="number"
                        value={config.max}
                        onChange={(e) => onChange({ ...config, max: Number(e.target.value) })}
                        className="w-full bg-[#111116] border border-gray-800 rounded text-xs text-white px-2 py-1.5 focus:outline-none focus:border-brand-purple"
                    />
                </div>
                <div>
                    <label className="text-[9px] text-gray-600">Step</label>
                    <input
                        type="number"
                        value={config.step ?? 1}
                        onChange={(e) => onChange({ ...config, step: Number(e.target.value) })}
                        className="w-full bg-[#111116] border border-gray-800 rounded text-xs text-white px-2 py-1.5 focus:outline-none focus:border-brand-purple"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                    <label className="text-[9px] text-gray-600">Min Label</label>
                    <input
                        type="text"
                        value={config.minLabel ?? ""}
                        onChange={(e) => onChange({ ...config, minLabel: e.target.value || undefined })}
                        placeholder="e.g. Poor"
                        className="w-full bg-[#111116] border border-gray-800 rounded text-xs text-white px-2 py-1.5 focus:outline-none focus:border-brand-purple placeholder-gray-600"
                    />
                </div>
                <div>
                    <label className="text-[9px] text-gray-600">Max Label</label>
                    <input
                        type="text"
                        value={config.maxLabel ?? ""}
                        onChange={(e) => onChange({ ...config, maxLabel: e.target.value || undefined })}
                        placeholder="e.g. Excellent"
                        className="w-full bg-[#111116] border border-gray-800 rounded text-xs text-white px-2 py-1.5 focus:outline-none focus:border-brand-purple placeholder-gray-600"
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Main Field Editor ───────────────────────────────────────────────────────

interface FieldEditorProps {
    fields: FormField[];
    onAdd: (field: FormField) => void;
    onUpdate: (index: number, field: FormField) => void;
    onRemove: (index: number) => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
}

export function FieldEditor({ fields, onAdd, onUpdate, onRemove, onReorder }: FieldEditorProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const handleAdd = () => {
        const newField = getDefaultField();
        onAdd(newField);
        setExpandedIndex(fields.length);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-gray-300">
                    Questions <span className="text-gray-600">({fields.length})</span>
                </label>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-1 text-[10px] text-brand-purple hover:text-brand-purple/80 transition-colors font-medium"
                >
                    <Plus className="w-3 h-3" /> Add Question
                </button>
            </div>

            {fields.length === 0 ? (
                <button
                    onClick={handleAdd}
                    className="w-full border border-dashed border-gray-800 rounded-lg p-6 text-center hover:border-gray-700 transition-colors group"
                >
                    <Plus className="w-5 h-5 text-gray-600 mx-auto mb-2 group-hover:text-brand-purple transition-colors" />
                    <p className="text-xs text-gray-500 group-hover:text-gray-400">Add your first question</p>
                </button>
            ) : (
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <FieldCard
                            key={index}
                            field={field}
                            index={index}
                            isExpanded={expandedIndex === index}
                            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
                            onChange={(f) => onUpdate(index, f)}
                            onRemove={() => {
                                onRemove(index);
                                if (expandedIndex === index) setExpandedIndex(null);
                            }}
                            onMoveUp={() => {
                                if (index > 0) {
                                    onReorder(index, index - 1);
                                    setExpandedIndex(index - 1);
                                }
                            }}
                            onMoveDown={() => {
                                if (index < fields.length - 1) {
                                    onReorder(index, index + 1);
                                    setExpandedIndex(index + 1);
                                }
                            }}
                            isFirst={index === 0}
                            isLast={index === fields.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
