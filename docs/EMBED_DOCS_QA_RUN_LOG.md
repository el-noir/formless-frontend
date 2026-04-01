# Embed Docs QA Run Log

Use this file to record real execution results for A3.5 documentation quality.

## Goal

Validate that a new developer can complete install in under 15 minutes using docs only, and QA can reproduce successful install across all four targets.

## Run Metadata

- Run date:
- Environment:
- API base URL:
- Widget runtime URL:
- Test form token source:
- QA owner:

## Preflight

- [ ] Form is published
- [ ] Target domains added to allowlist
- [ ] Browsers available per matrix
- [ ] Cache/CDN cleared before run

## Execution Matrix

| Target | Doc Used | Start Time | End Time | Duration (min) | widget_loaded | widget_opened | conversation_started_from_embed | Host Segment Visible | Mode Segment Visible | Pass/Fail | Notes |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---|---|
| Next.js | EMBED_INSTALL_NEXTJS.md |  |  |  |  |  |  |  |  |  |  |
| React SPA | EMBED_INSTALL_REACT_SPA.md |  |  |  |  |  |  |  |  |  |  |
| WordPress | EMBED_INSTALL_WORDPRESS.md |  |  |  |  |  |  |  |  |  |  |
| Shopify | EMBED_INSTALL_SHOPIFY.md |  |  |  |  |  |  |  |  |  |  |

## Troubleshooting Replay

Use [EMBED_TROUBLESHOOTING_MATRIX.md](EMBED_TROUBLESHOOTING_MATRIX.md).

- [ ] Domain allowlist failure reproduced and fixed
- [ ] CSP restriction reproduced and fixed
- [ ] Duplicate script injection reproduced and fixed

Notes:

-

## Evidence Links

- Dashboard screenshots:
- Network traces:
- Console logs:
- PR / commit references:

## Exit Criteria Decision

- [ ] New developer install under 15 minutes from docs only
- [ ] QA successful install in all four targets
- [ ] End-to-end event chain visible in DB and dashboard
- [ ] Segmentation by host domain and embed mode confirmed

Final decision:

- Status: PASS / FAIL
- Sign-off by:
- Date:
