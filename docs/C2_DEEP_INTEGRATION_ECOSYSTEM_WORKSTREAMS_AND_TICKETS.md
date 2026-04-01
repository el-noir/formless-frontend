# C2: Deep Integration Ecosystem (Zapier/Make + Robust Webhooks) — Subtasks & Jira Tickets

**Objective:** Make ZeroFill operationally indispensable by delivering reliable, secure, automation-ready integrations.

**Target Exit Criteria:**
- Webhook delivery supports HMAC verification, retries with backoff, idempotency, and dead-letter/error visibility.
- Canonical, versioned event model is implemented and documented.
- Form dashboard includes complete automation setup UX (URL, secret, event triggers, test event).
- Zapier/Make launch path supports webhook templates (Phase 1) and native Zapier trigger readiness (Phase 2).
- Reliability SLO: >99% successful delivery within retry window with alerting on failure spikes.

**Timeline:** 7-9 work days (parallel execution recommended)

---

## 1. Workstreams Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│ C2: Deep Integration Ecosystem (Zapier/Make + robust webhooks)         │
└──────────────────────────────────────────────────────────────────────────┘
                         ↓
      ┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
      ↓              ↓              ↓              ↓              ↓
   Backend         Platform        Frontend       Partner GTM     QA/Docs
   (C2-2xx)        (C2-6xx)        (C2-1xx)       (C2-3xx)        (C2-5xx)
   Delivery core   Queue/retry     Automation UX  Zapier/Make     Validation
   Event contract  Observability   Logs + testing Payload docs    Reliability
```

---

## 2. Jira Tickets by Workstream

### **Frontend (C2-1xx) — Automation UX + Delivery Logs**

#### **C2-101: Add Automation Setup Panel in Form Dashboard**
- **Assignee:** Frontend Lead
- **Story Points:** 5
- **Parent:** C2 Epic
- **Dependency:** C2-201, C2-203
- **Due:** Day 4

**Description:**
Build automation setup UI in form dashboard with webhook URL, secret, event trigger selection, and save flow.

**Acceptance Criteria:**
- [ ] New Automation section on form dashboard supports:
  - Webhook URL input
  - Secret input (masked)
  - Event trigger multi-select
- [ ] Save/Update with validation (URL format, required fields).
- [ ] Secret rotation UX with confirm flow.
- [ ] Persisted values reload correctly.
- [ ] Permission-aware controls (admin-only edits).

**Technical Notes:**
- Extend dashboard form settings page.
- Use existing auth/org role checks.

**Test Cases:**
- Valid URL + triggers saves successfully.
- Invalid URL blocked with inline error.
- Non-admin sees read-only state.

---

#### **C2-102: Add “Send Test Event” Button + Result UI**
- **Assignee:** Frontend Lead
- **Story Points:** 2
- **Parent:** C2 Epic
- **Dependency:** C2-204
- **Due:** Day 5

**Description:**
Allow users to send a synthetic event to validate endpoint configuration and signature handling.

**Acceptance Criteria:**
- [ ] Test event button available in automation panel.
- [ ] User selects event type for test payload.
- [ ] Result status shown: success/failure + latency + response code.
- [ ] Error details displayed safely (no secret leakage).

**Test Cases:**
- Reachable endpoint returns success state.
- 4xx/5xx endpoint returns failure details.

---

#### **C2-103: Delivery Logs View in Dashboard**
- **Assignee:** Frontend Lead
- **Story Points:** 3
- **Parent:** C2 Epic
- **Dependency:** C2-205, C2-206
- **Due:** Day 6

**Description:**
Build delivery logs table with filtering and drill-down for retries, failures, and dead-letter events.

**Acceptance Criteria:**
- [ ] Logs list includes timestamp, event type, status, attempt count, response code, destination.
- [ ] Filters: status, event type, date range.
- [ ] Detail drawer shows request metadata and error summary.
- [ ] Dead-letter records clearly labeled.

**Test Cases:**
- Logs render for successful + failed deliveries.
- Filter combinations return expected rows.

---

### **Backend (C2-2xx) — Webhook Productization Core**

#### **C2-201: Implement HMAC Signature (v1) with Secret**
- **Assignee:** Backend Lead
- **Story Points:** 5
- **Parent:** C2 Epic
- **Dependency:** None
- **Due:** Day 2

**Description:**
Sign outbound webhook payloads with HMAC SHA-256 using per-endpoint secret and include verification headers.

**Acceptance Criteria:**
- [ ] Headers include:
  - `x-zerofill-signature-v1`
  - `x-zerofill-timestamp`
  - `x-zerofill-event-id`
- [ ] Signature computed over canonical payload + timestamp.
- [ ] Secret stored encrypted at rest.
- [ ] Signature docs include verification examples (Node/Python).

**Test Cases:**
- Valid signature verified externally.
- Tampered payload fails verification.

---

#### **C2-202: Add Idempotency Key & Duplicate Suppression**
- **Assignee:** Backend Lead
- **Story Points:** 3
- **Parent:** C2 Epic
- **Dependency:** C2-201
- **Due:** Day 3

**Description:**
Ensure receivers can process events exactly-once semantically despite retries.

**Acceptance Criteria:**
- [ ] Each event has stable idempotency key (`eventId`).
- [ ] Retries re-use same `eventId` and idempotency metadata.
- [ ] Duplicate generation suppressed on producer side where applicable.

**Test Cases:**
- Retry attempts keep same eventId.
- Duplicate enqueue attempts are de-duped.

---

#### **C2-203: Canonical Event Model + Versioned Payload Contract**
- **Assignee:** Backend Lead
- **Story Points:** 5
- **Parent:** C2 Epic
- **Dependency:** None
- **Due:** Day 2

**Description:**
Define and enforce canonical integration events with explicit schema versioning.

**Acceptance Criteria:**
- [ ] Canonical events implemented:
  - `submission.completed`
  - `submission.abandoned`
  - `submission.failed`
  - `form.published`
  - `form.updated`
- [ ] Payload includes top-level `specVersion` and `eventType`.
- [ ] JSON schema contracts validated before delivery.
- [ ] Backward compatibility strategy documented.

**Test Cases:**
- Each event serializes to schema-valid payload.
- Invalid payload blocked before dispatch.

---

#### **C2-204: Build Test Event Dispatch Endpoint**
- **Assignee:** Backend Lead
- **Story Points:** 2
- **Parent:** C2 Epic
- **Dependency:** C2-201, C2-203
- **Due:** Day 4

**Description:**
Expose endpoint for synthetic event dispatch used by dashboard test button.

**Acceptance Criteria:**
- [ ] API accepts target config + selected event type.
- [ ] Dispatch uses same signature and delivery pipeline as production events.
- [ ] Test events are tagged and excluded from business analytics.

**Test Cases:**
- Test event delivered and logged with `isTest=true`.
- Invalid config returns validation error.

---

#### **C2-205: Retry with Exponential Backoff + Jitter**
- **Assignee:** Backend Lead
- **Story Points:** 5
- **Parent:** C2 Epic
- **Dependency:** C2-602
- **Due:** Day 4

**Description:**
Implement resilient delivery with queue-based retries and bounded retry window.

**Acceptance Criteria:**
- [ ] Retry policy configurable (attempts, base delay, max delay).
- [ ] Exponential backoff with jitter to avoid thundering herd.
- [ ] Retry stops on terminal statuses as configured.
- [ ] Retry window metrics recorded.

**Test Cases:**
- Temporary 5xx endpoint eventually succeeds after retry.
- Permanent 4xx endpoint moves to failed/dead-letter policy.

---

#### **C2-206: Dead-letter Queue + Error Logging Contract**
- **Assignee:** Backend Lead
- **Story Points:** 3
- **Parent:** C2 Epic
- **Dependency:** C2-205
- **Due:** Day 5

**Description:**
Capture exhausted failures in dead-letter storage with structured diagnostics.

**Acceptance Criteria:**
- [ ] Dead-letter entity stores event payload hash, destination, attempts, final error.
- [ ] Error logs include classification (`timeout`, `dns`, `tls`, `4xx`, `5xx`).
- [ ] Redrive endpoint/process available for operator replay.

**Test Cases:**
- Exhausted retries create dead-letter entry.
- Redrive sends event back through delivery pipeline.

---

### **Partner/GTM (C2-3xx) — Zapier/Make Launch Path**

#### **C2-301: Zapier/Make Catch Hook Templates (Phase 1)**
- **Assignee:** Integrations Engineer
- **Story Points:** 3
- **Parent:** C2 Epic
- **Dependency:** C2-203
- **Due:** Day 5

**Description:**
Deliver no-code integration templates that consume ZeroFill webhook events via Catch Hook.

**Acceptance Criteria:**
- [ ] Ready-to-use Zapier and Make template guides for all canonical events.
- [ ] Includes setup screenshots and field mapping examples.
- [ ] Validation checklist included for first run.

---

#### **C2-302: Native Zapier Trigger Scaffold (Phase 2 Prep)**
- **Assignee:** Integrations Engineer
- **Story Points:** 5
- **Parent:** C2 Epic
- **Dependency:** C2-203, C2-205
- **Due:** Day 7

**Description:**
Create native Zapier app scaffold with trigger: “New Submission”.

**Acceptance Criteria:**
- [ ] OAuth/API key auth approach finalized.
- [ ] Trigger endpoint supports polling or REST hook handshake.
- [ ] Trigger sample payload aligns with canonical contract.
- [ ] Optional action stubs noted (not GA scope).

---

#### **C2-303: Field Mapping Docs + Sample Payload Library**
- **Assignee:** Integrations Engineer + Tech Writer
- **Story Points:** 2
- **Parent:** C2 Epic
- **Dependency:** C2-203
- **Due:** Day 6

**Description:**
Publish mapping docs for common automation targets (CRM, Slack, Sheets, Notion).

**Acceptance Criteria:**
- [ ] Sample payloads for each canonical event.
- [ ] Field mapping table for common tools.
- [ ] Notes for nullability, arrays, and nested fields.

---

### **Reliability/Analytics (C2-4xx) — SLO + Alerting**

#### **C2-401: Define and Track Webhook Delivery SLO**
- **Assignee:** Analytics/Platform Engineer
- **Story Points:** 3
- **Parent:** C2 Epic
- **Dependency:** C2-205
- **Due:** Day 6

**Description:**
Instrument and monitor delivery SLO: >99% successful delivery within retry window.

**Acceptance Criteria:**
- [ ] Success metric defined with denominator/numerator and retry-window semantics.
- [ ] Dashboard charts for success rate, p95 delivery latency, retry rates.
- [ ] SLO reportable per org and globally.

---

#### **C2-402: Alerting on Failure Spikes and DLQ Growth**
- **Assignee:** DevOps/Platform Engineer
- **Story Points:** 2
- **Parent:** C2 Epic
- **Dependency:** C2-206, C2-401
- **Due:** Day 7

**Description:**
Add operational alerts for webhook health degradation.

**Acceptance Criteria:**
- [ ] Alerts for failure-rate spikes over baseline.
- [ ] Alerts for dead-letter queue growth threshold.
- [ ] On-call runbook link attached to alerts.

---

### **QA/Docs/Ops (C2-5xx / C2-6xx) — Readiness + Operability**

#### **C2-501: End-to-End Webhook Reliability Test Suite**
- **Assignee:** QA Lead
- **Story Points:** 5
- **Parent:** C2 Epic
- **Dependency:** C2-201, C2-205, C2-206
- **Due:** Day 7

**Description:**
Validate signature correctness, retries, idempotency, dead-letter behavior, and dashboard logs.

**Acceptance Criteria:**
- [ ] Tests for transient failures, permanent failures, duplicate suppression.
- [ ] Signature verification tests across example runtimes.
- [ ] SLO acceptance simulation with representative traffic.

---

#### **C2-502: Security Review for Webhook Secrets and Signing**
- **Assignee:** Security + Backend Lead
- **Story Points:** 2
- **Parent:** C2 Epic
- **Dependency:** C2-201
- **Due:** Day 6

**Description:**
Perform security review on secret handling, signing design, and replay risk controls.

**Acceptance Criteria:**
- [ ] Secret storage and rotation reviewed.
- [ ] Replay mitigation documented (timestamp tolerance).
- [ ] No secrets leaked in logs/UI.

---

#### **C2-503: Integration Developer Docs + Troubleshooting Matrix**
- **Assignee:** Tech Writer
- **Story Points:** 3
- **Parent:** C2 Epic
- **Dependency:** C2-203, C2-301, C2-303
- **Due:** Day 8

**Description:**
Publish complete docs for webhook setup, signature verification, event contracts, Zapier/Make quick starts, and troubleshooting.

**Acceptance Criteria:**
- [ ] Docs include curl examples and signature verification code snippets.
- [ ] Troubleshooting matrix covers common delivery failures.
- [ ] Event versioning and migration guidance included.

---

#### **C2-601: Queue/Retry Subsystem Setup and Hardening**
- **Assignee:** DevOps/Backend Lead
- **Story Points:** 3
- **Parent:** C2 Epic
- **Dependency:** None
- **Due:** Day 3

**Description:**
Provision and configure queue infrastructure for delivery jobs and retries.

**Acceptance Criteria:**
- [ ] Queue selected/configured (throughput, retention, visibility timeout).
- [ ] Worker concurrency tunable by environment.
- [ ] Poison-message handling policy defined.

---

#### **C2-602: Delivery Job Orchestration + Idempotent Worker Execution**
- **Assignee:** DevOps/Backend Lead
- **Story Points:** 3
- **Parent:** C2 Epic
- **Dependency:** C2-601, C2-202
- **Due:** Day 4

**Description:**
Implement job orchestration with idempotent processing guarantees.

**Acceptance Criteria:**
- [ ] Worker execution is idempotent by event key.
- [ ] Duplicate jobs do not double-send.
- [ ] Job state transitions observable in metrics/logs.

---

## 3. Dependency Graph & Sequencing

```
Day 1:  C2-201 + C2-203 + C2-601
Day 2:  C2-202
Day 3:  C2-602 + C2-205
Day 4:  C2-204 + C2-206 + C2-101
Day 5:  C2-102 + C2-103 + C2-301
Day 6:  C2-303 + C2-401 + C2-502
Day 7:  C2-302 + C2-402 + C2-501
Day 8:  C2-503 + release validation
```

---

## 4. Ticket Summary

| Ticket | Title | SP | Owner | Dependency |
|---|---|---:|---|---|
| C2-101 | Add Automation Setup Panel in Form Dashboard | 5 | Frontend | C2-201, C2-203 |
| C2-102 | Add Send Test Event + Result UI | 2 | Frontend | C2-204 |
| C2-103 | Delivery Logs View in Dashboard | 3 | Frontend | C2-205, C2-206 |
| C2-201 | Implement HMAC Signature v1 with Secret | 5 | Backend | None |
| C2-202 | Add Idempotency Key & Duplicate Suppression | 3 | Backend | C2-201 |
| C2-203 | Canonical Events + Versioned Contract | 5 | Backend | None |
| C2-204 | Build Test Event Dispatch Endpoint | 2 | Backend | C2-201, C2-203 |
| C2-205 | Retry with Exponential Backoff + Jitter | 5 | Backend | C2-602 |
| C2-206 | Dead-letter Queue + Error Logging Contract | 3 | Backend | C2-205 |
| C2-301 | Zapier/Make Catch Hook Templates (Phase 1) | 3 | Integrations | C2-203 |
| C2-302 | Native Zapier Trigger Scaffold (Phase 2 Prep) | 5 | Integrations | C2-203, C2-205 |
| C2-303 | Field Mapping Docs + Sample Payload Library | 2 | Integrations/Docs | C2-203 |
| C2-401 | Define + Track Webhook Delivery SLO | 3 | Platform/Analytics | C2-205 |
| C2-402 | Alerting on Failure Spikes + DLQ Growth | 2 | DevOps | C2-206, C2-401 |
| C2-501 | End-to-End Webhook Reliability Suite | 5 | QA | C2-201, C2-205, C2-206 |
| C2-502 | Security Review for Signing + Secrets | 2 | Security | C2-201 |
| C2-503 | Integration Developer Docs + Troubleshooting | 3 | Docs | C2-203, C2-301, C2-303 |
| C2-601 | Queue/Retry Subsystem Setup | 3 | DevOps/Backend | None |
| C2-602 | Delivery Job Orchestration + Idempotent Worker | 3 | DevOps/Backend | C2-601, C2-202 |
|  | **Total** | **69 SP** |  |  |

---

## 5. Success Criteria / Definition of Done

- [ ] Canonical events are stable, versioned, and schema-validated.
- [ ] All webhook deliveries are signed with HMAC and secrets are secure/rotatable.
- [ ] Retry + DLQ flow is operational with delivery logs visible in dashboard.
- [ ] Idempotency guarantees prevent duplicate side effects downstream.
- [ ] Automation setup UX and test event flow are production-ready.
- [ ] Zapier/Make launch assets are complete for webhook-based onboarding.
- [ ] Reliability SLO (>99% in retry window) is measurable and alert-backed.
- [ ] Full QA pass and security review completed before rollout.
