# C1: AI Sentiment & Summary Engine (Analytics Summary Tab) — Workstreams & Jira Tickets

**Objective:** Replace manual analysis with high-leverage AI insights that increase retention and repeated dashboard usage.

**Target Exit Criteria:**
- Analytics Summary tab provides actionable AI insights for selected period.
- Insights pipeline aggregates submissions, long-text excerpts, rating trends, and drop-off context.
- `getAiInsights(orgId, formId, days)` is production-ready with cache, async mode, and graceful fallback.
- Output schema includes takeaways, pain points, sentiment trend, recommended actions, and confidence.
- Insights include citation snippets and clear AI-generated disclaimer.
- Regeneration supports cooldown and freshness metadata.

**Timeline:** 6-8 work days (parallel execution recommended)

---

## 1. Workstreams Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│          C1: AI Sentiment & Summary Engine (Summary Tab)            │
└──────────────────────────────────────────────────────────────────────┘
                      ↓
      ┌───────────────┬───────────────┬───────────────┬───────────────┐
      ↓               ↓               ↓               ↓               ↓
   Backend          AI/Prompt       Frontend        Infra/Ops         QA/Docs
   (C1-2xx)         (C1-3xx)        (C1-1xx)        (C1-6xx)          (C1-5xx)
   Data corpus      Insight schema  Summary tab     Cache/jobs         Validation
   API orchestration Trend logic    Regenerate UX   Fallback status    Trust copy
```

---

## 2. Jira Tickets by Workstream

### **Frontend (C1-1xx) — Summary Tab UX**

#### **C1-101: Add Analytics “Summary” Tab UI**
- **Assignee:** Frontend Lead
- **Story Points:** 3
- **Parent:** C1 Epic
- **Dependency:** C1-201, C1-301
- **Due:** Day 4

**Description:**
Add a new Summary tab in analytics view that renders AI-generated insights with freshness and coverage metadata.

**Acceptance Criteria:**
- [ ] New tab “Summary” appears in existing analytics navigation.
- [ ] Tab renders sections:
  - `Key Takeaways`
  - `Common Pain Points`
  - `Sentiment Trend`
  - `Recommended Actions`
- [ ] Displays generation timestamp and selected coverage window (`days`).
- [ ] Handles loading, empty, error, and stale states.
- [ ] Responsive on desktop/mobile.

**Technical Notes:**
- Integrate with analytics page and organizations API client.

**Test Cases:**
- Valid data renders all sections.
- No insights yet shows empty state CTA.
- API error shows non-blocking fallback message.

---

#### **C1-102: Add “Regenerate” Action with Cooldown**
- **Assignee:** Frontend Lead
- **Story Points:** 2
- **Parent:** C1 Epic
- **Dependency:** C1-203, C1-601
- **Due:** Day 5

**Description:**
Enable manual regeneration with cooldown and job-status feedback to avoid cost spikes.

**Acceptance Criteria:**
- [ ] “Regenerate” button available in Summary tab.
- [ ] Cooldown visible and enforced (e.g., 10-30 min configurable).
- [ ] When async generation starts, UI displays `queued/running/complete/failed` states.
- [ ] Button disabled during cooldown or in-progress job.

**Test Cases:**
- Regenerate triggers job and transitions statuses correctly.
- Cooldown blocks repeated clicks.

---

#### **C1-103: Add Trust & Safety Messaging + Citations UI**
- **Assignee:** Frontend Lead
- **Story Points:** 2
- **Parent:** C1 Epic
- **Dependency:** C1-301, C1-302
- **Due:** Day 5

**Description:**
Display trust indicators and source snippets to improve confidence and reduce blind reliance.

**Acceptance Criteria:**
- [ ] Show disclaimer: “AI-generated summary; verify against raw responses.”
- [ ] Render citation snippets beneath takeaways and pain points where available.
- [ ] Citations are truncated safely and link to raw response view when possible.
- [ ] Confidence shown as badge/score with tooltip.

**Test Cases:**
- Citations present -> rendered with source anchor.
- No citations -> section still usable without layout break.

---

### **Backend (C1-2xx) — Data Pipeline + Insights API**

#### **C1-201: Build Analysis Corpus Aggregation Pipeline**
- **Assignee:** Backend Lead
- **Story Points:** 5
- **Parent:** C1 Epic
- **Dependency:** None
- **Due:** Day 2

**Description:**
Aggregate submissions and metadata for selected window into compact corpus for AI summarization.

**Acceptance Criteria:**
- [ ] Pipeline accepts `(orgId, formId, days)`.
- [ ] Corpus includes:
  - key answers (structured fields)
  - long-text excerpts (sampled/truncated)
  - rating trends
  - failure/drop-off context
- [ ] Corpus enforces token/size budget.
- [ ] PII-safe sanitization and truncation applied before AI call.

**Technical Notes:**
- Reuse existing analytics and submission sources.
- Add deterministic sampling strategy for large datasets.

**Test Cases:**
- Small dataset -> full corpus preserved.
- Large dataset -> sampled corpus within budget.

---

#### **C1-202: Implement `getAiInsights(orgId, formId, days)` Service Method**
- **Assignee:** Backend Lead
- **Story Points:** 5
- **Parent:** C1 Epic
- **Dependency:** C1-201, C1-301
- **Due:** Day 3

**Description:**
Create core analytics service method and endpoint for AI insights generation/retrieval.

**Acceptance Criteria:**
- [ ] Service method available in analytics service:
  `getAiInsights(orgId, formId, days)`
- [ ] Endpoint returns schema:
  ```json
  {
    "keyTakeaways": [],
    "commonPainPoints": [],
    "sentimentTrend": {"direction": "up|down|stable", "rationale": "..."},
    "recommendedActions": [],
    "confidence": 0.0
  }
  ```
- [ ] Includes metadata: `generatedAt`, `coverageWindowDays`, `submissionCountUsed`.
- [ ] Backward-compatible endpoint behavior for clients not using Summary tab.

**Test Cases:**
- Valid dataset returns complete schema.
- Sparse dataset returns reduced but valid schema.

---

#### **C1-203: Add Async Generation Path + Status API for Large Datasets**
- **Assignee:** Backend Lead
- **Story Points:** 3
- **Parent:** C1 Epic
- **Dependency:** C1-202, C1-602
- **Due:** Day 4

**Description:**
For large corpora, queue insight generation and expose status polling.

**Acceptance Criteria:**
- [ ] Threshold-based async mode (e.g., submission count or token estimate).
- [ ] Job states: `queued`, `running`, `completed`, `failed`.
- [ ] Status endpoint returns progress metadata and ETA hint if available.
- [ ] Completed job stores insight payload in cache/store.

**Test Cases:**
- Dataset below threshold -> synchronous response.
- Dataset above threshold -> async job + status workflow.

---

#### **C1-204: Graceful Fallback When AI Is Unavailable**
- **Assignee:** Backend Lead
- **Story Points:** 2
- **Parent:** C1 Epic
- **Dependency:** C1-202
- **Due:** Day 4

**Description:**
Ensure analytics remains useful when AI service errors or times out.

**Acceptance Criteria:**
- [ ] Fallback response includes deterministic trend blocks from non-AI analytics.
- [ ] Error reason classified (`timeout`, `provider_unavailable`, `quota`).
- [ ] Frontend receives usable payload + fallback flag.
- [ ] No hard-failure of analytics page.

**Test Cases:**
- Simulated AI timeout -> fallback payload returned.
- Provider failure -> fallback payload + status metadata.

---

### **AI/Prompt (C1-3xx) — Insight Quality + Citations**

#### **C1-301: Define AI Insight Output Contract + Prompt Templates**
- **Assignee:** AI/Backend Engineer
- **Story Points:** 3
- **Parent:** C1 Epic
- **Dependency:** C1-201
- **Due:** Day 3

**Description:**
Formalize prompt and parser contract for stable, structured insight generation.

**Acceptance Criteria:**
- [ ] Prompt template enforces strict JSON schema fields.
- [ ] Parser validates and normalizes model outputs.
- [ ] Confidence normalized to `[0,1]`.
- [ ] Sentiment trend direction constrained to `up|down|stable`.

**Test Cases:**
- Non-compliant model output -> parser correction or safe failure.
- Schema-conformant output passes validation.

---

#### **C1-302: Add Citation Snippet Extraction/Attachment**
- **Assignee:** AI/Backend Engineer
- **Story Points:** 3
- **Parent:** C1 Epic
- **Dependency:** C1-201, C1-301
- **Due:** Day 4

**Description:**
Attach source snippets to insights for transparency and analyst trust.

**Acceptance Criteria:**
- [ ] Each major insight can include `citations[]` with snippet text + source reference.
- [ ] Citation snippets are length-limited and sanitized.
- [ ] Citations prefer representative excerpts over outliers.
- [ ] Empty citation handling is supported.

**Test Cases:**
- Insight with citations returns 1..N snippets.
- Sparse corpus returns empty citations gracefully.

---

#### **C1-303: Sentiment Trend Rationale Stabilization**
- **Assignee:** AI/Backend Engineer
- **Story Points:** 2
- **Parent:** C1 Epic
- **Dependency:** C1-301
- **Due:** Day 4

**Description:**
Improve consistency of sentiment trend direction and rationale by combining deterministic trend stats with AI narrative.

**Acceptance Criteria:**
- [ ] Direction uses deterministic signal baseline (ratings/text sentiment aggregate).
- [ ] AI generates concise rationale grounded in baseline stats.
- [ ] Contradictions between direction and rationale are blocked/normalized.

**Test Cases:**
- Improving rating series -> `up` trend.
- Flat ratings/mixed text -> `stable` trend.

---

### **Analytics/Data (C1-4xx) — Compatibility + Coverage**

#### **C1-401: Add Coverage Metrics to Insights Metadata**
- **Assignee:** Analytics Engineer
- **Story Points:** 2
- **Parent:** C1 Epic
- **Dependency:** C1-202
- **Due:** Day 4

**Description:**
Expose what data was used so users understand reliability and scope.

**Acceptance Criteria:**
- [ ] Metadata includes `coverageWindowDays`, `submissionsUsed`, `longTextSamplesUsed`.
- [ ] Include `excludedCount` and reason categories (too short, duplicate, invalid).
- [ ] Surfaced in API and frontend Summary tab.

---

#### **C1-402: Preserve Existing Analytics Endpoint Compatibility**
- **Assignee:** Analytics Engineer
- **Story Points:** 2
- **Parent:** C1 Epic
- **Dependency:** C1-202
- **Due:** Day 5

**Description:**
Ensure C1 additions do not break current analytics consumers.

**Acceptance Criteria:**
- [ ] Existing analytics responses remain unchanged unless explicitly versioned.
- [ ] New Summary payload served via dedicated endpoint/section.
- [ ] Contract tests pass for legacy dashboards.

---

### **Infra/Ops (C1-6xx) — Cache + Jobs + Cost Controls**

#### **C1-601: Cache AI Insights with TTL + Invalidation Rules**
- **Assignee:** DevOps/Backend Lead
- **Story Points:** 3
- **Parent:** C1 Epic
- **Dependency:** C1-202
- **Due:** Day 4

**Description:**
Implement cache controls to manage cost and latency while preserving freshness.

**Acceptance Criteria:**
- [ ] Cache key includes `orgId`, `formId`, `days`, and version.
- [ ] TTL configurable (6-24h default).
- [ ] Invalidate on threshold of new submissions (e.g., `N` submissions).
- [ ] Cache hit/miss metrics logged.

**Test Cases:**
- Repeated query within TTL -> cache hit.
- N new submissions -> invalidates and regenerates.

---

#### **C1-602: Job Orchestration for Async Insight Generation**
- **Assignee:** DevOps/Backend Lead
- **Story Points:** 3
- **Parent:** C1 Epic
- **Dependency:** C1-203
- **Due:** Day 5

**Description:**
Use queue/job orchestration for large dataset processing and robust retries.

**Acceptance Criteria:**
- [ ] Background queue with retry/backoff configured.
- [ ] Idempotent job key prevents duplicate generation storms.
- [ ] Timeout and dead-letter handling defined.
- [ ] Operational dashboard exposes queue depth and failure rate.

---

#### **C1-603: Cost Guardrails + Rate Limits**
- **Assignee:** DevOps/Backend Lead
- **Story Points:** 2
- **Parent:** C1 Epic
- **Dependency:** C1-202, C1-601
- **Due:** Day 5

**Description:**
Prevent abuse and runaway AI spend with regeneration controls.

**Acceptance Criteria:**
- [ ] Per-org/day generation quota.
- [ ] Regenerate cooldown enforced server-side.
- [ ] Configurable max corpus token budget.
- [ ] Alerting threshold for anomalous cost spikes.

---

### **QA/Docs (C1-5xx) — Validation + Rollout Readiness**

#### **C1-501: End-to-End Summary Tab QA Suite**
- **Assignee:** QA Lead
- **Story Points:** 4
- **Parent:** C1 Epic
- **Dependency:** C1-101, C1-202, C1-203
- **Due:** Day 6

**Description:**
Validate complete C1 flow from corpus aggregation to Summary tab rendering.

**Acceptance Criteria:**
- [ ] Test matrix includes small, medium, and large datasets.
- [ ] Validates sync + async generation flows.
- [ ] Validates regenerate cooldown and status transitions.
- [ ] Validates fallback path when AI unavailable.

---

#### **C1-502: Insight Quality & Citation Spot-check Protocol**
- **Assignee:** QA + PM/Analyst
- **Story Points:** 2
- **Parent:** C1 Epic
- **Dependency:** C1-302, C1-303
- **Due:** Day 6

**Description:**
Create quality rubric and perform manual spot-checks to ensure insight usefulness and citation relevance.

**Acceptance Criteria:**
- [ ] Rubric for relevance, actionability, and factual grounding.
- [ ] At least 10 sample forms reviewed.
- [ ] Track false-positive/low-confidence insight rate.

---

#### **C1-503: Developer & Analyst Guide for Summary Engine**
- **Assignee:** Tech Writer + Backend Lead
- **Story Points:** 2
- **Parent:** C1 Epic
- **Dependency:** C1-202, C1-601
- **Due:** Day 7

**Description:**
Document how C1 works, how to interpret confidence/citations, and how to troubleshoot stale or fallback summaries.

**Acceptance Criteria:**
- [ ] API contract documented (`getAiInsights` + status endpoint).
- [ ] Cache/invalidation behavior documented.
- [ ] Trust/safety language and analyst verification workflow documented.

---

## 3. Dependency Graph & Sequencing

```
Day 1:  C1-201
Day 2:  C1-202 + C1-301
Day 3:  C1-203 + C1-302 + C1-303 + C1-401
Day 4:  C1-101 + C1-204 + C1-601
Day 5:  C1-102 + C1-103 + C1-602 + C1-603 + C1-402
Day 6:  C1-501 + C1-502
Day 7:  C1-503 + release verification
```

---

## 4. Ticket Summary

| Ticket | Title | SP | Owner | Dependency |
|---|---|---:|---|---|
| C1-101 | Add Analytics Summary Tab UI | 3 | Frontend | C1-201, C1-301 |
| C1-102 | Add Regenerate with Cooldown | 2 | Frontend | C1-203, C1-601 |
| C1-103 | Add Trust/Safety Messaging + Citations UI | 2 | Frontend | C1-301, C1-302 |
| C1-201 | Build Analysis Corpus Aggregation Pipeline | 5 | Backend | None |
| C1-202 | Implement getAiInsights(orgId, formId, days) | 5 | Backend | C1-201, C1-301 |
| C1-203 | Add Async Generation + Status API | 3 | Backend | C1-202, C1-602 |
| C1-204 | Graceful Fallback When AI Unavailable | 2 | Backend | C1-202 |
| C1-301 | Define AI Insight Contract + Prompt Templates | 3 | AI/Backend | C1-201 |
| C1-302 | Add Citation Snippet Extraction | 3 | AI/Backend | C1-201, C1-301 |
| C1-303 | Sentiment Trend Rationale Stabilization | 2 | AI/Backend | C1-301 |
| C1-401 | Add Coverage Metrics Metadata | 2 | Analytics | C1-202 |
| C1-402 | Preserve Existing Analytics Compatibility | 2 | Analytics | C1-202 |
| C1-501 | End-to-End Summary Tab QA Suite | 4 | QA | C1-101, C1-202, C1-203 |
| C1-502 | Insight Quality & Citation Spot-checks | 2 | QA/PM | C1-302, C1-303 |
| C1-503 | Developer & Analyst Guide | 2 | Docs/Backend | C1-202, C1-601 |
| C1-601 | Cache Insights TTL + Invalidation | 3 | DevOps/Backend | C1-202 |
| C1-602 | Job Orchestration for Async Insights | 3 | DevOps/Backend | C1-203 |
| C1-603 | Cost Guardrails + Rate Limits | 2 | DevOps/Backend | C1-202, C1-601 |
|  | **Total** | **50 SP** |  |  |

---

## 5. Success Criteria / Definition of Done

- [ ] Summary tab is usable and stable for target datasets.
- [ ] `getAiInsights(orgId, formId, days)` returns validated schema and metadata.
- [ ] Cache + async orchestration reduce latency/cost while preserving freshness.
- [ ] Fallback mode keeps analytics useful during AI outage/quota errors.
- [ ] Citations and disclaimer are visible and clear.
- [ ] Regenerate cooldown and cost limits are enforced server-side.
- [ ] Existing analytics contracts remain backward-compatible.
- [ ] QA and quality spot-checks meet threshold before rollout.
