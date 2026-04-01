# C3. Partial Response Recovery — Workstreams & Jira Tickets

**Epic Objective:** Reclaim lost leads and show tangible ROI by recovering abandoned form submissions and tracking conversion impact.

**Timeline:** 4–5 days | **Story Points:** 46 SP | **Tickets:** 16

---

## Workstream Overview

| Workstream | Tickets | SP | Lead | Duration |
|---|---|---|---|---|
| **Backend Schema & Policy** | C3-201, C3-202, C3-203 | 13 | Backend | 1.5 days |
| **Recovery Surfaces (Dashboard & Table)** | C3-101, C3-102, C3-103 | 11 | Frontend |1.5 days |
| **Outreach & Export Workflows** | C3-204, C3-205, C3-206, C3-207 | 12 | Backend/Frontend | 1.5 days |
| **Conversion Tracking & Analytics** | C3-301, C3-302, C3-303 | 6 | Analytics | 0.5 days |
| **QA, Docs & Ops** | C3-401, C3-402, C3-403 | 4 | QA/Docs/Ops | 0.5 days |

---

## Detailed Tickets

### Frontend: Recovery Surfaces (3 tickets, 11 SP)

#### C3-101: Dashboard Recovery Widget
**Type:** Story | **SP:** 4 | **Priority:** High  
**Assignee:** Frontend Lead

**Objective:**  
Create a sticky dashboard widget showing recovery metrics in the main analytics/insights area.

**Acceptance Criteria:**
- [ ] Widget displays: `Abandoned Sessions (count)`, `Recoverable Leads (count)`, `Est. Recoverable Value ($)`
- [ ] Recoverable count filters for forms with recovery enabled + abandonment detected
- [ ] Value calculation: `avg_lead_value * recoverable_count` (uses org-level lead value setting)
- [ ] Metric refreshes hourly or on dashboard load
- [ ] Widget links to "Recoverable Leads" table (C3-102)
- [ ] Mobile responsive; shows abbreviated numbers (e.g., "42.5K recoverable")

**Dependencies:**
- C3-202 (recoverable classification schema)
- C3-204 (recovery metrics API)

**Notes:**
- Reuse existing dashboard card layout from Analytics workstreams (A3)
- Pull metrics from backend aggregation endpoint to avoid client-side heavy computation

---

#### C3-102: Recoverable Leads Data Table
**Type:** Story | **SP:** 4 | **Priority:** High  
**Assignee:** Frontend Lead

**Objective:**  
Build a dedicated table/view showing all recoverable leads with name, email, last field, progress, and action buttons.

**Acceptance Criteria:**
- [ ] Table columns: Email, Name, Last Answered Field, Progress %, Last Activity (time ago), Status (Pending Resumption / Abandoned)
- [ ] Sorting: by progress %, email, last activity time
- [ ] Filtering: by form, by status, by date range (last 30 days default)
- [ ] Pagination: 25 items per page
- [ ] Selection checkboxes for bulk export (C3-103)
- [ ] Action buttons per row: "Send Resume Link" (C3-207), "View Partial" (preview submission data)
- [ ] Search by email or name
- [ ] Load leads from `GET /analytics/recoverable-leads?formId=X&status=Y&limit=50` (C3-204)

**Dependencies:**
- C3-204 (backend recoverable-leads endpoint)
- C3-207 (resume link generation)

**Notes:**
- Add to Dashboard > Insights section or standalone "Recovery" tab
- Lazy-load on table scroll to handle large lead lists

---

#### C3-103: Export Recoverable Leads as CSV
**Type:** Story | **SP:** 3 | **Priority:** Medium  
**Assignee:** Frontend Lead

**Objective:**  
Add "Export CSV" button in Recoverable Leads table; flow to backend CSV generation.

**Acceptance Criteria:**
- [ ] Export button in table header (applies current filters: form, date range, status)
- [ ] CSV columns: Email, Name, Form, Last Field, Progress %, Last Activity, Lead Value, Consent Status
- [ ] Filename format: `recoverable-leads-formId-YYYY-MM-DD.csv`
- [ ] Confirmation toast: "Exporting 42 leads..."
- [ ] Large exports (>10k rows) use POST endpoint with async task tracking (C3-205)
- [ ] File download via signed S3 URL or direct response body

**Dependencies:**
- C3-102 (table filtering state)
- C3-205 (backend CSV generation endpoint)

**Notes:**
- Use existing org's lead value and consent settings for export payload
- Include consent column so sales knows if leads can be contacted

---

### Backend: Schema & Policy (3 tickets, 13 SP)

#### C3-201: Extend Partial Submissions Schema with Recovery Classification
**Type:** Story | **SP:** 4 | **Priority:** High  
**Assignee:** Backend Lead

**Objective:**  
Add explicit `recoverable` flag and `abandonmentReason` enum to Partial/FormSubmission model; backfill existing partials.

**Acceptance Criteria:**
- [ ] Partials model adds fields:
  - `isRecoverable: boolean` (default: true if status=PENDING and no full submission)
  - `abandonmentReason?: enum ('SESSION_TIMEOUT' | 'USER_ABANDONED' | 'BROWSER_CLOSE' | 'INACTIVITY_64hrs' | 'UNKNOWN')`
  - `recoveryAttempts: number` (default: 0, increments when resume link sent)
  - `lastRecoveryAttempt?: Date`
- [ ] Migration script backfills `isRecoverable=true` for all PENDING partials without full submission
- [ ] Backfill `abandonmentReason='UNKNOWN'` for existing partials
- [ ] New partials set `isRecoverable` based on consent + form recovery policy at creation time
- [ ] Unit tests for schema validation

**Dependencies:**
- None (foundational)

**Notes:**
- Use Mongoose schema default values to simplify new record creation
- Consider indexing `isRecoverable + status` for query performance (C3-204)

---

#### C3-202: Add Org/Form-Level Recovery Consent & Policy Controls
**Type:** Story | **SP:** 5 | **Priority:** High  
**Assignee:** Backend Lead

**Objective:**  
Create org and form config endpoints to toggle recovery workflows per org/form; track consent.

**Acceptance Criteria:**
- [ ] New OrganizationSchema field: `recoveryPolicy: { enabled: boolean, strategy: enum('AUTO_EMAIL' | 'WEBHOOK_ONLY' | 'MANUAL'), defaultLeadValue: number }`
- [ ] FormSchema field: `recordingConsent: { recoveryEmailsAllowed: boolean, webhookEventsAllowed: boolean }`
- [ ] Endpoint `PATCH /orgs/{orgId}/recovery-policy` — update org-level strategy + default lead value
- [ ] Endpoint `PATCH /forms/{formId}/recovery-consent` — toggle email/webhook allowance per form
- [ ] Default org policy on creation: `{ enabled: true, strategy: 'WEBHOOK_ONLY', defaultLeadValue: 0 }`
- [ ] Default form consent: `{ recoveryEmailsAllowed: false, webhookEventsAllowed: true }` (conservative)
- [ ] Audit log on policy changes
- [ ] Response includes current policy state

**Dependencies:**
- C3-201 (schema adds recovery fields)

**Notes:**
- Recovery disabled by default for email; require explicit opt-in to avoid GDPR issues
- Webhook-only default allows passive tracking without active outreach

---

#### C3-203: Abandonment Detection Service
**Type:** Story | **SP:** 4 | **Priority:** Medium  
**Assignee:** Backend Lead

**Objective:**  
Build background job to detect abandoned sessions and classify `abandonmentReason` retroactively.

**Acceptance Criteria:**
- [ ] Scheduled job runs every 6 hours; looks for PENDING partials last updated 1+ hour ago (edge case for fresh session)
- [ ] Detection logic:
  - If session has 0 activity in 64 hours → reason = 'INACTIVITY_64hrs'
  - If session closed without final submission → reason = 'BROWSER_CLOSE' or 'USER_ABANDONED'
  - Mark `isRecoverable=true` if no full submission exists for that form+user
- [ ] Sets `isRecoverable=false` if user later completes form (successful submission supersedes)
- [ ] Incremental update: only touches partials modified since last job run
- [ ] Logs detection count per job run for monitoring
- [ ] Idempotent: re-running job on same partials doesn't duplicate changes

**Dependencies:**
- C3-201 (schema fields)

**Notes:**
- 64-hour window is a heuristic; consider A/B testing on real data after launch
- Job runs infrequently to avoid query load; real-time detection can be added later if needed

---

### Backend: Outreach & Export (4 tickets, 12 SP)

#### C3-204: Recovery Metrics & Leads Export Endpoints
**Type:** Story | **SP:** 4 | **Priority:** High  
**Assignee:** Backend Lead

**Objective:**  
Create REST endpoints to fetch recovery metrics (widget data) and paginated recoverable leads list.

**Acceptance Criteria:**
- [ ] `GET /analytics/recovery-metrics?orgId=X&formId=Y` → returns:
  ```json
  {
    "abandonedSessionsCount": 42,
    "recoverableLeadsCount": 28,
    "estimatedRecoverableValue": 1400.00,
    "avgProgressPercent": 65
  }
  ```
- [ ] `GET /analytics/recoverable-leads?orgId=X&formId=Y&status=PENDING&limit=25&offset=0` → returns:
  ```json
  {
    "leads": [
      {
        "partialId": "...",
        "email": "...",
        "name": "...",
        "lastAnsweredField": "field_id",
        "progressPercent": 65,
        "lastActivityTime": "2026-04-01T14:32:00Z",
        "status": "PENDING",
        "leadValue": 50.0,
        "recoveryAttempts": 0
      }
    ],
    "total": 28,
    "hasMore": false
  }
  ```
- [ ] Query filters: `formId`, `status` (PENDING/RECOVERED/IN_PROGRESS), `createdAfter`, `createdBefore`
- [ ] Sorting: by progressPercent desc, by lastActivityTime desc, by leadValue desc
- [ ] Auth: org members only; respects org visibility
- [ ] Indexes on: `(organizationId, isRecoverable, status)` and `(formId, status, lastActivityTime)`

**Dependencies:**
- C3-201, C3-202 (schema fields must exist)

**Notes:**
- Metrics endpoint aggregates; use MongoDB aggregation pipeline for performance
- Leads endpoint cursor-paginated if dataset grows beyond 10k

---

#### C3-205: CSV Export Endpoint (Async)
**Type:** Story | **SP:** 3 | **Priority:** Medium  
**Assignee:** Backend Lead

**Objective:**  
Build async CSV export endpoint for large lead lists; return signed S3 URL or stream directly.

**Acceptance Criteria:**
- [ ] POST `/exports/recoverable-leads/csv` with payload:
  ```json
  {
    "formId": "...",
    "filters": { "status": "PENDING", "createdAfter": "..." },
    "columns": ["email", "name", "lastField", "progress", "lastActivity", "leadValue"]
  }
  ```
- [ ] Response returns export task ID + status URL
- [ ] For exports <5k rows: generate CSV inline, stream directly
- [ ] For exports >5k rows: queue to async task queue (Bull/BullMQ); return signed S3 URL after generation
- [ ] CSV encoding: UTF-8
- [ ] Filename: `recoverable-leads-formId-YYYY-MM-DD-HH-mm-ss.csv`
- [ ] Expires after 24 hours if stored in S3
- [ ] Endpoint `GET /exports/{exportId}/status` to track async task

**Dependencies:**
- C3-204 (leads data endpoint)
- Queue infrastructure (assumed to exist)

**Notes:**
- Reuse existing queue/export patterns from form submission exports if available
- Consider rate-limiting large exports (1 per minute per org) to avoid DB strain

---

#### C3-206: Resume Link Generation Endpoint
**Type:** Story | **SP:** 3 | **Priority:** High  
**Assignee:** Backend Lead

**Objective:**  
Generate secure, timestamped resume links that pre-populate partial form and track resumption.

**Acceptance Criteria:**
- [ ] POST `/partials/{partialId}/resume-link` → returns:
  ```json
  {
    "resumeUrl": "https://app.formless.io/resume?token=...",
    "token": "...",
    "expiresAt": "2026-04-15T10:00:00Z",
    "partialId": "..."
  }
  ```
- [ ] Token format: HMAC-signed JWT with `{ partialId, orgId, userId, iat, exp: 14 days }`
- [ ] Resume URL points to frontend resume handler (C3-108)
- [ ] Token validates: signature, expiration, partialId exists + isRecoverable
- [ ] Increments partial's `recoveryAttempts` counter ontoken generation
- [ ] Sets `lastRecoveryAttempt = now()`
- [ ] Logs event: `{ type: 'RECOVERY_LINK_GENERATED', partialId, leadEmail }`
- [ ] Can only be called by org members; logs actor ID

**Dependencies:**
- C3-201 (recoveryAttempts field)

**Notes:**
- 14-day expiration balances recency vs. second-chance window
- Use same JWT signing key as auth endpoints for consistency

---

#### C3-207: Trigger Recovery Webhook Event
**Type:** Story | **SP:** 3 | **Priority:** Medium  
**Assignee:** Backend Lead

**Objective:**  
Send webhook event when recovery email triggered or recovery link created; integrate with C2 automation.

**Acceptance Criteria:**
- [ ] When resume link generated or recovery email should send, publish event:
  ```json
  {
    "type": "FORM_RECOVERY_INITIATED",
    "version": "1.0",
    "timestamp": "2026-04-02T10:00:00Z",
    "organizationId": "...",
    "formId": "...",
    "partialId": "...",
    "email": "user@example.com",
    "lastField": "field_id",
    "progressPercent": 65,
    "leadValue": 50.0,
    "recoveryMethod": "EMAIL" | "MANUAL_EXPORT",
    "resumeUrl": "https://...?token=..." 
  }
  ```
- [ ] Route event through webhook delivery system (from C2 infrastructure)
- [ ] Only trigger if form/org has `webhookEventsAllowed: true` (C3-202)
- [ ] Delivery retry logic + DLQ (reuse from C2)
- [ ] If `recoveryPolicy.strategy='AUTO_EMAIL'`, automatically send transactional email with resume link + CTA
- [ ] Email template includes: partial progress %, field they stopped at, CTA "Resume Form"
- [ ] Email sent with org's branding; respects email domain if configured

**Dependencies:**
- C3-201, C3-202 (schema + policy fields)
- C3-206 (resume link generation)
- C2 webhook infrastructure (delivery, retries, DLQ)

**Notes:**
- Make email optional at form config level to support webhook-only workflows
- Email address stored in partial during submission; use that for outreach

---

### Frontend: Resume & Continuation (1 ticket, 3 SP)

#### C3-108: Resume Link Handler & Form Repopulation
**Type:** Story | **SP:** 3 | **Priority:** High  
**Assignee:** Frontend Lead

**Objective:**  
Handle resume token in URL query params; validate, fetch partial, and repopulate form with previous answers.

**Acceptance Criteria:**
- [ ] Route: `/resume?token=JWT_TOKEN` or `/forms/{formId}/resume?token=JWT_TOKEN`
- [ ] On mount: validate token signature, expiration, and partialId validity
- [ ] Token validation error → show FriendlyError: "Link expired or invalid. Please try again." + contact support link
- [ ] On success: fetch partial from `GET /partials/{partialId}/data` (or embedded in token if payload small)
- [ ] Populate form fields with previous answers (read-only visual + pre-filled input state)
- [ ] Mark previously answered fields as "completed" visually (greyed out / badge)
- [ ] Focus on next unanswered field (resume from interruption point)
- [ ] Show banner: "Welcome back! You were 65% done. Let's finish up."
- [ ] Log resumption event: track which user resumed (if logged in) or anonymous
- [ ] On submission: POST to `/forms/{formId}/submit` with full answers + partialId flag to merge/complete

**Dependencies:**
- C3-206 (resume link generation)
- C3-204 (fetch partial data endpoint, if new)

**Notes:**
- If user is logged in, cross-check user ID in token matches current user (prevent token reuse by different user)
- Partial data endpoint must return all previous answers to repopulate form correctly
- Consider UX: grey out completed fields or show in collapsed "summary" section

---

### Analytics & Conversion Tracking (3 tickets, 6 SP)

#### C3-301: Add Recovery Event Tracking
**Type:** Story | **SP:** 2 | **Priority:** High  
**Assignee:** Analytics Engineer

**Objective:**  
Instrument analytics to track recovery funnel: abandoned → resumed → submitted → recovered.

**Acceptance Criteria:**
- [ ] New tracked events:
  - `PARTIAL_SUBMISSION_ABANDONED`: { partialId, formId, progressPercent, abandonmentReason, leadEmail }
  - `RECOVERY_LINK_SENT`: { partialId, formId, resumeEmail, recoveryAttempt }
  - `RECOVERY_LINK_CLICKED`: { partialId, formId, leadEmail, sessionId }
  - `RECOVERY_FORM_RESUMED`: { partialId, formId, leadEmail, progressPercent, sessionId }
  - `RECOVERY_FORM_COMPLETED`: { partialId, formId, leadEmail, originalProgressPercent, timeSinceAbandonment }
- [ ] Events logged to analytics pipeline (same as AnalyticsService used in B1/B2)
- [ ] Payload includes org + form for segmentation
- [ ] Track session ID to link abandoned → resumed → completed across events

**Dependencies:**
- AnalyticsService (assumed from other workstreams)

**Notes:**
- Events provide funnel visibility: how many abandoned lead to resume? how many resumed lead to completion?
- leadEmail allows cohort analysis by customer segment

---

#### C3-302: Recovery Conversion Attribution
**Type:** Story | **SP:** 2 | **Priority:** Medium  
**Assignee:** Analytics Engineer

**Objective:**  
Calculate and expose recovery metrics: conversion rate, time to recovery, ROI per lead.

**Acceptance Criteria:**
- [ ] Analytics dashboard metric block: "Recovery Funnel"
  - Abandoned count → Resumed count → Completed count (funnel viz)
  - Conversion rate: (resumed/abandoned) × (completed/resumed)
  - Avg time from abandon to resume (hours)
  - Avg time from resume to completion (minutes)
- [ ] Export recoverable leads CSV includes: "Lead Value × Recovery Success Rate" (column: "potential value if recovered")
- [ ] Segment by form + org for reporting
- [ ] Backfill: if `RECOVERY_FORM_COMPLETED` event exists, attribute that submission back to original partial's lead value
- [ ] Historical: query partials with recovery attempts + full submissions to surface past recovery successes

**Dependencies:**
- C3-301 (event tracking)
- C3-204 (leads endpoint for joined query)

**Notes:**
- Recovery rate data will inform future A/B tests on recovery strategies (email vs. webhook)
- Potential ROI per form: `recoverableLeadsCount × recoveryRate × avgLeadValue`

---

#### C3-303: Lead Value & Revenue Tracking API
**Type:** Story | **SP:** 2 | **Priority:** Medium  
**Assignee:** Backend Lead

**Objective:**  
Expose endpoint to set/update lead valuation per org; surface in recovery metrics calculations.

**Acceptance Criteria:**
- [ ] `PATCH /orgs/{orgId}/lead-value` → update `defaultLeadValue` (currency)
- [ ] `GET /orgs/{orgId}/lead-value` → return current valuation
- [ ] Optional per-form override: `POST /forms/{formId}/lead-value` → form-specific multiplier (1.0x = use org default)
- [ ] Include `leadValue` in partial submissions + recovery metrics
- [ ] Calculate in recovery widget: `estimatedRecoverableValue = recoverableCount × avgLeadValue`
- [ ] Audit log on value changes (date, old value, new value, actor)
- [ ] Default: $0 (orgs must configure to see recovery value)

**Dependencies:**
- C3-202 (policy schema)
- C3-204 (metrics endpoint)

**Notes:**
- Lead value is a business config, not computed; allows orgs to model different deals/use cases
- Multiplier per form allows high-value lead magnets to show higher recovery potential

---

### QA, Docs & Ops (3 tickets, 4 SP)

#### C3-401: Recovery Workflow E2E Tests
**Type:** Story | **SP:** 2 | **Priority:** High  
**Assignee:** QA Lead

**Objective:**  
Test full recovery flow: submit partial → mark abandoned → generate resume link → complete form → verify conversion tracking.

**Acceptance Criteria:**
- [ ] Test scenario 1: "Partial submission → resume via link → completed submission"
  - Create org + form with recovery enabled
  - Submit partial (field 1-3 of 5)
  - Wait 1+ hour; mark abandoned via C3-203 job or manually
  - Generate resume link via C3-206
  - Open resume URL; validate fields pre-filled
  - Complete remaining fields + submit
  - Verify submission marked with `partialId` reference
  - Verify conversion events logged
- [ ] Test scenario 2: "Token expiration → error handling"
  - Generate resume link; manipulate expiration to past
  - Click resume link; verify error message
- [ ] Test scenario 3: "CSV export → sales outreach flow"
  - Create 50+ recoverable leads
  - Export CSV with filters
  - Verify CSV columns match spec; no missing data
- [ ] Test scenario 4: "Webhook trigger for recovery"
  - Enable `AUTO_EMAIL` recovery policy
  - Submit partial; mark abandoned
  - Verify webhook event sent (via test webhook endpoint)
  - Verify email sent (test inbox) with resume link
- [ ] Regression: Verify normal (non-recovery) form flow unaffected

**Dependencies:**
- C3-201 through C3-207 (all functionality)

**Notes:**
- Set up test data fixtures for quick partial + abandoned state generation
- Mock email service for testing AUTO_EMAIL flows
- Use existing test harness from B1/B2 workstreams

---

#### C3-402: Recovery Feature Documentation
**Type:** Story | **SP:** 1 | **Priority:** Medium  
**Assignee:** Docs Lead

**Objective:**  
Document recovery feature for end users and admins; include setup, monitoring, best practices.

**Acceptance Criteria:**
- [ ] User guide: "How to set up partial response recovery"
  - Enable recovery per org
  - Configure consent + policy (email vs. webhook)
  - Set lead value for ROI calculations
  - Monitor recovery dashboard widget
- [ ] Admin guide: "Recovery metric interpretation"
  - Funnel analysis (abandon → resume → completion)
  - CSV export + sales workflow integration
  - Webhook event schema + example automation (Zapier template)
- [ ] API docs: Endpoints C3-204, C3-205, C3-206 (parameters, response, errors)
- [ ] FAQ: "Why is recovery disabled by default?" "How long are resume links valid?" (14 days)
- [ ] Troubleshooting: "Email not sent" → check GDPR consent + org policy

**Dependencies:**
- All C3 tickets (feature complete)

**Notes:**
- Reuse docs structure from B1,B2, C1, C2 workstreams
- Include screenshots of dashboard widget + recoverable leads table

---

#### C3-403: Recovery Monitoring & Alerting
**Type:** Story | **SP:** 1 | **Priority:** Low  
**Assignee:** Ops Lead

**Objective:**  
Set up dashboards and alerts to monitor recovery system health and anomalies.

**Acceptance Criteria:**
- [ ] Metrics dashboard:
  - Active abandonments per hour
  - Resume links generated per hour (trend)
  - Resume link click-through rate (CTR %)
  - Email delivery rate (if AUTO_EMAIL enabled)
  - Conversion rate: resumed → completed %
- [ ] Alerts:
  - Email delivery failure spike (>10% failures in 1 hour) → page on-call
  - Resume link expiration vs. click rate (if <5% CTR, alert for investigation)
  - Recovery job failure (C3-203 job timeout/error)
- [ ] Logs:
  - All recovery events logged to structured logging (ELK / CloudWatch)
  - Searchable by partialId, orgId, leadEmail

**Dependencies:**
- C3-301 (event tracking)
- Infrastructure: monitoring tool (DataDog, New Relic, etc.)

**Notes:**
- Recovery is a new system; start with broad dashboards, then narrow alerts based on real-world data
- Low priority because feature is not critical path to core product

---

## Dependency Graph

```
┌─────────────────┐
│  C3-201: Schema │ ←─ FOUNDATIONAL
├─────────────────┤
│  C3-202: Policy │ ←─ DEPENDS ON C3-201
└────────┬────────┘
         │
         ├─→ C3-203: Abandonment Detection
         │
         ├─→ C3-204: Metrics & Leads Endpoints
         │     ├─→ C3-102: Leads Table (Frontend)
         │     └─→ C3-101: Dashboard Widget
         │
         ├─→ C3-205: CSV Export
         │     └─→ C3-103: Export Button (Frontend)
         │
         ├─→ C3-206: Resume Link Generation
         │     └─→ C3-108: Resume Handler (Frontend)
         │
         └─→ C3-207: Webhook Trigger
              ├─→ C3-301: Recovery Event Tracking
              │    ├─→ C3-302: Conversion Attribution
              │    └─→ C3-303: Lead Value API
              │
              └─→ C3-401: E2E Tests
                   
         ├─→ C3-402: Documentation
         └─→ C3-403: Monitoring

CRITICAL PATH (longest dependency chain):
C3-201 → C3-202 → C3-204 → (C3-102 + C3-1 + C3-301) → C3-302 → C3-401
```

---

## Implementation Sequencing

**Day 1 (Backend Foundation):**
- [ ] C3-201: Extend schema (4 SP)
- [ ] C3-202: Consent/policy controls (5 SP)
- [ ] C3-203: Abandonment detection job (4 SP)
- [ ] **Checkpoint:** Schema migrations run; job tested in sandbox

**Day 2 (Recovery Surfaces):**
- [ ] C3-204: Metrics + leads endpoints (4 SP) — enables widget + table
- [ ] C3-101: Dashboard widget (4 SP) — parallelizable after C3-204
- [ ] C3-102: Leads table (4 SP) — parallelizable after C3-204
- [ ] **Checkpoint:** Widget + table show data in dashboard preview

**Day 2-3 (Outreach & Export):**
- [ ] C3-205: CSV export endpoint (3 SP)
- [ ] C3-103: Export button frontend (3 SP)
- [ ] C3-206: Resume link generation (3 SP)
- [ ] C3-108: Resume handler frontend (3 SP)
- [ ] **Checkpoint:** Can generate resume link, click, and repopulate form

**Day 3 (Webhook & Analytics):**
- [ ] C3-207: Webhook trigger (3 SP)
- [ ] C3-301: Event tracking (2 SP)
- [ ] C3-302: Conversion attribution (2 SP)
- [ ] C3-303: Lead value API (2 SP)
- [ ] **Checkpoint:** Recovery events flowing; analytics showing funnel

**Day 4 (Testing, Docs, Ops):**
- [ ] C3-401: E2E tests (2 SP) — critical; blocks staging→prod
- [ ] C3-402: Documentation (1 SP)
- [ ] C3-403: Monitoring setup (1 SP)
- [ ] **Checkpoint:** Full feature tested; dashboards live; docs published

---

## Success Criteria

- ✅ **Functional:** Abandoned forms recoverable via resume link; complete → full submission
- ✅ **Data Accuracy:** Recoverable count matches isRecoverable + status filters; no duplicates in export
- ✅ **Performance:** Metrics endpoint <200ms; CSV export non-blocking for large datasets (>5k rows)
- ✅ **Analytics:** Recovery funnel visible; conversion rate trackable per form + org
- ✅ **GDPR Compliance:** Email recovery disabled by default; form-level consent honored
- ✅ **Monitoring:** Recovery system health visible; alerts firing on email delivery failures
- ✅ **ROI Visibility:** Widget shows estimated recoverable value; sales can export leads for outreach

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Resume link abuse (token replay)** | Security: compromised partials | HMAC signing + 14-day expiration + userId check |
| **Large CSV exports timeout** | UX: export fails for >10k leads | Async queue + S3 signed URLs (limit 1 export/min per org) |
| **Email deliverability** | Ops: leads never contacted if AUTO_EMAIL broken | Monitor email SLA; default to webhook-only policy; fallback manual export |
| **Historical data bias** | Analytics: recovery metrics skewed if backfill incomplete | Run C3-203 job on all history; validate recovered ≠ duplicated submissions |
| **Consent tracking gaps** | Legal: GDPR violation if emails sent without consent | Enforce form-level `recoveryEmailsAllowed` flag; audit log all policy changes |

---

## External Dependencies

- ✅ **Queue System** (Bull/BullMQ) — assumed from C1/B2 infrastructure
- ✅ **Webhook Delivery** (from C2) — reuse event transport + retries
- ✅ **Email Service** (SendGrid/AWS SES) — assumed for AUTO_EMAIL
- ✅ **Monitoring Tool** (DataDog/New Relic) — for C3-403 dashboards
- ✅ **S3 / File Storage** — for CSV export pre-signing

---

## Summary

**C3 provides tangible ROI visibility and recovery pathways for abandoned leads.** By surfacing recoverable leads through dashboard widgets, exportable tables, and automated resume links, the platform enables sales teams to reclaim dropped opportunities. The analytics funnel (abandoned → resumed → completed) quantifies recovery impact and informs future optimizations. Four strategic design decisions ensure adoption:

1. **Webhook-first, email-optional** — respects GDPR by defaulting to passive events; active email requires opt-in
2. **Lead value modeling** — lets orgs configure recovery ROI per form, making recovery investment tangible
3. **Async exports + 14-day resume window** — balances recency with second-chance UX
4. **Full event tracking** — enables funnel analysis and A/B testing on recovery strategies

**Estimated effort:** 46 SP over 4–5 days (after B1 frontend stabilization). **Recommended sprint:** C3 can start in parallel with B2-203+ (rules engine) once B1 frontend (C3-101/102) is de-risked.
