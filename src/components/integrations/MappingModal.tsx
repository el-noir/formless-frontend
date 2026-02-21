"use client";

import React, { useState } from "react";
import { watchGoogleForm } from "@/lib/api/integrations";
import { Loader2, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    form: any;
}

export function MappingModal({ isOpen, onClose, form }: MappingModalProps) {
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            // We no longer send 'fieldMappings' because we just want to ingest all fields directly
            const mappingData = {
                name: form.name,
                fieldMappings: {}, // Keep empty or remove entirely if backend allows
            };

            await watchGoogleForm(form.id, mappingData);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err: any) {
            console.error("Save error:", err);
            setError(err.message || err.response?.data?.message || err.statusText || "Failed to setup form sync.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

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
                    className="relative bg-[#1C1C24] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0B0B0F]/50">
                        <div>
                            <h2 className="text-xl font-bold text-white">Sync Google Form</h2>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-1">{form?.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex-grow">
                        {success ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Sync Active!</h3>
                                <p className="text-gray-400 text-center text-sm">
                                    We are now listening for new submissions on this form.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Clicking connect will setup a real-time sync with Google Forms. Any new submissions to <strong>{form?.name}</strong> will automatically appear in Formless with their original structure intact.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!success && (
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
                                {saving ? "Connecting..." : "Connect Form"}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
