# B1: Real-time WYSIWYG Split Builder — Workstreams & Jira Tickets

**Objective:** Enable form builders to edit forms and see live conversation preview in real time. "Magic" feedback loop with instant sync, debounced API calls, and optional test answer simulation.

**Target Exit Criteria:**
- Form field edits update live preview within 300ms
- Preview parity with production chat rendering (100% of 15 field type + tone combinations)
- Test answer flow simulates branching behavior
- Performance: <200ms p99 API latency, 0 memory leaks in rapid edits
- New developers can extend preview (add field types, customize rendering) in <1 hour

**Timeline:** 5 work days (parallel execution recommended)

---

## 1. Workstreams Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         B1: WYSIWYG Split Builder                  │
└────────────────────────────────────────────────────────────────────┘
                    ↓
     ┌──────────────┬──────────────┬──────────────┬─────────────┐
     ↓              ↓              ↓              ↓             ↓
  Backend         Frontend       Testing        Docs          Ops
  (B1-2xx)        (B1-1xx)       (B1-4xx)       (B1-5xx)     (B1-6xx)
  Preview API     UI/UX          Snapshots      Runbook      Deploy
  Endpoint        Debouncing     Parity Tests   Guides       Scripts
```

---

## 2. Jira Tickets by Workstream

### **Backend (B1-2xx) — Preview API & Prompt Simulation**

#### **B1-201: Create Preview Endpoint (POST /api/forms/{formId}/preview)**
- **Assignee:** Backend Lead
- **Story Points:** 3
- **Parent:** B1 Epic
- **Dependency:** None (parallel)
- **Due:** Day 1

**Description:**
Create a new preview endpoint that accepts draft form fields + chatConfig and returns a simulated conversation prompt and next question.

**Acceptance Criteria:**
- [ ] POST `/api/forms/{formId}/preview` accepts JSON payload:
  ```json
  {
    "fields": [...],
    "chatConfig": { "aiName", "tone", "welcomeMessage" },
    "testAnswer": "optional user test input"
  }
  ```
- [ ] Returns 200 with:
  ```json
  {
    "systemPrompt": "...",
    "greetingPrompt": "...",
    "nextQuestion": "...",
    "currentFieldIndex": 0
  }
  ```
- [ ] Reuses existing `conversationService.startConversationFromSchema()` (no duplication)
- [ ] Reuses existing `promptBuilder.buildSystemPrompt()` with `{ isEmbed: true }` flag
- [ ] No database persistence required (stateless)
- [ ] Auth: org member+ (verify orgId from JWT)
- [ ] Error handling: return 400 for invalid schema, 404 if form not found
- [ ] Logs preview generation (DEBUG level) with draft hash for troubleshooting

**Technical Notes:**
- Endpoint path: `formless-backend/apps/api/src/forms/forms.controller.ts` (add method)
- Service call: `formless-backend/apps/api/src/forms/forms.service.ts` (add method)
- Reuse pattern: See `startConversationFromSchema` ([conversation.service.ts L187](formless-backend/apps/api/src/conversation/conversation.service.ts#L187-L260))

**Test Cases:**
- Preview with friendly tone + custom aiName → greeting includes name + warm tone
- Preview with professional tone → greeting is formal
- Preview with testAnswer → returns next question response (branching)
- Preview with invalid field type → returns 400
- Preview with 7 fields → indexes correctly (currentFieldIndex starts at 0)

---

#### **B1-202: Add Test Answer Simulation to Preview Endpoint**
- **Assignee:** Backend Lead
- **Story Points:** 3
- **Parent:** B1 Epic
- **Dependency:** B1-201 (sequential)
- **Due:** Day 1–2

**Description:**
Extend preview endpoint to simulate a user answering the current field. Pass an optional `testAnswer` param and return the AI's response + next question.

**Acceptance Criteria:**
- [ ] Optional `testAnswer` parameter in preview endpoint payload
- [ ] If provided, simulate `conversation.handleMessage()` logic with test answer
- [ ] Return structure includes:
  ```json
  {
    "systemPrompt": "...",
    "greetingPrompt": "...",
    "lastResponse": "AI's response to test answer",
    "nextQuestion": "Next question (or completion message)",
    "conversationState": "IN_PROGRESS | COMPLETED",
    "currentFieldIndex": 1,
    "fieldsSoFar": [{ fieldId, value, label }]
  }
  ```
- [ ] Handles invalid answers gracefully (returns clarifying prompt, stays on same field)
- [ ] Handles field answer validation per type (email, number ranges, etc.)
- [ ] No state persistence (results not saved)
- [ ] Supports multiple sequential test answers in same preview request (optional enhancement: accept `testAnswers: [...]`)

**Technical Notes:**
- Reuse: `conversationService.handleMessage()` logic but without session persistence
- Validation: `formFieldValidator.ts` existing rules apply
- Answer mapping: follow `CollectedAnswer` interface interface

**Test Cases:**
- Test answer matches field type (email→valid) → advance to next field
- Test answer doesn't match type (email→"not-an-email") → clarifying prompt, stay on same field
- Test answer to required field is empty → clarification, stay on same
- Test answer to optional field is "skip" → advance
- Multiple sequential answers in one request → progressive field advancement

---

#### **B1-203: Cache Preview Results by Form Draft Hash**
- **Assignee:** Backend Lead
- **Story Points:** 2
- **Parent:** B1 Epic
- **Dependency:** B1-201, B1-202 (parallel during development)
- **Due:** Day 2–3

**Description:**
Implement in-memory caching of preview results indexed by SHA-256 hash of form fields + chatConfig. Invalidate on structural changes.

**Acceptance Criteria:**
- [ ] Cache key: `SHA256(JSON.stringify({ fields, chatConfig }))`
- [ ] Cache TTL: 1 hour (configurable)
- [ ] Cache storage: in-memory (Node.js `Map`, not Redis for now)
- [ ] Cache hit check before calling conversation service
- [ ] Cache invalidation: clear entire cache on POST /forms/{formId}/update
- [ ] Metrics: log cache hit/miss rates (INFO level)
- [ ] Memory safety: evict oldest entries if cache size > 1000 results (LRU)

**Technical Notes:**
- Implementation: `formless-backend/apps/api/src/forms/preview-cache.ts` (new file)
- Integrate with B1-201 endpoint logic
- Configuration: `process.env.PREVIEW_CACHE_TTL_MINUTES` (default 60)

**Test Cases:**
- Same fields + tone → cache hit, returns instantly
- Different fields → cache miss, generates new preview
- User updates form → cache is cleared
- Cache filled to 1000 entries, add 1001st → oldest evicted
- Verify no memory leaks after 1000 preview cycles

---

#### **B1-204: Performance Optimization — Preview Latency <200ms p99**
- **Assignee:** Backend Lead
- **Story Points:** 2
- **Parent:** B1 Epic
- **Dependency:** B1-201, B1-202, B1-203
- **Due:** Day 3–4

**Description:**
Profile, optimize, and validate preview API achieves <200ms p99 latency for typical 5-7 field forms.

**Acceptance Criteria:**
- [ ] Baseline latency measured: first preview (cold cache), p50/p95/p99
- [ ] Cached preview: <50ms p99 on hit
- [ ] Cold preview: <200ms p99 on miss
- [ ] AI model selection verified: GPT-4o not required (use gpt-3.5-turbo if cheaper/faster)
- [ ] Profiling: identify slowest operation (AI latency vs. schema parsing vs. DB lookup)
- [ ] If AI calls dominant: implement request batching or streaming (optional enhancement)
- [ ] Load test: 10 concurrent preview requests → p99 stays <200ms

**Technical Notes:**
- Tools: `pino` logger with timing middleware
- Profiling: Node.js built-in `node --prof`
- Load test: `artillery` or `k6`

**Test Cases:**
- 1 field form → <100ms p99
- 10 field form → <200ms p99
- 50 concurrent requests → no timeout, p99 <500ms
- Memory stable (no leaks) during load test

---

### **Frontend (B1-1xx) — UI/UX & Debouncing**

#### **B1-101: Upgrade ChatPreview Component to Call Preview API**
- **Assignee:** Frontend Lead
- **Story Points:** 3
- **Parent:** B1 Epic
- **Dependency:** B1-201 (backend parallel)
- **Due:** Day 1–2

**Description:**
Extend the existing [ChatPreview.tsx](formless-frontend/src/components/form-builder/preview/ChatPreview.tsx) component to fetch live previews from the new backend API instead of using hardcoded mock data.

**Acceptance Criteria:**
- [ ] ChatPreview accepts new props:
  - `formId: string` (for API calls)
  - `isDraft: boolean` (show/hide "draft" badge)
  - `onPreviewLoading: (loading: boolean) => void` (for loading indicator)
- [ ] Fetch preview on mount with current fields + chatConfig
- [ ] Render:
  - `systemPrompt` (hidden in UI, logged for debugging)
  - `greetingPrompt` as first AI message
  - `nextQuestion` (optional, shown if present)
- [ ] Error state: show error toast, fallback to last good preview
- [ ] Loading state: gray out preview or show skeleton
- [ ] Preview always ready (optimistic rendering if API throttled)
- [ ] No changes to MessageList/MessageItem primitives (reuse exactly)
- [ ] Prop drilling: keep component shallow (max 3 levels from FormBuilder)

**Technical Notes:**
- Component: [formless-frontend/src/components/form-builder/preview/ChatPreview.tsx](formless-frontend/src/components/form-builder/preview/ChatPreview.tsx)
- API client: Add helper to [formless-frontend/src/lib/api/organizations.ts](formless-frontend/src/lib/api/organizations.ts):
  ```typescript
  export const getFormPreview = async (orgId: string, formId: string, payload: PreviewPayload) => {
    const res = await apiFetch(`${BASE(orgId)}/forms/${formId}/preview`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.json().message);
    return res.json().data;
  };
  ```

**Test Cases:**
- Render ChatPreview with formId → calls API on mount
- API returns greeting → displays as first message
- API error → shows toast, renders last good preview
- Props change (fields update) → triggers new API call (handled by debouncer, see B1-102)

---

#### **B1-102: Add Debounced Preview Updates with AbortController**
- **Assignee:** Frontend Lead
- **Story Points:** 2
- **Parent:** B1 Epic
- **Dependency:** B1-101 (sequential)
- **Due:** Day 2

**Description:**
Wire FormBuilder's field/tone/welcome edits to trigger debounced preview API calls. Cancel stale requests to prevent race conditions.

**Acceptance Criteria:**
- [ ] Debounce timer: 300–600ms (configurable, default 450ms)
- [ ] Trigger on changes to:
  - Fields array (add, remove, reorder, edit field label/type/options)
  - chatConfig: aiName, tone, welcomeMessage
  - (NOT on cosmetic changes: branding color, avatar URL, etc.)
- [ ] Each new debounce cancels previous in-flight request via AbortController
- [ ] No duplicate pending requests (stale requests rejected)
- [ ] Show loading indicator in preview header while API is in-flight
- [ ] On API success: update preview immediately
- [ ] On API error: keep last good preview, show error toast (not blocking)
- [ ] On API timout (>5s): abort and show toast, keep last preview
- [ ] Debounce timer resets on each keystroke (standard UX)

**Technical Notes:**
- Pattern: Reuse existing `AUTOSAVE_DEBOUNCE_MS = 1200` pattern from FormBuilder
- AbortController: already supported in modern fetch API
- Integration point: [formless-frontend/src/components/form-builder/FormBuilder.tsx](formless-frontend/src/components/form-builder/FormBuilder.tsx) (add hook or ref-based logic)

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

const triggerPreviewUpdate = useCallback(async (draft) => {
  // Cancel previous request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  
  abortControllerRef.current = new AbortController();
  
  try {
    const result = await getFormPreview(orgId, formId, {
      fields: draft.fields,
      chatConfig: draft.chatConfig,
    }, abortControllerRef.current.signal);
    setPreview(result);
  } catch (err) {
    if (err.name !== 'AbortError') {
      toast.error('Preview update failed');
    }
  }
}, [orgId, formId]);

// Debounce on field/chatConfig changes
useEffect(() => {
  const timer = setTimeout(() => triggerPreviewUpdate(currentDraft), 450);
  return () => clearTimeout(timer);
}, [currentDraft.fields, currentDraft.chatConfig]);
```

**Test Cases:**
- Rapid typing 10 field label changes → only 1 API call (first + one final debounced call)
- In-flight API call, new field added → previous request aborted, new one sent
- Network delay 2s, debounce 450ms → only 1 request sent (not 2)
- API timeout → preview freezes to last good state, toast shown

---

#### **B1-103: Add Test Answer Input to ChatPreview**
- **Assignee:** Frontend Lead
- **Story Points:** 3
- **Parent:** B1 Epic
- **Dependency:** B1-101, B1-202 (backend)
- **Due:** Day 2–3

**Description:**
Add optional "Test answer" input below the live preview. User types a test response, and the preview updates to show the AI's branching response + next question.

**Acceptance Criteria:**
- [ ] New input field in ChatPreview below chat messages:
  - Placeholder: "Test an answer..." | "e.g. john@example.com"
  - Only visible when preview is ready (not loading)
- [ ] On Enter key press:
  - Disable input (show loading spinner)
  - Call preview API with `testAnswer` param
  - Append user's test message to chat history
  - Append AI's response + next question to chat history
  - Clear input field and re-enable
- [ ] Multiple test answers: each call shows progressive conversation flow
  - User types "John" → AI: "Nice to meet you, John..." + next question
  - User types "john@example.com" in next → AI: "Got it!" + third question
  - Etc.
- [ ] Reset button: clears all test messages, shows only original greeting
- [ ] Test flow is isolated (doesn't save to backend or affect real form)
- [ ] Styling: matches chat bubble UX (user messages on right, AI on left)

**Technical Notes:**
- Component: Extend ChatPreview.tsx with new section
- Input styling: reuse ChatInput component patterns but simplified (no file upload, etc.)
- Chat history state: extend with `isTestMessage: boolean` flag to distinguish from real answers

**Test Cases:**
- Type test answer, press Enter → API called, response appended
- API returns error → show error toast, keep input enabled
- Type second test answer → shows progressive conversation
- Click Reset → clears all test messages, shows original greeting
- Rapid Enter presses → last request wins (AbortController behavior from B1-102)

---

#### **B1-104: Cache Latest Preview by Draft Hash (Frontend)**
- **Assignee:** Frontend Lead
- **Story Points:** 2
- **Parent:** B1 Epic
- **Dependency:** B1-101, B1-102
- **Due:** Day 3

**Description:**
Implement client-side memory cache of preview results to handle API throttling gracefully. Show last good preview if API is slow.

**Acceptance Criteria:**
- [ ] Cache key: `SHA256(JSON.stringify({ fields, chatConfig }))`
- [ ] Cache structure: `Map<string, PreviewResult>` in component state or Ref
- [ ] Cache hit check before calling API
- [ ] Store result after successful API response
- [ ] Invalidate on structural changes (field add/remove/reorder)
- [ ] Optimistic rendering: if debounced update is slow, show last cached preview immediately
- [ ] Memory clean-up: clear cache on component unmount
- [ ] Cache size limit: max 50 cached previews (reasonable for a single form editing session)

**Technical Notes:**
- Crypto: Use `subtle.digest('SHA-256', ...)` or npm `crypto-js`
- State: Add `const previewCacheRef = useRef<Map<string, PreviewResult>>(new Map())`

**Test Cases:**
- Edit field, hit API → preview updates (cache hit on next identical edit)
- Revert field to previous state → shows cached preview instantly (no API call)
- Cache filled to 50 items → evict oldest on new entry
- Unmount component → cache cleared (no memory leak)

---

### **Testing (B1-4xx) — Parity & Snapshot Tests**

#### **B1-401: Create Snapshot Tests for Preview Parity (5 Field Types × 3 Tones)**
- **Assignee:** QA Lead / Frontend
- **Story Points:** 5
- **Parent:** B1 Epic
- **Dependency:** B1-101, B1-201 (both ready)
- **Due:** Day 3–4

**Description:**
Build snapshot tests to verify preview rendering matches production chat behavior across 5 key field types and 3 tone modes. Ensure parity.

**Acceptance Criteria:**
- [ ] Test matrix: 5 field types × 3 tones = 15 test cases
  - Field types: SHORT_TEXT, MULTIPLE_CHOICE, EMAIL, DATE, LINEAR_SCALE
  - Tones: friendly, professional, concise
- [ ] For each combo, verify:
  - AI greeting message is generated ✓
  - First question is asked ✓
  - Tone is reflected in wording (friendly: warm language, professional: formal) ✓
  - Field type generates appropriate prompt (MULTIPLE_CHOICE: lists options) ✓
- [ ] Snapshots stored in `formless-frontend/src/__snapshots__/preview-parity.test.ts`
- [ ] Test framework: Jest + `react-test-renderer` or similar
- [ ] Snapshots versioned in git (committed to repo)
- [ ] CI: snapshot tests run on every PR (update snapshots only on purpose)
- [ ] Documentation: README explaining when/how to update snapshots

**Technical Notes:**
- Test file: `formless-frontend/src/components/form-builder/preview/__tests__/ChatPreview.parity.test.tsx`
- Test data: minimal form fixtures with above field types
- Snapshot format: human-readable (not minified)

```typescript
describe('ChatPreview Parity (5 Field Types × 3 Tones)', () => {
  const fieldTypes = ['SHORT_TEXT', 'MULTIPLE_CHOICE', 'EMAIL', 'DATE', 'LINEAR_SCALE'];
  const tones = ['friendly', 'professional', 'concise'];

  fieldTypes.forEach(fieldType => {
    tones.forEach(tone => {
      it(`renders ${fieldType} + ${tone} tone correctly`, async () => {
        const form = createTestForm(fieldType, tone);
        const { container } = render(<ChatPreview form={form} />);
        expect(container).toMatchSnapshot();
      });
    });
  });
});
```

**Test Cases:**
- SHORT_TEXT + friendly → "What's your name?" (warm greeting)
- MULTIPLE_CHOICE + professional → "Please select one of the following:" (formal list)
- EMAIL + concise → "Email address?" (terse)
- DATE + friendly → "When would work best?" (conversational)
- LINEAR_SCALE + professional → "Rate your satisfaction (1=Unsatisfied, 5=Very Satisfied):"

---

#### **B1-402: Production vs. Preview Parity Test (End-to-End)**
- **Assignee:** QA Lead
- **Story Points:** 3
- **Parent:** B1 Epic
- **Dependency:** B1-101, B1-103, B1-201
- **Due:** Day 4

**Description:**
Ensure preview behavior matches production chat behavior. Run same form through preview API and production chat endpoint; compare outputs.

**Acceptance Criteria:**
- [ ] Test flow:
  1. Create test form (5 fields, mixed types)
  2. Call preview endpoint with empty testAnswers → capture greeting
  3. Call production chat `/conversation/start` with same form → capture greeting
  4. Diff the two greetings (should be identical or within 95% similarity)
  5. Repeat for test answers: simulate 3 field answers in both paths
  6. Compare AI responses at each step
- [ ] Similarity threshold: greeting within 95%, answers within 90% (account for LLM variance)
- [ ] Tools: String similarity scorer (cosine similarity or Levenshtein distance)
- [ ] Test runs on: 5 different forms (various field distributions)
- [ ] Failure tolerance: ≤1 failure per 5 tests (LLM variance allowed)
- [ ] Logs: detailed diff output for debugging

**Technical Notes:**
- Test file: `formless-backend/apps/api/test/preview.parity.e2e.spec.ts`
- Similarity lib: `string-similarity` npm package
- Setup: spin up test DB, seed test forms

**Test Cases:**
- Form A (3 SHORTs + 1 DATE) → preview greeting ≈ production greeting (95%)
- Form B (5 MULTIPLE_CHOICE) → test answer "Option 2" → both return similar next question
- Form C (2 EMAILS + 1 LINEAR_SCALE) → 3 sequential test answers show identical conversation flow

---

#### **B1-403: Performance Regression Tests**
- **Assignee:** Backend Lead / DevOps
- **Story Points:** 2
- **Parent:** B1 Epic
- **Dependency:** B1-201, B1-202, B1-203, B1-204
- **Due:** Day 4–5

**Description:**
Automated performance tests to ensure preview API stays <200ms p99 and memory doesn't leak under load.

**Acceptance Criteria:**
- [ ] Load test: 50 concurrent preview requests
  - p50 latency < 100ms
  - p95 latency < 180ms
  - p99 latency < 200ms
  - 0 timeouts/errors
- [ ] Memory leak test: 500 sequential preview calls
  - Heap size stable (± 10% variance allowed)
  - No detached DOM nodes or unresolved promises
  - GC runs and reclaims memory
- [ ] Cache effectiveness: measure hit rate
  - First 50 requests (cold): average latency 150ms
  - Repeated requests (warm): average latency <50ms
  - Hit rate ≥ 60% in realistic usage (same form edited repeatedly)
- [ ] Baseline: record metrics in CI output for regression detection
- [ ] Failure criteria: if p99 > 250ms or memory grows >20%, fail test

**Technical Notes:**
- Load testing: `k6` or `artillery`
- Memory profiling: Node.js `--inspect` + Chrome DevTools
- CI integration: GitHub Actions workflow

```yaml
- name: Run Performance Regression Tests
  run: |
    npm run test:performance
    # Compare against baseline, fail if exceeds thresholds
```

**Test Cases:**
- 50 concurrent requests to cold preview endpoint → all < 200ms
- 500 sequential requests with 80% cache hits → memory stable, no leaks
- Cache hit rate ≥ 60% when editing same form 100 times

---

### **Documentation (B1-5xx) — Guides & Runbooks**

#### **B1-501: Create WYSIWYG Builder Developer Guide**
- **Assignee:** Tech Writer / Frontend Lead
- **Story Points:** 3
- **Parent:** B1 Epic
- **Dependency:** B1-101, B1-102, B1-103 (UI features ready)
- **Due:** Day 4–5

**Description:**
Write comprehensive guide for developers extending the WYSIWYG builder (adding new field types, customizing preview rendering, tuning debounce parameters).

**Acceptance Criteria:**
- [ ] Document structure (markdown, 15–20 minute read):
  1. **Overview** — What is WYSIWYG preview, why it matters
  2. **Architecture** — Split pane layout, debounce flow, API contract
  3. **Component Hierarchy** — FormBuilder → ChatPreview + FieldEditor dependency tree
  4. **Adding a New Field Type** — Step-by-step walkthrough (code-first example)
     - Add type to FormField enum
     - Update FieldEditor component
     - Update ChatPreview rendering
     - Add snapshot test case
     - Test with preview API
  5. **Customizing Preview Rendering** — Show how to override MessageItem styling
  6. **Tuning Debounce** — Impact of 300ms vs 600ms vs 1000ms debounce
  7. **API Contract** — Full endpoint reference, request/response schemas
  8. **Troubleshooting** — Common issues (API timeout, cache stale, preview doesn't update)
  9. **Performance Tips** — Reducing API calls, caching strategies
  10. **Testing** — Running snapshot tests, adding new test cases

- [ ] Code examples: at least 5 (add field type, override styling, test case, etc.)
- [ ] Diagrams: 2–3 (split pane layout, data flow, FSM)
- [ ] Links to relevant source files (repo links)
- [ ] Target audience: junior-mid developers, familiarity with React + TypeScript

**Technical Notes:**
- File: `formless-frontend/docs/WYSIWYG_BUILDER_DEVELOPER_GUIDE.md`
- Format: Markdown with code blocks, mermaid diagrams
- Accessibility: alt text for diagrams

**Acceptance Criteria Verification:**
- [ ] New dev can add DATE_RANGE field type following guide (no Slack questions)
- [ ] Guide is auto-linked in frontend README

---

#### **B1-502: Create Quick Start — Preview Setup Troubleshooting**
- **Assignee:** Tech Writer
- **Story Points:** 2
- **Parent:** B1 Epic
- **Dependency:** B1-101, B1-201, B1-102
- **Due:** Day 5

**Description:**
Troubleshooting matrix: common issues, root causes, and fixes for WYSIWYG preview not working.

**Acceptance Criteria:**
- [ ] Matrix format: Symptom | Why | Confirmation | Fix
- [ ] At least 8 common issues:
  1. Preview not loading → API 404 → Check formId in URL | Reload page
  2. Preview stuck on first message → debounce timer stuck | Check console errors | Clear cache, refresh
  3. Test answer doesn't advance → validation error | Check browser console | Verify field has options configured
  4. Preview slow (>1s) → API timeout or cold cache | Open DevTools Network | Wait for cache warm-up
  5. Tone not reflected in greeting → custom personality overriding | Check chatConfig.customPersonality | Use tone preset instead
  6. Memory leaking on rapid edits → AbortController not clearing | Monitor heap in DevTools | File issue if persists
  7. Field type mismatch in preview vs. editor → schema deserialization error | Check form.fields is valid JSON | Resave form
  8. Error: "Preview cache hit but data stale" → rare edge case | Clear browser Storage → Refresh

- [ ] Link to monitoring/debugging tools (Chrome DevTools, Network tab, Console logs)
- [ ] Performance checklist: "Preview should feel instant (300ms or less)"

**Technical Notes:**
- File: `formless-frontend/docs/WYSIWYG_TROUBLESHOOTING.md`
- Format: Markdown table

---

#### **B1-503: Update Frontend README with WYSIWYG Section**
- **Assignee:** Tech Writer
- **Story Points:** 1
- **Parent:** B1 Epic
- **Dependency:** B1-501, B1-502
- **Due:** Day 5

**Description:**
Add WYSIWYG builder section to frontend README with quick links to guides, architecture diagram, and common tasks.

**Acceptance Criteria:**
- [ ] New section in `formless-frontend/README.md`:
  ```markdown
  ## WYSIWYG Form Builder

  The split-pane builder provides real-time form preview while editing.
  
  **Key Features:**
  - Live preview of conversational form flow
  - Instant sync on field edits (300ms debounce)
  - Test answer simulation for branching logic
  - <200ms API latency for smooth UX
  
  **Quick Links:**
  - [Developer Guide](./docs/WYSIWYG_BUILDER_DEVELOPER_GUIDE.md) — Extend preview, add field types
  - [Troubleshooting](./docs/WYSIWYG_TROUBLESHOOTING.md) — Common issues & fixes
  - [Architecture](./docs/WYSIWYG_BUILDER_DEVELOPER_GUIDE.md#architecture) — Debounce flow, API contract
  ```

- [ ] Link to WYSIWYG_BUILDER_DEVELOPER_GUIDE.md and WYSIWYG_TROUBLESHOOTING.md

---

### **Operations (B1-6xx) — Deployment & Monitoring**

#### **B1-601: Create Preview API Deployment & Monitoring Setup**
- **Assignee:** DevOps / Backend Lead
- **Story Points:** 2
- **Parent:** B1 Epic
- **Dependency:** B1-201, B1-202, B1-203
- **Due:** Day 4–5

**Description:**
Set up monitoring, alerting, and deployment scripts for preview API in staging and production.

**Acceptance Criteria:**
- [ ] Metrics to track:
  - **preview_api_latency** (histogram): p50, p95, p99 per endpoint
  - **preview_cache_hit_rate** (gauge): % of requests served from cache
  - **preview_cache_size** (gauge): current # of cached previews
  - **preview_api_errors** (counter): failed requests by error type
  - **preview_memory** (gauge): heap used by preview caching
- [ ] Alerts:
  - Alert if p99 latency > 250ms (threshold: warning)
  - Alert if p99 latency > 300ms (threshold: critical, page oncall)
  - Alert if cache hit rate < 30% (possible performance issue)
  - Alert if heap used > 500MB (memory leak)
- [ ] Dashboard: Create Grafana/Datadog dashboard showing:
  - Latency percentiles (p50, p95, p99)
  - Cache hit rate over time
  - Request volume
  - Error rate
- [ ] Deployment: Add preview related env vars to terraform/k8s configs:
  - `PREVIEW_API_ENABLED=true`
  - `PREVIEW_CACHE_TTL_MINUTES=60`
  - `PREVIEW_MAX_CACHE_SIZE=1000`
- [ ] Runbook: Document steps to:
  - Scale preview endpoints if latency increases
  - Clear cache if corruption detected
  - Rollback preview API if critical bug found
- [ ] Smoke test: POST to `/api/forms/{test-formId}/preview` returns 200 in <300ms

**Technical Notes:**
- Logging: Use existing Winston/Pino setup, add `preview` context
- Metrics: Prometheus scrape endpoint (if using Prom) or CloudWatch (if AWS)
- Monitoring platform: Datadog, Grafana, or CloudWatch (per your infra)

---

#### **B1-602: Create Load Test Script & Baseline**
- **Assignee:** DevOps
- **Story Points:** 2
- **Parent:** B1 Epic
- **Dependency:** B1-201, B1-203, B1-204
- **Due:** Day 4–5

**Description:**
Create repeatable load test simulating realistic preview usage (rapid field edits, concurrent builders).

**Acceptance Criteria:**
- [ ] Load test script: `formless-backend/load-tests/preview-api.k6.js` (or artillery)
- [ ] Scenarios:
  1. **Single user rapid edits:** 1 user edits 50 fields in sequence, 450ms debounce → 50 API calls over 22s
  2. **Concurrent users:** 10 concurrent users, each editing same form → 10 parallel requests
  3. **Cold cache:** First 100 unique forms (cache misses) → baseline latency
  4. **Warm cache:** Repeated edits to same form (cache hits) → cached latency
  5. **Cache eviction:** Fill cache to 1000 items, add 1001st → measure eviction time
- [ ] Run baseline and store results:
  - Command: `npm run test:load`
  - Output: `formless-backend/load-tests/baseline.json` (committed to repo)
  - p50/p95/p99 latencies stored
- [ ] CI integration: Run load tests on every backend deploy (or nightly)
- [ ] Regression detection: if p99 > 110% of baseline → fail test
- [ ] Documentation: README explaining how to run locally, interpret results

**Technical Notes:**
- Framework: `k6` (modern, supports JavaScript, good for API testing)
- Setup: Docker compose stack for isolated testing
- Metrics: Capture to JSON for historical comparison

---

### **Risk Matrix & Mitigations**

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| **Preview API too slow (<200ms p99 unachievable)** | High | Medium | B1-204: Profile + optimize early. If AI model is bottleneck, switch to faster model (GPT-3.5 vs 4o). Implement streaming if needed. |
| **Memory leak in preview cache** | High | Low | B1-203: LRU eviction policy. B1-403: Memory regression tests catch leaks early. Monitor heap in prod (B1-601). |
| **Preview ↔ Production parity broken** | High | Medium | B1-401: 15 snapshot tests. B1-402: E2E parity tests compare outputs. Diffs caught before merge. |
| **Cache hit rate too low (<30%)** | Medium | Low | B1-102: Debounce 450ms ensures same draft hashes. B1-403: Load test measures actual hit rate. B1-601: Alert if < 30%. |
| **Test answer simulation creates bugs in branching** | Medium | Medium | B1-402: E2E tests compare test flow with production chat. Regression tests catch on deploy. |
| **Concurrent edits cause race conditions** | High | Low | B1-102: AbortController prevents race conditions (only latest request matters). Test validates no dupes. |
| **New field type breaks preview rendering** | Medium | Medium | B1-401: Snapshot tests for 5 types. New types must pass tests before merge. Developer guide (B1-501) shows safe pattern. |
| **CSP blocking preview endpoint calls** | Medium | Low | Preview endpoint same-origin (no CORS). CORS not needed. If issues arise, add to CSP whitelist. |
| **Performance regression in subsequent features** | Medium | Medium | B1-403: Baseline latency recorded. New changes that degrade >10% fail tests. Monitored in prod (B1-601). |

---

## 3. Dependency Graph & Sequencing

```
┌─────────────────────────────────────────────────────────────────┐
│ Day 1: Backend Preview Endpoint (Parallel with Frontend UI)    │
├─────────────────────────────────────────────────────────────────┤
│ B1-201: Create Preview Endpoint (backend)                       │
│ B1-101: Upgrade ChatPreview to call API (frontend)             │
│ Dependencies: None (both start independently)                   │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Day 2: Test Answer + Debouncing (Sequential, waiting on B1-201)│
├─────────────────────────────────────────────────────────────────┤
│ B1-202: Test Answer Simulation (backend) ← after B1-201        │
│ B1-102: Debounced Updates (frontend) ← after B1-101            │
│ B1-103: Test Answer Input UI (frontend) ← after B1-101         │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Day 3: Caching + Testing Prep                                   │
├─────────────────────────────────────────────────────────────────┤
│ B1-203: Cache Preview by Draft Hash (backend) ← after B1-201   │
│ B1-104: Client Cache (frontend) ← after B1-101                 │
│ B1-401: Snapshot Tests (QA) ← after B1-101, B1-201             │
│ B1-402: Parity E2E Tests (QA) ← after B1-101, B1-201           │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Day 4: Performance + Docs                                        │
├─────────────────────────────────────────────────────────────────┤
│ B1-204: Optimize to <200ms (backend) ← after B1-201            │
│ B1-403: Performance Tests (QA) ← after B1-204, B1-203          │
│ B1-501: Developer Guide (docs) ← after B1-101, B1-102, B1-103  │
│ B1-601: Deployment & Monitoring (ops) ← after B1-201           │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Day 5: Finalization                                              │
├─────────────────────────────────────────────────────────────────┤
│ B1-502: Troubleshooting Guide (docs)                            │
│ B1-503: Update README (docs)                                    │
│ B1-602: Load Test Script (ops)                                  │
│ Integration Testing: All features together                      │
│ Code Review & Merge to main                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Ticket Summary Table

| Ticket | Title | SP | Days | Owner | Status |
|--------|-------|----|----|-------|--------|
| **B1-201** | Create Preview Endpoint | 3 | 1 | Backend | Ready |
| **B1-202** | Test Answer Simulation | 3 | 1–2 | Backend | Blocked on B1-201 |
| **B1-203** | Cache by Draft Hash | 2 | 2–3 | Backend | Blocked on B1-201 |
| **B1-204** | Latency Optimization | 2 | 3–4 | Backend | Blocked on B1-203 |
| **B1-101** | Upgrade ChatPreview API Integration | 3 | 1–2 | Frontend | Ready |
| **B1-102** | Debounced Updates | 2 | 2 | Frontend | Blocked on B1-101 |
| **B1-103** | Test Answer Input UI | 3 | 2–3 | Frontend | Blocked on B1-202 |
| **B1-104** | Client Cache | 2 | 3 | Frontend | Blocked on B1-101 |
| **B1-401** | Snapshot Tests (5×3) | 5 | 3–4 | QA | Blocked on B1-101, B1-201 |
| **B1-402** | Parity E2E Tests | 3 | 4 | QA | Blocked on B1-101, B1-201 |
| **B1-403** | Performance Regression Tests | 2 | 4–5 | QA/Backend | Blocked on B1-204 |
| **B1-501** | Developer Guide | 3 | 4–5 | Docs | Blocked on B1-101, B1-102, B1-103 |
| **B1-502** | Troubleshooting Guide | 2 | 5 | Docs | Blocked on B1-101, B1-201, B1-102 |
| **B1-503** | Update README | 1 | 5 | Docs | Blocked on B1-501, B1-502 |
| **B1-601** | Monitoring & Deployment | 2 | 4–5 | Ops | Blocked on B1-201, B1-203 |
| **B1-602** | Load Test Script | 2 | 4–5 | Ops | Blocked on B1-204 |
| | **TOTAL** | **42 SP** | **~5 days** | **Team** | — |

---

## 5. Success Criteria & Exit Gates

### **Exit Criteria for B1 Epic**

- [ ] **Feature Complete:** All 16 tickets closed
- [ ] **Testing:** All 15 snapshot tests + 2 E2E tests passing
- [ ] **Performance:** Preview API p99 < 200ms, cache hit rate ≥ 60%
- [ ] **Memory:** No leaks detected in load tests (heap stable)
- [ ] **Parity:** Production vs. preview outputs match (≥95% similarity)
- [ ] **Docs:** Developer guide + troubleshooting guide complete and link-checked
- [ ] **Monitoring:** Alerts configured, baseline metrics recorded
- [ ] **Code Review:** All PRs approved, no open comments
- [ ] **Regression:** No performance regression from B1.0 baseline
- [ ] **Smoke Test:** Live form editing in staging shows <500ms preview update latency

### **Definition of Done (per Ticket)**

Each ticket must have:
1. ✅ Code changes merged to `main`
2. ✅ Tests passing (unit + integration)
3. ✅ Test coverage ≥80% for new code
4. ✅ PR reviewed and approved by pair
5. ✅ Changelog/docs updated
6. ✅ No console errors or warnings
7. ✅ No performance regressions
8. ✅ Commit message references ticket (e.g., `B1-201: Add preview endpoint`)

---

## 6. Team Assignment Recommendations

| Role | Tickets | Estimated Allocation |
|------|---------|----------------------|
| **Backend Lead** | B1-201, B1-202, B1-203, B1-204 | 3–4 days (start Day 1, critical path) |
| **Frontend Lead** | B1-101, B1-102, B1-103, B1-104 | 3–4 days (parallel with backend) |
| **QA/Test Lead** | B1-401, B1-402, B1-403 | 2–3 days (Day 3–5) |
| **Tech Writer** | B1-501, B1-502, B1-503 | 1–2 days (Day 4–5) |
| **DevOps** | B1-601, B1-602 | 1–2 days (Day 4–5) |

**Parallel Execution:** Backend + Frontend can start Day 1 independently. Testing & docs follow after features ready.

---

## Appendix: Confluence/Jira Tagging

**Epic:** B1 (WYSIWYG Split Builder)
**Project:** Formless
**Labels:** `feature:builder`, `priority:high`, `milestone:v1.5`
**Sprints:** Assign to upcoming sprints (B1-2xx and B1-1xx → Sprint N, B1-4xx → Sprint N+1)
**Link to A3:** Parent: `A3 Epic` (demonstrated embed capability, now showing powerful builder UX)
