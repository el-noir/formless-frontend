export type ChatRole = 'user' | 'assistant';

export interface FieldProgress {
    fieldId: string;
    label: string;
    status: 'completed' | 'current' | 'upcoming' | 'skipped';
    questionNumber: number;
}

export interface ProgressDetail {
    percentage: number;
    answeredCount: number;
    totalFields: number;
    currentFieldIndex: number;
    fields: FieldProgress[];
}

export interface Message {
    role: ChatRole;
    content: string;
    timestamp?: string;
    progress?: number;
    state?: string;
    fieldSummaries?: Array<{
        label: string;
        value: string;
        fieldId: string;
    }>;
}
