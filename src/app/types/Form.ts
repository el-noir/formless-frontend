// ─── Form Sources & Status ───────────────────────────────────────────────────

export type FormSource = 'GOOGLE_FORMS' | 'INTERNAL' | 'AI_GENERATED' | 'TEMPLATE';
export type FormStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

// ─── Field Types ─────────────────────────────────────────────────────────────

export type FieldType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'MULTIPLE_CHOICE'
  | 'DROPDOWN'
  | 'CHECKBOXES'
  | 'LINEAR_SCALE'
  | 'DATE'
  | 'TIME'
  | 'SECTION_HEADER'
  | 'RATING'
  | 'NPS'
  | 'YES_NO'
  | 'PHONE'
  | 'EMAIL'
  | 'URL'
  | 'NUMBER'
  | 'RANKING'
  | 'FILE_UPLOAD'
  | 'STATEMENT';

// ─── Tones ───────────────────────────────────────────────────────────────────

export type FormTone = 'friendly' | 'professional' | 'concise' | 'gen_z' | 'witty' | 'empathetic' | 'hype' | 'chill';

export interface ToneOption {
  value: FormTone;
  label: string;
  description: string;
  icon: string;
  exampleGreeting: string;
  tags: string[];
}

// ─── Templates ───────────────────────────────────────────────────────────────

export type TemplateCategory =
  | 'lead_generation'
  | 'feedback'
  | 'survey'
  | 'registration'
  | 'application'
  | 'support'
  | 'order'
  | 'quiz'
  | 'hr'
  | 'education';

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  recommendedTone: FormTone;
  fieldCount: number;
  tags: string[];
  signature?: boolean;
  nicheSlug?: string;
  suggestedAiName?: string;
  suggestedWelcomeMessage?: string;
}

// ─── Field ───────────────────────────────────────────────────────────────────

export interface FieldOption {
  label: string;
  value?: string;
}

export interface ScaleConfig {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  step?: number;
}

export interface FieldValidation {
  type: 'EMAIL' | 'URL' | 'NUMBER' | 'REGEX' | 'TEXT_LENGTH' | 'CONTAINS';
  pattern?: string;
  min?: number;
  max?: number;
  message?: string;
}

export interface LogicRule {
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: any;
  targetFieldId: string;
}

export interface FormLogic {
  fieldId: string;
  rules: LogicRule[];
}

export interface FormField {
  id: string;
  entryId: string;
  label: string;
  type: FieldType;
  required: boolean;
  description?: string;
  placeholder?: string;
  options?: FieldOption[];
  scaleConfig?: ScaleConfig;
  validation?: FieldValidation;
}

// ─── Chat Config ─────────────────────────────────────────────────────────────

export interface ChatConfig {
  aiName?: string;
  tone?: FormTone;
  avatar?: string;
  welcomeMessage?: string;
  closingMessage?: string;
  customPersonality?: string;
  allowedDomains?: string[];
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface FormSettings {
  maxResponses?: number;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  showProgressBar?: boolean;
  shuffleFields?: boolean;
  notifyOnSubmission?: boolean;
  notificationEmail?: string;
  redirectUrl?: string;
  enablePartialResponses?: boolean;
  isPublished?: boolean;
}

// ─── Branding ────────────────────────────────────────────────────────────────

export interface FormBranding {
  primaryColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
  fontFamily?: string;
  buttonStyle?: 'rounded' | 'sharp' | 'pill';
  removeBranding?: boolean;
}

// ─── Create DTOs ─────────────────────────────────────────────────────────────

export interface CreateFormPayload {
  title: string;
  description?: string;
  fields: FormField[];
  chatConfig?: ChatConfig;
  settings?: FormSettings;
  branding?: FormBranding;
  tags?: string[];
}

export interface CreateFromTemplatePayload {
  templateId: string;
  title?: string;
  chatConfig?: ChatConfig;
  tags?: string[];
}

export interface AiGeneratePayload {
  prompt: string;
  tone?: FormTone;
  fieldCount?: number;
  context?: string;
  language?: string;
}

export interface AiGeneratedFormPreview {
  title: string;
  description: string;
  fields: FormField[];
  chatConfig: {
    aiName: string;
    tone: string;
    welcomeMessage: string;
    closingMessage: string;
  };
  tags: string[];
  fieldCount: number;
  estimatedMinutes: number;
}

export interface AiRefinePayload {
  instruction: string;
  currentForm: AiGeneratedFormPreview;
}

export interface AiSavePayload {
  preview: AiGeneratedFormPreview;
  tags?: string[];
  isPublished?: boolean;
}

export interface UpdateFormPayload {
  title?: string;
  description?: string;
  fields?: FormField[];
  chatConfig?: ChatConfig;
  settings?: FormSettings;
  branding?: FormBranding;
  logic?: FormLogic[];
  tags?: string[];
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface FormResponse {
  id: string;
  title: string;
  description: string;
  source: FormSource;
  status: FormStatus;
  questionCount: number;
  fields: FormField[];
  chatConfig: ChatConfig | null;
  chatLinkToken: string | null;
  settings: FormSettings | null;
  branding: FormBranding | null;
  logic: FormLogic[] | null;
  tags: string[];
  version: number;
  createdAt: string;
}

export interface FormListItem {
  id: string;
  title: string;
  description: string;
  source: FormSource;
  sourceFormId: string | null;
  sourceUrl: string | null;
  status: FormStatus;
  questionCount: number;
  submissionCount: number;
  conversationCount: number;
  completionRate: number | null;
  tone: FormTone | null;
  lastSynced: string | null;
  chatLinkToken: string | null;
  version: number;
  createdAt: string;
}
