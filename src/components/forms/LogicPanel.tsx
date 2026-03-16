import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Split, Save, ArrowRight, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { updateOrgForm } from '@/lib/api/organizations';
import { FormField, FormLogic, LogicRule } from '@/app/types/Form';

interface LogicPanelProps {
    orgId: string;
    formId: string;
    form: any;
    onUpdate: (updatedForm: any) => void;
}

const OPERATORS = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does not contain' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
];

export function LogicPanel({ orgId, formId, form, onUpdate }: LogicPanelProps) {
    const [logic, setLogic] = useState<FormLogic[]>(form.logic || []);
    const [isSaving, setIsSaving] = useState(false);

    // List of answerable fields
    const fields = form.fields.filter((f: FormField) => f.type !== 'SECTION_HEADER');

    const handleAddRule = (fieldId: string) => {
        const newLogic = [...logic];
        const existingFieldLogic = newLogic.find(l => l.fieldId === fieldId);

        const newRule: LogicRule = {
            operator: 'equals',
            value: '',
            targetFieldId: ''
        };

        if (existingFieldLogic) {
            existingFieldLogic.rules.push(newRule);
        } else {
            newLogic.push({
                fieldId,
                rules: [newRule]
            });
        }
        setLogic(newLogic);
    };

    const handleRemoveRule = (fieldId: string, ruleIndex: number) => {
        const newLogic = [...logic];
        const fieldLogicIndex = newLogic.findIndex(l => l.fieldId === fieldId);
        
        if (fieldLogicIndex !== -1) {
            newLogic[fieldLogicIndex].rules.splice(ruleIndex, 1);
            if (newLogic[fieldLogicIndex].rules.length === 0) {
                newLogic.splice(fieldLogicIndex, 1);
            }
            setLogic(newLogic);
        }
    };

    const handleUpdateRule = (fieldId: string, ruleIndex: number, updates: Partial<LogicRule>) => {
        const newLogic = [...logic];
        const fieldLogic = newLogic.find(l => l.fieldId === fieldId);
        if (fieldLogic) {
            fieldLogic.rules[ruleIndex] = { ...fieldLogic.rules[ruleIndex], ...updates };
            setLogic(newLogic);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Filter out rules with empty targets
            const cleanedLogic = logic.map(l => ({
                ...l,
                rules: l.rules.filter(r => r.targetFieldId !== '')
            })).filter(l => l.rules.length > 0);

            await updateOrgForm(orgId, formId, { logic: cleanedLogic });
            toast.success('Logic routing saved successfully');
            onUpdate({ ...form, logic: cleanedLogic });
        } catch (error: any) {
            toast.error(error.message || 'Failed to save logic');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-brand-purple" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium text-sm">Logic Jumps</h3>
                        <p className="text-gray-500 text-[11px]">Control the conversation flow based on user answers.</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-brand-purple hover:bg-[#0da372] text-white text-xs px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Logic
                </button>
            </div>

            <div className="space-y-8">
                {fields.map((field: FormField, fieldIdx: number) => {
                    const fieldLogic = logic.find(l => l.fieldId === field.id);
                    const subsequentFields = fields.slice(fieldIdx + 1);

                    return (
                        <div key={field.id} className="group">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-gray-900 px-2 py-0.5 rounded">Question {fieldIdx + 1}</span>
                                <h4 className="text-xs font-semibold text-gray-200 truncate max-w-[400px]">{field.label}</h4>
                            </div>

                            <div className="space-y-3 pl-4 border-l border-gray-800/50 ml-2">
                                {fieldLogic?.rules.map((rule, ruleIdx) => (
                                    <div key={ruleIdx} className="flex items-center gap-3 bg-black/30 border border-gray-800/40 rounded-lg p-3 group/rule">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">IF answer</span>
                                            <select
                                                value={rule.operator}
                                                onChange={(e) => handleUpdateRule(field.id, ruleIdx, { operator: e.target.value as any })}
                                                className="bg-[#111116] border border-gray-800 rounded px-2 py-1 text-[11px] text-gray-300 focus:outline-none focus:border-brand-purple"
                                            >
                                                {OPERATORS.map(op => (
                                                    <option key={op.value} value={op.value}>{op.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <input
                                            type="text"
                                            value={rule.value}
                                            onChange={(e) => handleUpdateRule(field.id, ruleIdx, { value: e.target.value })}
                                            placeholder="Value..."
                                            className="bg-[#111116] border border-gray-800 rounded px-3 py-1 text-[11px] text-white focus:outline-none focus:border-brand-purple flex-1 min-w-[100px]"
                                        />

                                        <div className="flex items-center gap-2">
                                            <ArrowRight className="w-3 h-3 text-brand-purple" />
                                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">Jump to</span>
                                            <select
                                                value={rule.targetFieldId}
                                                onChange={(e) => handleUpdateRule(field.id, ruleIdx, { targetFieldId: e.target.value })}
                                                className="bg-[#111116] border border-gray-800 rounded px-2 py-1 text-[11px] text-gray-300 focus:outline-none focus:border-brand-purple max-w-[150px]"
                                            >
                                                <option value="">Select target...</option>
                                                {subsequentFields.map((f: FormField) => (
                                                    <option key={f.id} value={f.id}>{f.label}</option>
                                                ))}
                                                <option value="END_OF_SURVEY">End of Survey</option>
                                            </select>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveRule(field.id, ruleIdx)}
                                            className="opacity-0 group-rule/hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() => handleAddRule(field.id)}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-brand-purple transition-colors uppercase tracking-widest py-1 px-2 rounded hover:bg-brand-purple/5"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add Conditional Jump
                                </button>
                            </div>
                        </div>
                    );
                })}

                {fields.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-800 rounded-lg">
                        <Split className="w-8 h-8 text-gray-700 mb-3" />
                        <p className="text-gray-500 text-xs">This form has no fields yet. Add some fields to enable logic jumps.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
