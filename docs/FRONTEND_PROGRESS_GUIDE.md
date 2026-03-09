# Frontend Guide: Form Progress Indicator

## Overview

The backend now sends a `progressDetail` object in **every API response** — both when starting a chat and on every message. Your frontend developer can use this to render a progress bar, step indicator, or any progress UI.

---

## API Response Shape

### On Start (`POST /public/chat/:token/start`)

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "greeting": { ... },
    "formTitle": "Customer Feedback",
    "totalFields": 8,
    "estimatedMinutes": 3,
    "state": "IN_PROGRESS",
    "progressDetail": {
      "percentage": 0,
      "answeredCount": 0,
      "totalFields": 8,
      "currentFieldIndex": 0,
      "fields": [
        { "fieldId": "field_0", "label": "What is your name?", "status": "current", "questionNumber": 1 },
        { "fieldId": "field_1", "label": "Email address", "status": "upcoming", "questionNumber": 2 },
        { "fieldId": "field_2", "label": "Rate our service", "status": "upcoming", "questionNumber": 3 },
        ...
      ]
    }
  }
}
```

### On Every Message (`POST /public/chat/:token/message`)

```json
{
  "success": true,
  "data": {
    "reply": { ... },
    "state": "IN_PROGRESS",
    "progress": 25,
    "currentFieldIndex": 2,
    "totalFields": 8,
    "isComplete": false,
    "progressDetail": {
      "percentage": 25,
      "answeredCount": 2,
      "totalFields": 8,
      "currentFieldIndex": 2,
      "fields": [
        { "fieldId": "field_0", "label": "What is your name?", "status": "completed", "questionNumber": 1 },
        { "fieldId": "field_1", "label": "Email address", "status": "completed", "questionNumber": 2 },
        { "fieldId": "field_2", "label": "Rate our service", "status": "current", "questionNumber": 3 },
        { "fieldId": "field_3", "label": "Feedback", "status": "upcoming", "questionNumber": 4 },
        ...
      ]
    }
  }
}
```

---

## TypeScript Types (Copy to Frontend)

```typescript
interface FieldProgress {
  fieldId: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming' | 'skipped';
  questionNumber: number;   // 1-based
}

interface ProgressDetail {
  percentage: number;       // 0-100
  answeredCount: number;
  totalFields: number;
  currentFieldIndex: number; // 0-based
  fields: FieldProgress[];
}
```

---

## Implementation Examples

### 1. Simple Progress Bar (React)

```tsx
function ProgressBar({ progressDetail }: { progressDetail: ProgressDetail }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progressDetail.percentage}%` }}
      />
      <p className="text-sm text-gray-500 mt-1">
        {progressDetail.answeredCount} of {progressDetail.totalFields} questions answered
      </p>
    </div>
  );
}
```

### 2. Step Indicator (Dots/Circles)

```tsx
function StepIndicator({ progressDetail }: { progressDetail: ProgressDetail }) {
  return (
    <div className="flex items-center gap-1.5">
      {progressDetail.fields.map((field) => (
        <div
          key={field.fieldId}
          title={field.label}
          className={`
            w-2.5 h-2.5 rounded-full transition-all duration-300
            ${field.status === 'completed' ? 'bg-green-500' : ''}
            ${field.status === 'current'   ? 'bg-blue-500 ring-2 ring-blue-200 scale-125' : ''}
            ${field.status === 'upcoming'  ? 'bg-gray-300' : ''}
            ${field.status === 'skipped'   ? 'bg-yellow-400' : ''}
          `}
        />
      ))}
    </div>
  );
}
```

### 3. Numbered Steps with Labels (Good for ≤ 10 questions)

```tsx
function StepList({ progressDetail }: { progressDetail: ProgressDetail }) {
  return (
    <div className="space-y-2">
      {progressDetail.fields.map((field) => (
        <div key={field.fieldId} className="flex items-center gap-3">
          {/* Step number circle */}
          <div className={`
            w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
            ${field.status === 'completed' ? 'bg-green-500 text-white' : ''}
            ${field.status === 'current'   ? 'bg-blue-500 text-white'  : ''}
            ${field.status === 'upcoming'  ? 'bg-gray-200 text-gray-500' : ''}
          `}>
            {field.status === 'completed' ? '✓' : field.questionNumber}
          </div>
          {/* Label */}
          <span className={`text-sm ${
            field.status === 'current' ? 'font-semibold text-blue-700' :
            field.status === 'completed' ? 'text-green-700 line-through' :
            'text-gray-400'
          }`}>
            {field.label}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### 4. Compact Text Counter

```tsx
function ProgressCounter({ progressDetail }: { progressDetail: ProgressDetail }) {
  return (
    <span className="text-sm font-medium text-gray-600">
      Question {progressDetail.currentFieldIndex + 1} of {progressDetail.totalFields}
      {' '}({progressDetail.percentage}%)
    </span>
  );
}
```

---

## Integration Checklist

1. **Store `progressDetail` in your chat state** — update it after every API call (`start` and `message`).

2. **Choose a UI pattern** from above (or combine them). Recommendations:
   - **≤ 5 questions**: Step list with labels (pattern #3)
   - **6-15 questions**: Dot indicator (pattern #2) + progress bar (pattern #1)
   - **15+ questions**: Progress bar (pattern #1) + text counter (pattern #4)

3. **Place the indicator** either:
   - Above the chat window (fixed, always visible)
   - As a collapsible sidebar panel
   - Inline in the chat header

4. **Animate transitions** — use CSS `transition` on width/color for a smooth feel.

5. **Handle edge cases**:
   - `state === 'CLARIFYING'`: Progress doesn't change (same question being re-asked). Don't flash/jitter the indicator.
   - `state === 'CONFIRMING'`: Show 100% with a "Review answers" label.
   - `state === 'COMPLETED'`: Show 100% with a "Done!" state.
   - User edits an answer: Progress may temporarily decrease — animate smoothly.

---

## State-to-UI Mapping

| Backend State      | Progress Bar | Indicator Label           |
|--------------------|-------------|---------------------------|
| `IN_PROGRESS`      | 0-99%       | "Question X of Y"         |
| `CLARIFYING`       | Same as last| "Please clarify..."       |
| `CONFIRMING`       | 100%        | "Review your answers"     |
| `READY_TO_SUBMIT`  | 100%        | "Submitting..."           |
| `COMPLETED`        | 100%        | "Done!"                   |
| `ERROR`            | 100%        | "Submission failed"       |

---

## Sample React Hook

```typescript
import { useState, useCallback } from 'react';

interface ChatState {
  sessionId: string | null;
  messages: any[];
  progressDetail: ProgressDetail | null;
  state: string;
  isComplete: boolean;
}

export function useFormChat(token: string) {
  const [chat, setChat] = useState<ChatState>({
    sessionId: null,
    messages: [],
    progressDetail: null,
    state: 'IDLE',
    isComplete: false,
  });

  const startChat = useCallback(async () => {
    const res = await fetch(`/api/public/chat/${token}/start`, { method: 'POST' });
    const { data } = await res.json();

    setChat({
      sessionId: data.sessionId,
      messages: [data.greeting],
      progressDetail: data.progressDetail,
      state: data.state,
      isComplete: false,
    });
  }, [token]);

  const sendMessage = useCallback(async (message: string) => {
    if (!chat.sessionId) return;

    // Optimistically add user message
    setChat(prev => ({
      ...prev,
      messages: [...prev.messages, { sender: 'user', content: message }],
    }));

    const res = await fetch(`/api/public/chat/${token}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: chat.sessionId, message }),
    });
    const { data } = await res.json();

    setChat(prev => ({
      ...prev,
      messages: [...prev.messages, data.reply],
      progressDetail: data.progressDetail,
      state: data.state,
      isComplete: data.isComplete,
    }));
  }, [chat.sessionId, token]);

  return { ...chat, startChat, sendMessage };
}
```

Usage:
```tsx
function ChatPage({ token }: { token: string }) {
  const { messages, progressDetail, startChat, sendMessage } = useFormChat(token);

  useEffect(() => { startChat(); }, [startChat]);

  return (
    <div>
      {progressDetail && <ProgressBar progressDetail={progressDetail} />}
      {progressDetail && <StepIndicator progressDetail={progressDetail} />}
      <ChatMessages messages={messages} />
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
```
