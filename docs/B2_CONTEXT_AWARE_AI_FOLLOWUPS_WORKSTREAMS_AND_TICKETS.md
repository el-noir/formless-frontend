# B2: Context-Aware AI Follow-ups — Workstreams & Jira Tickets

**Objective:** Introduce context-aware follow-up questions to improve answer quality while preserving conversational flow and structured-data reliability.

**Target Exit Criteria:**
- Follow-up rules can be configured per field and evaluated reliably after primary answer validation.
- Conversation engine supports follow-up stack and bounded follow-up depth.
- Extraction output supports `primaryAnswer`, `followUps[]`, and `confidence`.
- Structured field guardrails (email, date, score/scale) remain strict and deterministic.
- Analytics cleanly separates canonical field responses from follow-up notes/sub-insights.
- UX includes a light “why this follow-up” cue and session-level follow-up cap.

**Timeline:** 6-7 work days (parallel where possible)

---

## 1. Workstreams Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                    B2: Context-Aware AI Follow-ups                │
└────────────────────────────────────────────────────────────────────┘
                    ↓
     ┌──────────────┬──────────────┬──────────────┬─────────────┐
     ↓              ↓              ↓              ↓             ↓
  Backend         AI/Extraction   Frontend       Analytics      QA/Docs
  (B2-2xx)        (B2-3xx)        (B2-1xx)       (B2-4xx)      (B2-5xx)
  Rule engine     Schema outputs  UX cues        Insight model  Parity & limits
  Session stack   Confidence      Caps/flows     Canonical split Guides
```

---

## 2. Jira Tickets by Workstream

### **Frontend (B2-1xx) — UX, Cues, Caps**

#### **B2-101: Add Follow-up Cue in Chat UI**
- **Assignee:** Frontend Lead
- **Story Points:** 2
- **Parent:** B2 Epic
- **Dependency:** B2-202
- **Due:** Day 4

**Description:**
Display a subtle contextual hint before follow-up questions so users understand why additional context is requested.

**Acceptance Criteria:**
- [ ] Render a lightweight cue above follow-up prompts (e.g., “Quick clarification to improve accuracy”).
- [ ] Cue appears only for follow-up questions (`isFollowUp=true`).
- [ ] Cue style is unobtrusive and does not interrupt flow.
- [ ] No cue for normal field progression.
- [ ] A11y labels added for screen readers.

**Technical Notes:**
- Update chat rendering in [src/components/chat/MessageItem.tsx](src/components/chat/MessageItem.tsx).
- Read follow-up metadata from conversation payload.

**Test Cases:**
- Follow-up question shows cue.
- Standard question does not show cue.
- Cue persists across theme variations.

---

#### **B2-102: Enforce Session Follow-up Cap in UX**
- **Assignee:** Frontend Lead
- **Story Points:** 2
- **Parent:** B2 Epic
- **Dependency:** B2-204
- **Due:** Day 5

**Description:**
Prevent “interrogation feel” by respecting server-provided session caps and presenting a smooth fallback when cap is reached.

**Acceptance Criteria:**
- [ ] UI respects `maxFollowUpsPerSession` metadata from API.
- [ ] If cap reached, conversation transitions naturally to next canonical field.
- [ ] Optional inline notice shown once when cap behavior triggers.
- [ ] No client-side override can exceed server cap.

**Technical Notes:**
- Touch [src/hooks/useChatSession.ts](src/hooks/useChatSession.ts) state transitions.

**Test Cases:**
- Cap reached at N follow-ups -> advances without extra follow-up.
- Cap not reached -> follow-up flow continues.

---

#### **B2-103: Extend Frontend Types for Follow-up Payloads**
- **Assignee:** Frontend Lead
- **Story Points:** 1
- **Parent:** B2 Epic
- **Dependency:** B2-301
- **Due:** Day 3

**Description:**
Add follow-up-aware interfaces for response payloads and rendering metadata.

**Acceptance Criteria:**
- [ ] Types include `primaryAnswer`, `followUps[]`, `confidence`.
- [ ] Message model supports follow-up flags and parent linkage.
- [ ] Type-safe parsing from API responses with no `any` regressions.

**Technical Notes:**
- Update [src/components/chat/types.ts](src/components/chat/types.ts) and API client models.

---

### **Backend (B2-2xx) — Rule Engine + Conversation State**

#### **B2-201: Add `followUpRules` to Field Model**
- **Assignee:** Backend Lead
- **Story Points:** 3
- **Parent:** B2 Epic
- **Dependency:** None
- **Due:** Day 1

**Description:**
Extend field schema to support follow-up rule definitions with deterministic and hybrid AI trigger support.

**Acceptance Criteria:**
- [ ] Field model accepts `followUpRules[]` with:
  - `triggerType`: `sentiment | keyword | score_threshold | option_selected | ai_hybrid`
  - `triggerConfig`: structured config per trigger type
  - `promptTemplate`: string template
  - `required`: boolean
  - `maxDepth`: number
- [ ] Validation rejects malformed rules.
- [ ] Backward-compatible for existing forms without rules.

**Technical Notes:**
- Update form schema/contracts in backend and shared DTO mapping.

**Test Cases:**
- Valid rule set persists and loads.
- Invalid trigger config rejected with 400.
- Legacy forms operate unchanged.

---

#### **B2-202: Add Follow-up Stack to Conversation Session State**
- **Assignee:** Backend Lead
- **Story Points:** 3
- **Parent:** B2 Epic
- **Dependency:** B2-201
- **Due:** Day 2

**Description:**
Evolve conversation state with stack-based follow-up tracking and parent linkage.

**Acceptance Criteria:**
- [ ] Session includes `followUpStack`, `followUpDepth`, `followUpsAskedCount`.
- [ ] Each stack frame stores `parentFieldId`, `ruleId`, `depth`, `promptTemplate`.
- [ ] State transitions handle push/pop correctly.
- [ ] TTL/session store behavior unchanged.

**Technical Notes:**
- Update conversation interfaces and FSM transitions.

**Test Cases:**
- Push on trigger; pop on completion.
- Nested follow-ups stop at `maxDepth`.

---

#### **B2-203: Evaluate Follow-up Rules After Answer Validation**
- **Assignee:** Backend Lead
- **Story Points:** 5
- **Parent:** B2 Epic
- **Dependency:** B2-201, B2-202
- **Due:** Day 3

**Description:**
Insert follow-up evaluation stage between answer validation and advancing to next field.

**Acceptance Criteria:**
- [ ] Rule evaluation runs after primary answer validation.
- [ ] Deterministic triggers evaluated first.
- [ ] Hybrid AI trigger evaluated only if deterministic path yields no decisive match (configurable).
- [ ] On match, follow-up question is asked before advancing canonical field pointer.
- [ ] On no match, normal progression continues.

**Technical Notes:**
- Add evaluation service and deterministic trigger helpers.

**Test Cases:**
- Option-selected trigger fires correctly.
- Score threshold trigger fires at boundaries.
- No trigger -> normal next field.

---

#### **B2-204: Add Session-level Guardrails for Follow-up Limits**
- **Assignee:** Backend Lead
- **Story Points:** 2
- **Parent:** B2 Epic
- **Dependency:** B2-202, B2-203
- **Due:** Day 3

**Description:**
Enforce global limits to prevent excessive follow-up questioning.

**Acceptance Criteria:**
- [ ] Configurable caps:
  - `maxFollowUpsPerSession`
  - `maxFollowUpDepthPerField`
- [ ] Exceeding cap forces progression to canonical next field.
- [ ] Cap events logged for analytics/diagnostics.

**Test Cases:**
- Cap exceeded -> no additional follow-up asked.
- Cap not exceeded -> follow-up proceeds.

---

#### **B2-205: Persist Follow-up Answers Linked to Parent Field**
- **Assignee:** Backend Lead
- **Story Points:** 3
- **Parent:** B2 Epic
- **Dependency:** B2-202, B2-203
- **Due:** Day 4

**Description:**
Persist follow-up responses separately while preserving canonical field answer integrity.

**Acceptance Criteria:**
- [ ] Primary answer storage remains canonical.
- [ ] Follow-up entries persist with `parentFieldId` and ordering metadata.
- [ ] Submission payload still maps canonical values correctly.
- [ ] Follow-up notes are queryable for analytics.

**Test Cases:**
- Canonical answer unchanged by follow-up storage.
- Follow-up data linked and retrievable.

---

### **AI/Extraction (B2-3xx) — Schema Evolution + Confidence**

#### **B2-301: Extend Extraction Output Schema (`primaryAnswer`, `followUps[]`, `confidence`)**
- **Assignee:** AI/Backend Engineer
- **Story Points:** 5
- **Parent:** B2 Epic
- **Dependency:** B2-201
- **Due:** Day 3

**Description:**
Update extraction contracts and prompts to return richer structured outputs for follow-up-aware flows.

**Acceptance Criteria:**
- [ ] Extraction returns:
  ```json
  {
    "primaryAnswer": "...",
    "followUps": [{"promptId": "...", "answer": "..."}],
    "confidence": 0.0
  }
  ```
- [ ] Confidence is normalized to `[0, 1]`.
- [ ] Null-safe behavior for empty follow-up arrays.
- [ ] Parsing failures degrade safely to deterministic fallback.

**Test Cases:**
- High-confidence extraction with follow-ups.
- Low-confidence extraction fallback path.

---

#### **B2-302: Keep Hard Guardrails for Structured Fields**
- **Assignee:** AI/Backend Engineer
- **Story Points:** 3
- **Parent:** B2 Epic
- **Dependency:** B2-301
- **Due:** Day 4

**Description:**
Maintain deterministic validation precedence for email/date/scale fields even with follow-up extraction.

**Acceptance Criteria:**
- [ ] Email/date/scale use strict validator-first path.
- [ ] AI extraction cannot override invalid structured values.
- [ ] Clarification prompts triggered on invalid structured data.

**Test Cases:**
- Invalid email stays invalid regardless of AI confidence.
- Date normalization only after deterministic parse pass.

---

### **Analytics (B2-4xx) — Canonical vs Follow-up Insights**

#### **B2-401: Extend Analytics Schema for Follow-up Sub-insights**
- **Assignee:** Backend/Analytics Engineer
- **Story Points:** 3
- **Parent:** B2 Epic
- **Dependency:** B2-205
- **Due:** Day 5

**Description:**
Add analytics model support for follow-up-derived insights while preserving current field metrics.

**Acceptance Criteria:**
- [ ] Canonical response metrics remain unchanged.
- [ ] Follow-up notes stored in separate structures (`subInsights`, `followUpSignals`).
- [ ] Existing analytics endpoints remain backward-compatible.

**Test Cases:**
- Old dashboards still render.
- New follow-up insight fields populated when present.

---

#### **B2-402: Update Field Analytics Aggregation Pipelines**
- **Assignee:** Backend/Analytics Engineer
- **Story Points:** 3
- **Parent:** B2 Epic
- **Dependency:** B2-401
- **Due:** Day 5

**Description:**
Update aggregation logic to include follow-up insights and preserve canonical response reporting.

**Acceptance Criteria:**
- [ ] Aggregation distinguishes:
  - `canonicalResponse`
  - `followUpNotes`
- [ ] New metrics include follow-up trigger frequency and confidence distribution.
- [ ] Query performance remains within acceptable limits.

**Test Cases:**
- Mixed data set (canonical + follow-up) aggregates correctly.
- No follow-up data set behaves unchanged.

---

### **QA/Docs/Ops (B2-5xx) — Validation & Rollout Safety**

#### **B2-501: End-to-End Follow-up Flow Test Suite**
- **Assignee:** QA Lead
- **Story Points:** 5
- **Parent:** B2 Epic
- **Dependency:** B2-203, B2-301, B2-302
- **Due:** Day 6

**Description:**
Add E2E coverage for trigger evaluation, depth limits, extraction confidence, and cap behavior.

**Acceptance Criteria:**
- [ ] Coverage includes:
  - keyword trigger
  - score threshold trigger
  - option-selected trigger
  - AI-hybrid trigger fallback
- [ ] Depth cap and session cap behavior validated.
- [ ] Structured-field guardrails validated.

---

#### **B2-502: Regression + Compatibility Tests for Analytics**
- **Assignee:** QA/Analytics
- **Story Points:** 2
- **Parent:** B2 Epic
- **Dependency:** B2-401, B2-402
- **Due:** Day 6

**Description:**
Guarantee that existing analytics behavior remains stable with and without follow-up data.

**Acceptance Criteria:**
- [ ] Existing dashboard contracts unchanged for legacy forms.
- [ ] New follow-up metrics available when data present.

---

#### **B2-503: Add Operational Flags and Rollout Controls**
- **Assignee:** DevOps/Backend Lead
- **Story Points:** 2
- **Parent:** B2 Epic
- **Dependency:** B2-203
- **Due:** Day 6

**Description:**
Feature-flag B2 behavior for controlled rollout and quick rollback.

**Acceptance Criteria:**
- [ ] Flags added:
  - `FOLLOWUPS_ENABLED`
  - `FOLLOWUPS_AI_HYBRID_ENABLED`
  - `FOLLOWUPS_MAX_PER_SESSION`
- [ ] Flag can be scoped per org in config if needed.
- [ ] Safe fallback to canonical-only flow when disabled.

---

#### **B2-504: Developer Guide for Follow-up Rules**
- **Assignee:** Tech Writer + Backend Lead
- **Story Points:** 2
- **Parent:** B2 Epic
- **Dependency:** B2-201, B2-203
- **Due:** Day 7

**Description:**
Document how to author follow-up rules and avoid over-questioning.

**Acceptance Criteria:**
- [ ] Rule authoring examples for each trigger type.
- [ ] Guidance on max depth and required vs optional follow-ups.
- [ ] Troubleshooting section for low-confidence extraction and cap behavior.

---

## 3. Dependency Graph & Sequencing

```
Day 1:  B2-201
Day 2:  B2-202
Day 3:  B2-203 + B2-301 + B2-103
Day 4:  B2-204 + B2-205 + B2-302 + B2-101
Day 5:  B2-401 + B2-402 + B2-102
Day 6:  B2-501 + B2-502 + B2-503
Day 7:  B2-504 + release validation
```

---

## 4. Ticket Summary

| Ticket | Title | SP | Owner | Dependency |
|---|---|---:|---|---|
| B2-101 | Add Follow-up Cue in Chat UI | 2 | Frontend | B2-202 |
| B2-102 | Enforce Session Follow-up Cap in UX | 2 | Frontend | B2-204 |
| B2-103 | Extend Frontend Types for Follow-up Payloads | 1 | Frontend | B2-301 |
| B2-201 | Add followUpRules to Field Model | 3 | Backend | None |
| B2-202 | Add Follow-up Stack to Session State | 3 | Backend | B2-201 |
| B2-203 | Evaluate Rules After Validation | 5 | Backend | B2-201, B2-202 |
| B2-204 | Add Session-level Guardrail Caps | 2 | Backend | B2-202, B2-203 |
| B2-205 | Persist Follow-up Answers Linked to Parent | 3 | Backend | B2-202, B2-203 |
| B2-301 | Extend Extraction Output Schema | 5 | AI/Backend | B2-201 |
| B2-302 | Keep Hard Structured-field Guardrails | 3 | AI/Backend | B2-301 |
| B2-401 | Extend Analytics Schema for Sub-insights | 3 | Analytics | B2-205 |
| B2-402 | Update Analytics Aggregation Pipelines | 3 | Analytics | B2-401 |
| B2-501 | End-to-End Follow-up Flow Tests | 5 | QA | B2-203, B2-301, B2-302 |
| B2-502 | Analytics Compatibility Regression Tests | 2 | QA/Analytics | B2-401, B2-402 |
| B2-503 | Add Rollout Flags and Controls | 2 | DevOps/Backend | B2-203 |
| B2-504 | Developer Guide for Follow-up Rules | 2 | Docs/Backend | B2-201, B2-203 |
|  | **Total** | **46 SP** |  |  |

---

## 5. Success Criteria / Definition of Done

- [ ] Follow-up rule authoring is schema-valid and backward-compatible.
- [ ] Conversation engine executes follow-ups before canonical advancement.
- [ ] Extraction schema includes confidence and follow-up arrays.
- [ ] Structured validators remain deterministic and non-bypassable.
- [ ] Analytics separates canonical response vs follow-up signals.
- [ ] UX explains follow-ups and enforces caps.
- [ ] E2E and regression tests pass under flag-on and flag-off modes.
- [ ] Feature flags provide safe rollout/rollback path.
