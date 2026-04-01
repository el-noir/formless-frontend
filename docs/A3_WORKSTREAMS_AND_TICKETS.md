# A3 Parallel Workstreams and Ticket Set

## Parallel Workstreams

### Backend stream

- Snippet API
- Sanitizer
- Handshake
- Validation
- Telemetry ingestion

### Frontend/dashboard stream

- Share tab embed UX
- Preview and copy flows
- Metrics visualization

### Widget stream

- Runtime protocol
- Compatibility
- Event emitter

### Docs/QA stream

- Install guides
- Cross-browser embed matrix
- CSP and domain tests

## Jira-Ready Ticket Titles

- A3-101 Define embed mode contract and protocol v1
- A3-102 Build sanitized snippet generator endpoint
- A3-103 Add domain allowlist error taxonomy
- A3-201 Implement Share Tab Embed configuration UI
- A3-202 Add snippet preview and copy interaction
- A3-203 Add live mini-preview for all embed modes
- A3-301 Add widget handshake config fetch before render
- A3-302 Implement versioned widget URL and compatibility shim
- A3-303 Improve widget runtime error handling and retries
- A3-401 Emit embed telemetry events from widget runtime
- A3-402 Persist and map embed events in telemetry backend
- A3-403 Add embed funnel analytics cards
- A3-501 Publish install docs for Next.js and React
- A3-502 Publish WordPress and Shopify install guides
- A3-503 Add troubleshooting and validation checklist

## A3 Risks and Mitigations

| Risk | Mitigation |
|---|---|
| CSP/script blocking on customer sites | Publish explicit CSP directives and provide inline-free snippet option |
| Backward compatibility breaks | Keep versioned endpoints and runtime adapters |
| Domain allowlist false positives | Normalize host parsing and return clear diagnostics |
| Event volume noise | Sample non-critical events if needed and hash sensitive identifiers |
