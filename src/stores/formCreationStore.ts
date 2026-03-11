'use client';
import { create } from 'zustand';
import type {
    FormField,
    ChatConfig,
    FormSettings,
    FormBranding,
    FormTone,
    AiGeneratedFormPreview,
    ToneOption,
    TemplateSummary,
} from '@/app/types/Form';

// ─── Creation Method ─────────────────────────────────────────────────────────

export type CreationMethod = 'scratch' | 'template' | 'ai' | null;

// ─── Store State ─────────────────────────────────────────────────────────────

interface FormCreationState {
    // Current creation flow
    method: CreationMethod;
    step: number; // 0 = method select, 1+ = flow-specific steps

    // Scratch form state
    title: string;
    description: string;
    fields: FormField[];
    chatConfig: ChatConfig;
    settings: FormSettings;
    branding: FormBranding;
    tags: string[];

    // Template state
    selectedTemplateId: string | null;

    // AI state
    aiPrompt: string;
    aiContext: string;
    aiFieldCount: number;
    aiPreview: AiGeneratedFormPreview | null;
    aiRefineInstruction: string;

    // Config data (loaded from API)
    tones: ToneOption[];
    templates: TemplateSummary[];

    // UI state
    isSubmitting: boolean;
    error: string | null;

    // Actions — Navigation
    setMethod: (method: CreationMethod) => void;
    setStep: (step: number) => void;
    reset: () => void;

    // Actions — Scratch form
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    addField: (field: FormField) => void;
    updateField: (index: number, field: FormField) => void;
    removeField: (index: number) => void;
    reorderFields: (fromIndex: number, toIndex: number) => void;
    setChatConfig: (config: Partial<ChatConfig>) => void;
    setSettings: (settings: Partial<FormSettings>) => void;
    setBranding: (branding: Partial<FormBranding>) => void;
    setTags: (tags: string[]) => void;

    // Actions — Template
    setSelectedTemplateId: (id: string | null) => void;

    // Actions — AI
    setAiPrompt: (prompt: string) => void;
    setAiContext: (context: string) => void;
    setAiFieldCount: (count: number) => void;
    setAiPreview: (preview: AiGeneratedFormPreview | null) => void;
    setAiRefineInstruction: (instruction: string) => void;

    // Actions — Config data
    setTones: (tones: ToneOption[]) => void;
    setTemplates: (templates: TemplateSummary[]) => void;

    // Actions — UI
    setIsSubmitting: (isSubmitting: boolean) => void;
    setError: (error: string | null) => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_CHAT_CONFIG: ChatConfig = {
    aiName: 'Alex',
    tone: 'friendly',
    welcomeMessage: '',
    closingMessage: '',
};

const DEFAULT_SETTINGS: FormSettings = {
    showProgressBar: true,
    isPublished: false,
};

const DEFAULT_BRANDING: FormBranding = {
    primaryColor: '#6366f1',
    backgroundColor: '#f8fafc',
    fontFamily: 'Inter',
    buttonStyle: 'rounded',
};

const INITIAL_STATE = {
    method: null as CreationMethod,
    step: 0,
    title: '',
    description: '',
    fields: [] as FormField[],
    chatConfig: { ...DEFAULT_CHAT_CONFIG },
    settings: { ...DEFAULT_SETTINGS },
    branding: { ...DEFAULT_BRANDING },
    tags: [] as string[],
    selectedTemplateId: null as string | null,
    aiPrompt: '',
    aiContext: '',
    aiFieldCount: 7,
    aiPreview: null as AiGeneratedFormPreview | null,
    aiRefineInstruction: '',
    tones: [] as ToneOption[],
    templates: [] as TemplateSummary[],
    isSubmitting: false,
    error: null as string | null,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useFormCreationStore = create<FormCreationState>()((set, get) => ({
    ...INITIAL_STATE,

    // Navigation
    setMethod: (method) => set({ method, step: 1, error: null }),
    setStep: (step) => set({ step }),
    reset: () => set({ ...INITIAL_STATE }),

    // Scratch form
    setTitle: (title) => set({ title }),
    setDescription: (description) => set({ description }),
    addField: (field) => set((s) => ({ fields: [...s.fields, field] })),
    updateField: (index, field) =>
        set((s) => {
            const fields = [...s.fields];
            fields[index] = field;
            return { fields };
        }),
    removeField: (index) =>
        set((s) => ({ fields: s.fields.filter((_, i) => i !== index) })),
    reorderFields: (fromIndex, toIndex) =>
        set((s) => {
            const fields = [...s.fields];
            const [moved] = fields.splice(fromIndex, 1);
            fields.splice(toIndex, 0, moved);
            return { fields };
        }),
    setChatConfig: (config) =>
        set((s) => ({ chatConfig: { ...s.chatConfig, ...config } })),
    setSettings: (settings) =>
        set((s) => ({ settings: { ...s.settings, ...settings } })),
    setBranding: (branding) =>
        set((s) => ({ branding: { ...s.branding, ...branding } })),
    setTags: (tags) => set({ tags }),

    // Template
    setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),

    // AI
    setAiPrompt: (aiPrompt) => set({ aiPrompt }),
    setAiContext: (aiContext) => set({ aiContext }),
    setAiFieldCount: (aiFieldCount) => set({ aiFieldCount }),
    setAiPreview: (aiPreview) => set({ aiPreview }),
    setAiRefineInstruction: (aiRefineInstruction) => set({ aiRefineInstruction }),

    // Config data
    setTones: (tones) => set({ tones }),
    setTemplates: (templates) => set({ templates }),

    // UI
    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
    setError: (error) => set({ error }),
}));
