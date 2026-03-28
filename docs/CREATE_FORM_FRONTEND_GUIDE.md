# Frontend Guide: Create Form — Core Functionality & Endpoints

> **Base URL:** `http://localhost:4000/api`  
> **Auth:** All endpoints require `Authorization: Bearer <JWT>`  
> **Scope:** All endpoints are under `/organizations/:orgId/forms/...`  
> **Role:** Create/update/delete/publish require **admin+** role. Read endpoints are **member+**.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Three Creation Flows](#2-three-creation-flows)
3. [Endpoints — Config (Tones & Templates)](#3-endpoints--config-tones--templates)
4. [Endpoints — Create from Scratch](#4-endpoints--create-from-scratch)
5. [Endpoints — Create from Template](#5-endpoints--create-from-template)
6. [Endpoints — AI Generate Flow](#6-endpoints--ai-generate-flow)
7. [Endpoints — Update Form](#7-endpoints--update-form)
8. [Endpoints — Lifecycle (Publish / Unpublish / Duplicate / Delete)](#8-endpoints--lifecycle)
9. [Endpoints — List & Get Form](#9-endpoints--list--get-form)
10. [Endpoints — Chat Link & Analytics](#10-endpoints--chat-link--analytics)
11. [TypeScript Types (Copy to Frontend)](#11-typescript-types-copy-to-frontend)
12. [Flow Diagrams](#12-flow-diagrams)
13. [Tone System Deep Dive](#13-tone-system-deep-dive)
14. [Template System Deep Dive](#14-template-system-deep-dive)
15. [Field Types Reference](#15-field-types-reference)
16. [Branding & Settings Reference](#16-branding--settings-reference)
17. [Error Handling](#17-error-handling)
18. [End-to-End Example Flows](#18-end-to-end-example-flows)

---

## 1. Architecture Overview

Forms can now be created in 3 ways:

| Method | Source saved in DB | How it works |
|---|---|---|
| **Google Forms Import** (existing) | `GOOGLE_FORMS` | User pastes a Google Forms URL, backend extracts schema |
| **Create from Scratch** (new) | `INTERNAL` | User manually defines title, fields, tone, settings |
| **Create from Template** (new) | `TEMPLATE` | User picks a pre-built template, optionally overrides |
| **AI Generate** (new) | `AI_GENERATED` | User describes what they want in plain English, AI builds it |

All forms — regardless of source — go through the same conversational chat engine. The tone/personality you set determines how the AI talks to the respondent.

### Form Lifecycle

```
DRAFT → ACTIVE → DRAFT (toggle publishable)
          ↓
      [Users fill it via chat link]
          ↓
      [Analytics tracked]
```

- New forms start as **DRAFT** (unless `isPublished: true` is set)
- Publishing flips status to **ACTIVE** and auto-generates a chat link
- Unpublishing flips back to **DRAFT** — existing chat links stop working
- Only ACTIVE forms accept responses via the public chat

---

## 2. Three Creation Flows

### Flow A: Create from Scratch

```
Frontend                          Backend
  │                                 │
  ├─ GET /config/tones ────────────→│ (load tone picker options)
  │←────── tone list ──────────────┤
  │                                 │
  ├─ [User builds form fields,      │
  │   selects tone, configures       │
  │   settings, branding]            │
  │                                 │
  ├─ POST /create ─────────────────→│ (send full form payload)
  │←────── created form ───────────┤
  │                                 │
  ├─ POST /:formId/publish ────────→│ (optional: go live immediately)
  │←────── { status: ACTIVE } ─────┤
  │                                 │
  ├─ POST /:formId/chat-link ─────→│ (get shareable link)
  │←────── { token, url } ─────────┤
```

### Flow B: Create from Template

```
Frontend                          Backend
  │                                 │
  ├─ GET /config/templates ────────→│ (load template library)
  │←────── template list ──────────┤
  │                                 │
  ├─ [User picks template,          │
  │   optionally overrides title     │
  │   or tone]                       │
  │                                 │
  ├─ POST /create-from-template ───→│
  │←────── created form ───────────┤
  │                                 │
  ├─ PUT /:formId ─────────────────→│ (optional: customize fields)
  │←────── updated form ───────────┤
  │                                 │
  ├─ POST /:formId/publish ────────→│
```

### Flow C: AI Generate

```
Frontend                          Backend
  │                                 │
  ├─ POST /ai-generate ───────────→│ (user describes form in English)
  │←────── preview (NOT saved) ────┤
  │                                 │
  ├─ [User reviews preview,         │
  │   optionally requests changes]   │
  │                                 │
  ├─ POST /ai-refine ─────────────→│ (optional: "make it shorter", etc.)
  │←────── refined preview ────────┤
  │                                 │
  ├─ [User happy with preview]       │
  │                                 │
  ├─ POST /ai-save ───────────────→│ (persist as real form)
  │←────── created form ───────────┤
  │                                 │
  ├─ POST /:formId/publish ────────→│
```

> **Key insight for AI flow:** `ai-generate` and `ai-refine` do NOT save anything to the database. They return a preview object. Only `ai-save` persists it. The frontend should hold the preview in state and let the user edit/refine before saving.

---

## 3. Endpoints — Config (Tones & Templates)

### GET `/organizations/:orgId/forms/config/tones`

Returns all available conversation tones for the tone picker.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": "friendly",
      "label": "Friendly",
      "description": "Warm and approachable — like chatting with a helpful friend",
      "icon": "😊",
      "exampleGreeting": "Hey there! 👋 I'm so glad you're here. Let's get started — what's your name?",
      "tags": ["casual", "warm", "default"]
    },
    {
      "value": "professional",
      "label": "Professional",
      "description": "Polished and business-ready — perfect for corporate forms",
      "icon": "💼",
      "exampleGreeting": "Welcome. Thank you for taking the time to complete this. Let's begin — may I have your full name?",
      "tags": ["formal", "corporate", "business"]
    },
    {
      "value": "concise",
      "label": "Concise",
      "description": "Straight to the point — no fluff, maximum efficiency",
      "icon": "⚡",
      "exampleGreeting": "Hi. Let's get started. Your name?",
      "tags": ["minimal", "fast", "efficient"]
    },
    {
      "value": "gen_z",
      "label": "Gen Z",
      "description": "Internet-native energy — slang, vibes, and zero cringe",
      "icon": "🔥",
      "exampleGreeting": "yooo welcome 🔥 let's get this done real quick — first things first, what's your name? 👀",
      "tags": ["slang", "internet", "youth", "casual"]
    },
    {
      "value": "witty",
      "label": "Witty",
      "description": "Clever humor and playful banter — makes forms actually fun",
      "icon": "😏",
      "exampleGreeting": "Well, well, well... look who decided to fill out a form today. 😏 Don't worry, I'll make this painless. Let's start easy — what's your name?",
      "tags": ["humor", "clever", "playful", "fun"]
    },
    {
      "value": "empathetic",
      "label": "Empathetic",
      "description": "Warm and understanding — ideal for sensitive or emotional topics",
      "icon": "💜",
      "exampleGreeting": "Hi there 💛 Thank you so much for being here. I'd love to learn a bit about you — let's start with your name, if that's okay?",
      "tags": ["caring", "sensitive", "supportive", "warm"]
    },
    {
      "value": "hype",
      "label": "Hype",
      "description": "Maximum energy and enthusiasm — like your most excited friend",
      "icon": "🚀",
      "exampleGreeting": "YOOO welcome!! 🎉 This is gonna be awesome, I promise! Let's kick things off — what's your name?! 🚀",
      "tags": ["energetic", "enthusiastic", "motivational", "exciting"]
    },
    {
      "value": "chill",
      "label": "Chill",
      "description": "Relaxed and low-pressure — laid-back vibes only",
      "icon": "🌊",
      "exampleGreeting": "hey ✌️ thanks for stopping by. no rush or anything — let's just ease into this. what's your name?",
      "tags": ["relaxed", "calm", "lowkey", "easygoing"]
    }
  ]
}
```

**Frontend usage:** Render as a tone picker grid/carousel. Each card shows `icon`, `label`, `description`, and `exampleGreeting` as a preview bubble.

---

### GET `/organizations/:orgId/forms/config/templates`

Returns available form templates. Optionally filter by category.

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `category` | string | No | Filter by category (see list below) |

**Categories:** `lead_generation`, `feedback`, `survey`, `registration`, `application`, `support`, `order`, `quiz`, `hr`, `education`

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "lead-gen-basic",
      "name": "Lead Capture",
      "description": "Capture visitor info — name, email, company, and what they need",
      "category": "lead_generation",
      "icon": "🎯",
      "recommendedTone": "friendly",
      "fieldCount": 7,
      "tags": ["leads", "sales", "b2b", "contact"]
    },
    {
      "id": "customer-feedback",
      "name": "Customer Feedback",
      "description": "Collect product/service feedback with NPS and detailed comments",
      "category": "feedback",
      "icon": "⭐",
      "recommendedTone": "empathetic",
      "fieldCount": 7,
      "tags": ["feedback", "nps", "customer", "satisfaction"]
    }
  ]
}
```

**Full template list (10 templates):**

| ID | Name | Category | Tone | Fields |
|---|---|---|---|---|
| `lead-gen-basic` | Lead Capture | lead_generation | friendly | 7 |
| `customer-feedback` | Customer Feedback | feedback | empathetic | 7 |
| `event-registration` | Event Registration | registration | hype | 7 |
| `job-application` | Job Application | application | professional | 9 |
| `support-ticket` | Support Ticket | support | empathetic | 7 |
| `product-order` | Product Order | order | friendly | 8 |
| `employee-satisfaction` | Employee Satisfaction | hr | chill | 7 |
| `course-feedback` | Course Feedback | education | gen_z | 7 |
| `quick-quiz` | Quick Quiz | quiz | witty | 5 |
| `market-research` | Market Research | survey | chill | 7 |

---

## 4. Endpoints — Create from Scratch

### POST `/organizations/:orgId/forms/create`

Creates a new conversational AI form with explicit fields.

**Role:** admin+

**Request Body:**
```json
{
  "title": "Customer Feedback Survey",
  "description": "Help us improve by sharing your experience",
  "fields": [
    {
      "label": "What is your name?",
      "type": "SHORT_TEXT",
      "required": true,
      "placeholder": "e.g. Jane Smith"
    },
    {
      "label": "Email Address",
      "type": "SHORT_TEXT",
      "required": true,
      "validation": { "type": "EMAIL" }
    },
    {
      "label": "How would you rate our service?",
      "type": "LINEAR_SCALE",
      "required": true,
      "scaleConfig": {
        "min": 1,
        "max": 5,
        "minLabel": "Terrible",
        "maxLabel": "Amazing",
        "step": 1
      }
    },
    {
      "label": "What did you enjoy most?",
      "type": "MULTIPLE_CHOICE",
      "required": false,
      "options": [
        { "label": "Speed", "value": "speed" },
        { "label": "Quality", "value": "quality" },
        { "label": "Price", "value": "price" },
        { "label": "Customer Service", "value": "support" }
      ]
    },
    {
      "label": "Any additional feedback?",
      "type": "LONG_TEXT",
      "required": false,
      "placeholder": "Tell us anything..."
    }
  ],
  "chatConfig": {
    "aiName": "Alex",
    "tone": "gen_z",
    "welcomeMessage": "yooo welcome! 🔥 let's get your feedback real quick",
    "closingMessage": "thanks for the feedback, you're a legend ✌️",
    "customPersonality": null
  },
  "settings": {
    "showProgressBar": true,
    "maxResponses": 500,
    "notifyOnSubmission": true,
    "notificationEmail": "admin@company.com",
    "isPublished": false
  },
  "branding": {
    "primaryColor": "#6366f1",
    "backgroundColor": "#f8fafc",
    "fontFamily": "Inter",
    "buttonStyle": "rounded"
  },
  "tags": ["feedback", "survey"]
}
```

**Required fields in body:** `title`, `fields` (at least 1 field)  
**Everything else is optional** — the backend applies sensible defaults.

**Minimal request (bare minimum):**
```json
{
  "title": "Quick Survey",
  "fields": [
    { "label": "What's your name?", "type": "SHORT_TEXT", "required": true },
    { "label": "Any feedback?", "type": "LONG_TEXT", "required": true }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Form created successfully",
  "data": {
    "id": "684a2b3c...",
    "title": "Customer Feedback Survey",
    "description": "Help us improve by sharing your experience",
    "source": "INTERNAL",
    "status": "DRAFT",
    "questionCount": 5,
    "fields": [ ... ],
    "chatConfig": {
      "aiName": "Alex",
      "tone": "gen_z",
      "welcomeMessage": "yooo welcome! 🔥 let's get your feedback real quick",
      "closingMessage": "thanks for the feedback, you're a legend ✌️"
    },
    "chatLinkToken": null,
    "settings": { ... },
    "branding": { ... },
    "tags": ["feedback", "survey"],
    "version": 1,
    "createdAt": "2026-03-11T10:00:00.000Z"
  }
}
```

---

## 5. Endpoints — Create from Template

### POST `/organizations/:orgId/forms/create-from-template`

Creates a form from a pre-built template. Optionally override title, tone, or tags.

**Role:** admin+

**Request Body:**
```json
{
  "templateId": "customer-feedback",
  "title": "Q1 2026 Feedback Form",
  "chatConfig": {
    "aiName": "Sam",
    "tone": "empathetic"
  },
  "tags": ["q1", "feedback"]
}
```

**Only `templateId` is required.** If `title` is omitted, the template's default name is used.

**Minimal request:**
```json
{
  "templateId": "lead-gen-basic"
}
```

**Response (201):** Same shape as create from scratch response.

---

## 6. Endpoints — AI Generate Flow

This is a **3-step flow**: Generate → (optional) Refine → Save.

### Step 1: POST `/organizations/:orgId/forms/ai-generate`

Generate a form preview from a natural language description. **Does NOT save to database.**

**Role:** admin+

**Request Body:**
```json
{
  "prompt": "Create a customer feedback form for a coffee shop. Ask about their drink, experience, staff friendliness, and if they'd come back.",
  "tone": "gen_z",
  "fieldCount": 7,
  "context": "We're a specialty coffee shop in Brooklyn targeting young professionals",
  "language": "en"
}
```

**Only `prompt` is required** (min 10 chars, max 2000 chars).

| Field | Type | Required | Description |
|---|---|---|---|
| `prompt` | string | Yes | Natural language description of the form |
| `tone` | string | No | Preferred tone (e.g. `gen_z`, `friendly`, `professional`) |
| `fieldCount` | number | No | Approximate field count (1-50). AI optimizes around this. |
| `context` | string | No | Business/audience context to improve generation quality |
| `language` | string | No | ISO 639-1 language code (default: `en`) |

**Response (200):**
```json
{
  "success": true,
  "message": "Form generated by AI — review and save when ready",
  "data": {
    "title": "Brooklyn Bean Feedback ☕",
    "description": "Tell us about your coffee experience — we're all ears!",
    "fields": [
      {
        "label": "What drink did you get today?",
        "type": "SHORT_TEXT",
        "required": true,
        "placeholder": "e.g. Oat milk latte"
      },
      {
        "label": "How was the overall vibe?",
        "type": "LINEAR_SCALE",
        "required": true,
        "scaleConfig": {
          "min": 1,
          "max": 5,
          "minLabel": "Not great",
          "maxLabel": "Immaculate vibes",
          "step": 1
        }
      },
      {
        "label": "How friendly was the staff?",
        "type": "LINEAR_SCALE",
        "required": true,
        "scaleConfig": {
          "min": 1,
          "max": 5,
          "minLabel": "Meh",
          "maxLabel": "Absolute legends",
          "step": 1
        }
      },
      {
        "label": "What did you love most?",
        "type": "MULTIPLE_CHOICE",
        "required": false,
        "options": [
          { "label": "The coffee", "value": "coffee" },
          { "label": "The atmosphere", "value": "atmosphere" },
          { "label": "The staff", "value": "staff" },
          { "label": "The music", "value": "music" },
          { "label": "Everything tbh", "value": "everything" }
        ]
      },
      {
        "label": "Would you come back?",
        "type": "MULTIPLE_CHOICE",
        "required": true,
        "options": [
          { "label": "Absolutely!", "value": "yes" },
          { "label": "Maybe", "value": "maybe" },
          { "label": "Probably not", "value": "no" }
        ]
      },
      {
        "label": "Anything else you want us to know?",
        "type": "LONG_TEXT",
        "required": false,
        "placeholder": "spill the tea ☕"
      }
    ],
    "chatConfig": {
      "aiName": "Bean",
      "tone": "gen_z",
      "welcomeMessage": "yooo welcome to Brooklyn Bean! ☕🔥 let's hear about your visit real quick",
      "closingMessage": "thanks for the feedback bestie ✌️ see you next time!"
    },
    "tags": ["coffee", "feedback", "brooklyn"],
    "fieldCount": 6,
    "estimatedMinutes": 2
  }
}
```

> **IMPORTANT:** This `data` object is the **preview**. Hold it in frontend state. The user should be able to view, edit inline, and then either refine or save.

---

### Step 2 (Optional): POST `/organizations/:orgId/forms/ai-refine`

Send follow-up instructions to modify the preview. Useful for iterative design.

**Role:** admin+

**Request Body:**
```json
{
  "instruction": "Make it shorter — remove the staff question and add a question about their favorite menu item. Also make the tone more chill.",
  "currentForm": {
    "title": "Brooklyn Bean Feedback ☕",
    "description": "Tell us about your coffee experience — we're all ears!",
    "fields": [ ... ],
    "chatConfig": { ... },
    "tags": ["coffee", "feedback", "brooklyn"],
    "fieldCount": 6,
    "estimatedMinutes": 2
  }
}
```

`currentForm` is the **full preview object** from the previous `ai-generate` or `ai-refine` call.

**Response (200):** Same shape as `ai-generate` response — a new refined preview.

> The frontend can call `ai-refine` multiple times in a loop. Each time, pass the latest `data` object as `currentForm`.

---

### Step 3: POST `/organizations/:orgId/forms/ai-save`

Persist the AI preview as a real form in the database.

**Role:** admin+

**Request Body:**
```json
{
  "preview": {
    "title": "Brooklyn Bean Feedback ☕",
    "description": "Tell us about your coffee experience",
    "fields": [ ... ],
    "chatConfig": {
      "aiName": "Bean",
      "tone": "gen_z",
      "welcomeMessage": "yooo welcome! ☕🔥",
      "closingMessage": "thanks bestie ✌️"
    },
    "tags": ["coffee", "feedback"],
    "fieldCount": 5,
    "estimatedMinutes": 2
  },
  "tags": ["coffee", "feedback", "q1"],
  "isPublished": false
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `preview` | object | Yes | The full preview object from ai-generate/ai-refine |
| `tags` | string[] | No | Override tags (otherwise uses preview's tags) |
| `isPublished` | boolean | No | Publish immediately? (default: false → DRAFT) |

**Response (201):** Same shape as create from scratch response.

---

## 7. Endpoints — Update Form

### PUT `/organizations/:orgId/forms/:formId`

Update any aspect of an existing form — fields, config, settings, branding, or metadata.

**Role:** admin+

**All fields are optional.** Only send what you want to change.

**Request Body:**
```json
{
  "title": "Updated Survey Title",
  "description": "New description",
  "fields": [
    { "label": "New Question 1", "type": "SHORT_TEXT", "required": true },
    { "label": "New Question 2", "type": "LONG_TEXT", "required": false }
  ],
  "chatConfig": {
    "tone": "witty",
    "aiName": "Sage"
  },
  "settings": {
    "maxResponses": 200,
    "notifyOnSubmission": true
  },
  "branding": {
    "primaryColor": "#ef4444"
  },
  "tags": ["updated", "v2"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Form updated to v2",
  "data": {
    "id": "684a2b3c...",
    "title": "Updated Survey Title",
    "version": 2,
    ...
  }
}
```

> The `version` field increments on every update. Use it for display ("v2") or optimistic concurrency.

---

## 8. Endpoints — Lifecycle

### POST `/organizations/:orgId/forms/:formId/duplicate`

Creates an exact copy of a form as a new **DRAFT**.

**Role:** admin+

**Request Body:** None

**Response (201):**
```json
{
  "success": true,
  "message": "Form duplicated as draft",
  "data": {
    "id": "685b3c4d...",
    "title": "Customer Feedback Survey (Copy)",
    "status": "DRAFT",
    "source": "INTERNAL",
    ...
  }
}
```

---

### POST `/organizations/:orgId/forms/:formId/publish`

Publish a draft form. Changes status to `ACTIVE` and auto-generates a chat link if one doesn't exist.

**Role:** admin+

**Request Body:** None

**Response (200):**
```json
{
  "success": true,
  "message": "Form published",
  "data": {
    "id": "684a2b3c...",
    "status": "ACTIVE"
  }
}
```

---

### POST `/organizations/:orgId/forms/:formId/unpublish`

Reverts a form back to **DRAFT**. The chat link stops working until re-published.

**Role:** admin+

**Request Body:** None

**Response (200):**
```json
{
  "success": true,
  "message": "Form unpublished",
  "data": {
    "id": "684a2b3c...",
    "status": "DRAFT"
  }
}
```

---

### DELETE `/organizations/:orgId/forms/:formId`

Permanently delete a form.

**Role:** admin+

**Response (200):**
```json
{
  "success": true,
  "message": "Form removed from organization"
}
```

---

## 9. Endpoints — List & Get Form

### GET `/organizations/:orgId/forms`

List all forms in the org. Supports filtering and pagination.

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `status` | string | - | Filter by status: `DRAFT`, `ACTIVE`, `PAUSED` |
| `source` | string | - | Filter by source: `GOOGLE_FORMS`, `INTERNAL`, `AI_GENERATED`, `TEMPLATE` |
| `search` | string | - | Fuzzy search by title |
| `limit` | number | 20 | Results per page |
| `offset` | number | 0 | Skip N results |

**Response:**
```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "forms": [
    {
      "id": "684a2b3c...",
      "title": "Customer Feedback Survey",
      "description": "Help us improve...",
      "source": "INTERNAL",
      "sourceFormId": null,
      "sourceUrl": null,
      "status": "ACTIVE",
      "questionCount": 5,
      "submissionCount": 47,
      "conversationCount": 62,
      "completionRate": 75.8,
      "tone": "gen_z",
      "lastSynced": null,
      "chatLinkToken": "abc123",
      "version": 2,
      "createdAt": "2026-03-11T10:00:00.000Z"
    },
    {
      "id": "685b3c4d...",
      "title": "Event Registration",
      "source": "TEMPLATE",
      "status": "DRAFT",
      "tone": "hype",
      "completionRate": null,
      "version": 1,
      ...
    }
  ]
}
```

**Frontend notes:**
- `source` tells you what badge/icon to show (AI ✨, Template 📋, Google Forms 🔗, Internal 🏠)
- `completionRate` is `null` if no analytics yet
- `chatLinkToken` is `null` if no link has been generated
- `conversationCount` = total conversations started (including abandoned)
- `submissionCount` = successfully submitted responses

---

### GET `/organizations/:orgId/forms/:formId`

Get full form details including all fields, settings, branding, and analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "684a2b3c...",
    "title": "Customer Feedback Survey",
    "description": "Help us improve...",
    "source": "INTERNAL",
    "sourceUrl": null,
    "publicUrl": null,
    "status": "ACTIVE",
    "metadata": {
      "questionCount": 5,
      "pageCount": 1,
      "acceptingResponses": true,
      "estimatedCompletionMinutes": 2
    },
    "tags": ["feedback", "survey"],
    "fields": [
      {
        "id": "field_0",
        "label": "What is your name?",
        "type": "SHORT_TEXT",
        "required": true,
        "description": null,
        "placeholder": "e.g. Jane Smith",
        "options": [],
        "order": 0,
        "sectionIndex": 0
      },
      {
        "id": "field_1",
        "label": "How would you rate our service?",
        "type": "LINEAR_SCALE",
        "required": true,
        "scaleConfig": { "min": 1, "max": 5, "minLabel": "Poor", "maxLabel": "Excellent", "step": 1 },
        "order": 1,
        "sectionIndex": 0
      }
    ],
    "lastSynced": null,
    "conversationCount": 62,
    "submissionCount": 47,
    "chatConfig": {
      "aiName": "Alex",
      "tone": "gen_z",
      "avatar": null,
      "welcomeMessage": "yooo welcome! 🔥",
      "closingMessage": "thanks legend ✌️",
      "customPersonality": null,
      "allowedDomains": []
    },
    "chatLinkToken": "abc123",
    "chatLinkExpiresAt": null,
    "settings": {
      "maxResponses": 500,
      "scheduledStartAt": null,
      "scheduledEndAt": null,
      "showProgressBar": true,
      "shuffleFields": false,
      "notifyOnSubmission": true,
      "notificationEmail": "admin@company.com",
      "redirectUrl": null,
      "enablePartialResponses": false,
      "isPublished": true
    },
    "branding": {
      "primaryColor": "#6366f1",
      "backgroundColor": "#f8fafc",
      "logoUrl": null,
      "fontFamily": "Inter",
      "buttonStyle": "rounded",
      "removeBranding": false
    },
    "analytics": {
      "totalConversations": 62,
      "totalCompleted": 47,
      "totalAbandoned": 15,
      "avgCompletionTimeSec": 58,
      "completionRate": 75.8,
      "dropOffByField": {
        "field_2": 8,
        "field_3": 5,
        "field_4": 2
      },
      "avgFieldTimeSec": {
        "field_0": 5,
        "field_1": 8,
        "field_2": 15,
        "field_3": 12,
        "field_4": 18
      },
      "lastCalculatedAt": "2026-03-11T14:30:00.000Z"
    },
    "version": 2
  }
}
```

---

## 10. Endpoints — Chat Link & Analytics

### POST `/organizations/:orgId/forms/:formId/chat-link`

Generate or retrieve the public chat link for a form.

**Role:** admin+

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "abc123",
    "url": "/chat/abc123"
  }
}
```

Build the full URL client-side: `https://your-domain.com/chat/abc123`

---

### PATCH `/organizations/:orgId/forms/:formId/link-expiry`

Set or clear the chat link expiry.

**Role:** admin+

**Request Body:**
```json
{ "expiresAt": "2026-04-01T00:00:00.000Z" }
```

Or to clear: `{ "expiresAt": null }`

---

### PATCH `/organizations/:orgId/forms/:formId/chat-config`

Update just the chat configuration (tone, AI name, avatar, welcome message, allowed domains) without touching fields.

**Role:** admin+

**Request Body:**
```json
{
  "aiName": "Alex",
  "tone": "gen_z",
  "avatar": "https://example.com/avatar.png",
  "welcomeMessage": "yooo let's go 🔥",
  "allowedDomains": ["mysite.com", "*.mysite.com"]
}
```

---

### GET `/organizations/:orgId/forms/:formId/analytics`

Get detailed form analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalConversations": 62,
      "totalCompleted": 47,
      "totalAbandoned": 15,
      "completionRate": "75.81%",
      "avgCompletionTime": "58s"
    },
    "fieldBreakdown": [
      {
        "fieldId": "field_0",
        "label": "What is your name?",
        "avgTime": "5s",
        "dropOffs": 0
      },
      {
        "fieldId": "field_2",
        "label": "How would you rate our service?",
        "avgTime": "15s",
        "dropOffs": 8
      }
    ],
    "dropOffFunnel": [
      { "fieldId": "field_0", "label": "What is your name?", "dropOffs": 0, "survivingUsers": 62 },
      { "fieldId": "field_1", "label": "Email Address", "dropOffs": 0, "survivingUsers": 62 },
      { "fieldId": "field_2", "label": "Rate our service", "dropOffs": 8, "survivingUsers": 54 },
      { "fieldId": "field_3", "label": "What did you enjoy?", "dropOffs": 5, "survivingUsers": 49 },
      { "fieldId": "field_4", "label": "Additional feedback", "dropOffs": 2, "survivingUsers": 47 }
    ]
  }
}
```

**Frontend usage:**
- `overview` → stat cards at top of analytics page
- `fieldBreakdown` → table showing per-field times and drop-offs
- `dropOffFunnel` → funnel chart visualization (start with totalConversations, subtract dropOffs at each step)

---

## 11. TypeScript Types (Copy to Frontend)

```typescript
// ─── Form Sources ────────────────────────────────────────────────────────────

type FormSource = 'GOOGLE_FORMS' | 'INTERNAL' | 'AI_GENERATED' | 'TEMPLATE';
type FormStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

// ─── Field Types ─────────────────────────────────────────────────────────────

type FieldType =
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

type FormTone = 'friendly' | 'professional' | 'concise' | 'gen_z' | 'witty' | 'empathetic' | 'hype' | 'chill';

interface ToneOption {
  value: FormTone;
  label: string;
  description: string;
  icon: string;
  exampleGreeting: string;
  tags: string[];
}

// ─── Templates ───────────────────────────────────────────────────────────────

type TemplateCategory =
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

interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  recommendedTone: FormTone;
  fieldCount: number;
  tags: string[];
}

// ─── Field ───────────────────────────────────────────────────────────────────

interface FieldOption {
  label: string;
  value?: string;
}

interface ScaleConfig {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  step?: number;
}

interface FieldValidation {
  type: 'EMAIL' | 'URL' | 'NUMBER' | 'REGEX' | 'TEXT_LENGTH' | 'CONTAINS';
  pattern?: string;
  min?: number;
  max?: number;
  message?: string;
}

interface ConditionalLogic {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value?: string | number | string[];
  action: 'show' | 'hide' | 'skip_to';
  targetFieldId?: string;
}

interface FormField {
  label: string;
  type: FieldType;
  required: boolean;
  description?: string;
  placeholder?: string;
  options?: FieldOption[];
  scaleConfig?: ScaleConfig;
  validation?: FieldValidation;
  conditionalLogic?: ConditionalLogic;
}

// ─── Chat Config ─────────────────────────────────────────────────────────────

interface ChatConfig {
  aiName?: string;
  tone?: FormTone;
  avatar?: string;
  welcomeMessage?: string;
  closingMessage?: string;
  customPersonality?: string;
  allowedDomains?: string[];
}

// ─── Settings ────────────────────────────────────────────────────────────────

interface FormSettings {
  maxResponses?: number;
  scheduledStartAt?: string;       // ISO date
  scheduledEndAt?: string;         // ISO date
  showProgressBar?: boolean;       // default: true
  shuffleFields?: boolean;         // default: false
  notifyOnSubmission?: boolean;    // default: false
  notificationEmail?: string;
  redirectUrl?: string;
  enablePartialResponses?: boolean; // default: false
  isPublished?: boolean;           // default: false
}

// ─── Branding ────────────────────────────────────────────────────────────────

interface FormBranding {
  primaryColor?: string;           // hex, e.g. "#6366f1"
  backgroundColor?: string;       // hex, e.g. "#f8fafc"
  logoUrl?: string;
  fontFamily?: string;             // e.g. "Inter"
  buttonStyle?: 'rounded' | 'sharp' | 'pill';
  removeBranding?: boolean;        // premium feature
}

// ─── Analytics ───────────────────────────────────────────────────────────────

interface FormAnalytics {
  totalConversations: number;
  totalCompleted: number;
  totalAbandoned: number;
  avgCompletionTimeSec: number;
  completionRate: number;
  dropOffByField: Record<string, number>;   // fieldId → count
  avgFieldTimeSec: Record<string, number>;  // fieldId → seconds
  lastCalculatedAt: string;
}

// ─── Create DTOs ─────────────────────────────────────────────────────────────

interface CreateFormPayload {
  title: string;
  description?: string;
  fields: FormField[];
  chatConfig?: ChatConfig;
  settings?: FormSettings;
  branding?: FormBranding;
  tags?: string[];
}

interface CreateFromTemplatePayload {
  templateId: string;
  title?: string;
  chatConfig?: ChatConfig;
  tags?: string[];
}

interface AiGeneratePayload {
  prompt: string;                  // 10-2000 chars
  tone?: FormTone;
  fieldCount?: number;             // 1-50
  context?: string;
  language?: string;               // ISO 639-1
}

interface AiRefinePayload {
  instruction: string;             // 5-1000 chars
  currentForm: AiGeneratedFormPreview;
}

interface AiGeneratedFormPreview {
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

interface AiSavePayload {
  preview: AiGeneratedFormPreview;
  tags?: string[];
  isPublished?: boolean;
}

interface UpdateFormPayload {
  title?: string;
  description?: string;
  fields?: FormField[];
  chatConfig?: ChatConfig;
  settings?: FormSettings;
  branding?: FormBranding;
  tags?: string[];
}

// ─── API Responses ───────────────────────────────────────────────────────────

interface FormResponse {
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
  tags: string[];
  version: number;
  createdAt: string;
}

interface FormListItem {
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

interface AnalyticsResponse {
  overview: {
    totalConversations: number;
    totalCompleted: number;
    totalAbandoned: number;
    completionRate: string;      // formatted, e.g. "75.81%"
    avgCompletionTime: string;   // formatted, e.g. "58s" or "2m 15s"
  };
  fieldBreakdown: Array<{
    fieldId: string;
    label: string;
    avgTime: string;             // formatted
    dropOffs: number;
  }>;
  dropOffFunnel: Array<{
    fieldId: string;
    label: string;
    dropOffs: number;
    survivingUsers: number;
  }>;
}
```

---

## 12. Flow Diagrams

### Form Status State Machine

```
                    ┌─────────┐
     create ───────→│  DRAFT  │←──── unpublish
                    └────┬────┘
                         │ publish
                         ▼
                    ┌─────────┐
                    │ ACTIVE  │  ← chat link works, accepting responses
                    └────┬────┘
                         │ unpublish
                         ▼
                    ┌─────────┐
                    │  DRAFT  │
                    └─────────┘
```

### AI Generation Loop

```
┌──────────────┐     POST /ai-generate     ┌───────────────┐
│ User types   │ ──────────────────────────→│ AI Preview    │
│ description  │                            │ (in memory)   │
└──────────────┘                            └───────┬───────┘
                                                    │
                              ┌──────────────────────┤
                              │                      │
                              ▼                      ▼
                    ┌─────────────────┐    ┌──────────────────┐
                    │ User edits in   │    │ User says        │
                    │ frontend state  │    │ "make it shorter"│
                    └────────┬────────┘    └────────┬─────────┘
                             │                      │
                             │            POST /ai-refine
                             │                      │
                             │                      ▼
                             │             ┌──────────────────┐
                             │             │ Refined Preview  │
                             │             │ (in memory)      │
                             │             └────────┬─────────┘
                             │                      │
                             ▼                      ▼
                    ┌────────────────────────────────────────┐
                    │        User clicks "Save Form"         │
                    └────────────────┬───────────────────────┘
                                     │
                           POST /ai-save
                                     │
                                     ▼
                          ┌────────────────────┐
                          │ Form saved to DB   │
                          │ (DRAFT by default) │
                          └────────────────────┘
```

---

## 13. Tone System Deep Dive

The tone determines the AI's personality during the conversation with respondents. It affects:
- How questions are asked (formal vs slang)
- Emoji usage
- Reaction to answers
- Overall vibe of the conversation

### Available Tones

| Value | Label | Icon | Best For |
|---|---|---|---|
| `friendly` | Friendly | 😊 | General-purpose, default choice |
| `professional` | Professional | 💼 | Corporate, B2B, formal contexts |
| `concise` | Concise | ⚡ | Quick surveys, busy users |
| `gen_z` | Gen Z | 🔥 | Youth-targeted, casual brands, fun forms |
| `witty` | Witty | 😏 | Entertainment, creative industries |
| `empathetic` | Empathetic | 💜 | Healthcare, support, sensitive topics |
| `hype` | Hype | 🚀 | Event registration, contests, launches |
| `chill` | Chill | 🌊 | Low-pressure surveys, anonymous feedback |

### Custom Personality

If the user provides `customPersonality` in chatConfig, it **overrides** the tone preset entirely. Example:

```json
{
  "chatConfig": {
    "tone": "friendly",
    "customPersonality": "You are a barista at a specialty coffee shop. You speak like a coffee nerd — mention beans, roast profiles, and brewing methods casually. Keep it warm but nerdy."
  }
}
```

The custom personality text goes directly into the LLM system prompt, replacing the tone preset.

---

## 14. Template System Deep Dive

Templates provide a fast-start experience. Each template has:
- Pre-configured fields with labels, types, options, and validations
- A recommended tone
- A suggested AI name and welcome message

### How Template Creation Works

1. Frontend calls `GET /config/templates` to show the library
2. User picks a template
3. Frontend calls `POST /create-from-template` with `templateId` and optional overrides
4. Backend copies the template fields + config into a new form document
5. User can then customize via `PUT /:formId`

### Template Overrides

When creating from a template, the user can override:
- `title` — custom form name (otherwise uses template's name)
- `chatConfig.tone` — change the tone (otherwise uses template's `recommendedTone`)
- `chatConfig.aiName` — change the AI name (otherwise uses template's `suggestedAiName`)
- `tags` — custom tags

Fields are always copied as-is from the template. To customize fields, use `PUT /:formId` after creation.

---

## 15. Field Types Reference

### Standard Types (from Google Forms compatibility)

| Type | Description | Requires `options` | Requires `scaleConfig` |
|---|---|---|---|
| `SHORT_TEXT` | Single-line text input | No | No |
| `LONG_TEXT` | Multi-line text area | No | No |
| `MULTIPLE_CHOICE` | Radio buttons (single select) | Yes | No |
| `DROPDOWN` | Dropdown select (single select) | Yes | No |
| `CHECKBOXES` | Multi-select checkboxes | Yes | No |
| `LINEAR_SCALE` | Numeric scale (e.g. 1-5, 0-10) | No | Yes |
| `DATE` | Date picker | No | No |
| `TIME` | Time picker | No | No |
| `SECTION_HEADER` | Visual separator / section label (not a question) | No | No |

### Advanced Types (new for internal forms)

| Type | Description | Notes |
|---|---|---|
| `RATING` | Star rating (1-5) | Use scaleConfig if custom range needed |
| `NPS` | Net Promoter Score (0-10) | Standard NPS scale |
| `YES_NO` | Binary yes/no toggle | No options needed |
| `PHONE` | Phone number input | Auto-validated |
| `EMAIL` | Email input | Auto-validated |
| `URL` | URL input | Auto-validated |
| `NUMBER` | Numeric input | Use validation for min/max |
| `RANKING` | Drag-to-rank items | Requires `options` |
| `FILE_UPLOAD` | File attachment | Feature pending |
| `STATEMENT` | Display-only text (no input) | Like a message between questions |

### Field Validation

Optional `validation` object on any field:

```json
{
  "type": "EMAIL",      // EMAIL, URL, NUMBER, REGEX, TEXT_LENGTH, CONTAINS
  "pattern": "^[a-z]+$", // for REGEX type
  "min": 1,              // for NUMBER or TEXT_LENGTH
  "max": 100,            // for NUMBER or TEXT_LENGTH
  "message": "Please enter a valid email" // custom error message
}
```

### Conditional Logic

Optional `conditionalLogic` on any field (show/hide/skip based on another field's value):

```json
{
  "fieldId": "field_0",           // which field to watch
  "operator": "equals",          // equals, not_equals, contains, greater_than, less_than, is_empty, is_not_empty
  "value": "yes",                // value to compare
  "action": "show",             // show, hide, skip_to
  "targetFieldId": "field_3"    // for skip_to only
}
```

---

## 16. Branding & Settings Reference

### Settings

| Field | Type | Default | Description |
|---|---|---|---|
| `maxResponses` | number | unlimited | Close form after N responses |
| `scheduledStartAt` | ISO date | null | Form opens at this time |
| `scheduledEndAt` | ISO date | null | Form closes at this time |
| `showProgressBar` | boolean | true | Show progress during conversation |
| `shuffleFields` | boolean | false | Randomize field order each session |
| `notifyOnSubmission` | boolean | false | Email notification on new response |
| `notificationEmail` | string | null | Where to send notifications |
| `redirectUrl` | string | null | Redirect after form completion |
| `enablePartialResponses` | boolean | false | Save incomplete conversations |
| `isPublished` | boolean | false | Publish on creation (sets ACTIVE status) |

### Branding

| Field | Type | Default | Description |
|---|---|---|---|
| `primaryColor` | hex string | `#6366f1` | Accent/button color |
| `backgroundColor` | hex string | `#f8fafc` | Chat background |
| `logoUrl` | URL string | null | Company logo in chat header |
| `fontFamily` | string | `Inter` | Font for the chat UI |
| `buttonStyle` | `rounded`\|`sharp`\|`pill` | `rounded` | Send button shape |
| `removeBranding` | boolean | false | Hide "Powered by ZeroFill" (premium) |

---

## 17. Error Handling

All error responses follow this shape:

```json
{
  "statusCode": 400,
  "message": "Description of the error",
  "error": "Bad Request"
}
```

### Common Errors

| Status | When | Message |
|---|---|---|
| 400 | Missing required fields | `"title must be a string"`, `"fields must contain at least 1 element"` |
| 400 | Invalid field type | `"each value in fields.type must be a valid enum value"` |
| 400 | AI prompt too short | `"prompt must be longer than or equal to 10 characters"` |
| 400 | Invalid template ID | `"Template 'xyz' not found"` |
| 400 | Form not publishable | `"Form must have at least one field to publish"` |
| 403 | Insufficient role | `"Forbidden resource"` |
| 404 | Form not found | `"Form not found or does not belong to this organization"` |
| 409 | Duplicate form (import) | `"This form is already imported..."` |

---

## 18. End-to-End Example Flows

### Flow 1: Create a Gen-Z Feedback Form from Scratch

```javascript
// 1. Load tones for the picker
const tones = await api.get(`/organizations/${orgId}/forms/config/tones`);
// → tones.data = [{ value: 'gen_z', label: 'Gen Z', icon: '🔥', ... }, ...]

// 2. User fills out the form builder and clicks "Create"
const form = await api.post(`/organizations/${orgId}/forms/create`, {
  title: "Vibe Check ✨",
  description: "Tell us how we're doing fr fr",
  fields: [
    { label: "What's your name?", type: "SHORT_TEXT", required: true },
    { label: "Rate the vibes", type: "LINEAR_SCALE", required: true,
      scaleConfig: { min: 1, max: 5, minLabel: "mid", maxLabel: "immaculate", step: 1 } },
    { label: "What slaps the most?", type: "MULTIPLE_CHOICE", required: true,
      options: [
        { label: "The product", value: "product" },
        { label: "The support team", value: "support" },
        { label: "The community", value: "community" },
      ]},
    { label: "Drop your thoughts", type: "LONG_TEXT", required: false },
  ],
  chatConfig: {
    aiName: "Zara",
    tone: "gen_z",
    welcomeMessage: "yooo welcome! 🔥✨ this'll be super quick i promise",
    closingMessage: "you're literally the best, thanks for the feedback 💅",
  },
  settings: { showProgressBar: true },
  branding: { primaryColor: "#8b5cf6", buttonStyle: "pill" },
});
// → form.data.id = "684a2b3c..."

// 3. Publish it
await api.post(`/organizations/${orgId}/forms/${form.data.id}/publish`);

// 4. Get the shareable link
const link = await api.post(`/organizations/${orgId}/forms/${form.data.id}/chat-link`);
// → link.data = { token: "abc123", url: "/chat/abc123" }
// → Full URL: https://app.ZeroFill.ai/chat/abc123
```

### Flow 2: Quick Template Creation

```javascript
// 1. Load templates
const templates = await api.get(`/organizations/${orgId}/forms/config/templates`);
// → templates.data = [{ id: "lead-gen-basic", name: "Lead Capture", ... }, ...]

// 2. User picks "customer-feedback" template
const form = await api.post(`/organizations/${orgId}/forms/create-from-template`, {
  templateId: "customer-feedback",
  title: "Q1 Feedback — March 2026",
  chatConfig: { tone: "empathetic", aiName: "Sam" },
});

// 3. Optionally customize a field
await api.put(`/organizations/${orgId}/forms/${form.data.id}`, {
  fields: [
    // ... modified fields array
  ],
});

// 4. Publish
await api.post(`/organizations/${orgId}/forms/${form.data.id}/publish`);
```

### Flow 3: AI-Generated Form with Refinement

```javascript
// 1. Generate from description
const preview = await api.post(`/organizations/${orgId}/forms/ai-generate`, {
  prompt: "Create a customer feedback survey for a SaaS product. Ask about features they use, satisfaction, and what they'd improve.",
  tone: "witty",
  fieldCount: 8,
  context: "B2B project management tool targeting startups",
});
// → preview.data = { title: "...", fields: [...], chatConfig: {...}, ... }

// 2. Hold preview in frontend state, show to user for review

// 3. User wants changes
const refined = await api.post(`/organizations/${orgId}/forms/ai-refine`, {
  instruction: "Add an NPS question and remove the time picker field. Make it more casual.",
  currentForm: preview.data,
});
// → refined.data = updated preview

// 4. User satisfied — save it
const form = await api.post(`/organizations/${orgId}/forms/ai-save`, {
  preview: refined.data,
  tags: ["saas", "feedback", "q1"],
  isPublished: true,  // go live immediately
});
// → form.data.id = "685c4d5e..."
// → form.data.status = "ACTIVE" (because isPublished=true)

// 5. Chat link was auto-generated on publish
const link = await api.post(`/organizations/${orgId}/forms/${form.data.id}/chat-link`);
```

---

## Quick Endpoint Reference Table

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/config/tones` | member+ | List all tones |
| `GET` | `/config/templates` | member+ | List all templates |
| `POST` | `/create` | admin+ | Create form from scratch |
| `POST` | `/create-from-template` | admin+ | Create from template |
| `POST` | `/ai-generate` | admin+ | AI generate preview |
| `POST` | `/ai-refine` | admin+ | Refine AI preview |
| `POST` | `/ai-save` | admin+ | Save AI preview as form |
| `GET` | `/` | member+ | List org forms |
| `GET` | `/:formId` | member+ | Get form details |
| `PUT` | `/:formId` | admin+ | Update form |
| `DELETE` | `/:formId` | admin+ | Delete form |
| `POST` | `/:formId/duplicate` | admin+ | Duplicate as draft |
| `POST` | `/:formId/publish` | admin+ | Publish form |
| `POST` | `/:formId/unpublish` | admin+ | Unpublish form |
| `GET` | `/:formId/analytics` | member+ | Get analytics |
| `POST` | `/:formId/chat-link` | admin+ | Generate chat link |
| `PATCH` | `/:formId/link-expiry` | admin+ | Set link expiry |
| `PATCH` | `/:formId/chat-config` | admin+ | Update chat config |
| `GET` | `/:formId/responses` | member+ | Get submissions |

> **All paths are prefixed with:** `/api/organizations/:orgId/forms`
