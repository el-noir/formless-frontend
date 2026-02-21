"use client";

import React, { useEffect, useState } from "react";
import { getGoogleFormSchema, watchGoogleForm } from "@/lib/api/integrations";
import { Loader2, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    form: any;
}

// These are our app's internal fields we want to map to
const INTERNAL_FIELDS = [
    { id: "firstName", label: "First Name", required: true },
    { id: "lastName", label: "Last Name", required: true },
    { id: "email", label: "Email Address", required: true },
    { id: "organizationName", label: "Company Name", required: true },
    { id: "organizationPhone", label: "Phone Number", required: false },
];

export function MappingModal({ isOpen, onClose, form }: MappingModalProps) {
    const [schema, setSchema] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mapping state: key = internalFieldId, value = googleQuestionId
    const [mappings, setMappings] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && form) {
            fetchSchema();
            setSuccess(false);
            setError(null);
            setMappings({});
        }
    }, [isOpen, form]);

    const fetchSchema = async () => {
        try {
            setLoading(true);
            const data = await getGoogleFormSchema(form.id);
            setSchema(data);
        } catch (err: any) {
            setError("Failed to fetch form questions. Please check permissions.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            const mappingData = {
                name: form.name,
                fieldMappings: mappings,
            };

            await watchGoogleForm(form.id, mappingData);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save integration settings");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    // Extract questions from Google Form schema
    const getQuestions = () => {
        if (!schema || !schema.items) return [];
        return schema.items
            .filter((item: any) => item.questionItem) // Only want actual questions
            .map((item: any) => ({
                id: item.questionItem.question.questionId,
                title: item.title,
            }));
    };

    const questions = getQuestions();

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-[#1C1C24] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0B0B0F]/50">
                        <div>
                            <h2 className="text-xl font-bold text-white">Map Data Fields</h2>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-1">{form?.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-[#6E8BFF] mb-4" />
                                <p className="text-gray-400">Analyzing form structure...</p>
                            </div>
                        ) : success ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Integration Active!</h3>
                                <p className="text-gray-400 text-center">
                                    We are now listening for new submissions on this form.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="bg-[#6E8BFF]/10 border border-[#6E8BFF]/20 rounded-xl p-4 text-sm text-[#6E8BFF]">
                                    Map your Google Form questions to Formless internal fields. This ensures data is correctly formatted when it hits our database.
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 pb-2 border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
                                        <div>Formless Field</div>
                                        <div>Google Form Question</div>
                                    </div>

                                    {INTERNAL_FIELDS.map((field) => (
                                        <div key={field.id} className="grid grid-cols-2 gap-4 items-center bg-white/[0.02] p-3 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-200">{field.label}</span>
                                                {field.required && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Req</span>}
                                            </div>

                                            <select
                                                value={mappings[field.id] || ""}
                                                onChange={(e) => setMappings({ ...mappings, [field.id]: e.target.value })}
                                                className="w-full bg-[#0B0B0F] border border-white/10 text-sm text-white rounded-lg px-3 py-2.5 outline-none focus:border-[#6E8BFF]/50 transition-colors"
                                            >
                                                <option value="">-- Ignore this field --</option>
                                                {questions.map((q: any) => (
                                                    <option key={q.id} value={q.id}>
                                                        {q.title || "Untitled Question"}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && !success && (
                        <div className="p-6 border-t border-white/10 bg-[#0B0B0F]/50 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2.5 bg-gradient-to-r from-[#6E8BFF] to-[#9A6BFF] hover:shadow-[#6E8BFF]/20 hover:shadow-lg rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {saving ? "Saving..." : "Save & Activate mapping"}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
