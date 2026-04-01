# Embed Troubleshooting Matrix

## Quick Diagnostic Order

1. Confirm token is valid and form is published.
2. Confirm host domain is allowlisted.
3. Check browser console for CSP and network errors.
4. Verify script is injected exactly once.
5. Validate telemetry events arrive in dashboard.

## Matrix

| Symptom | Likely Cause | How to Confirm | Fix |
|---|---|---|---|
| Widget not visible | Script blocked or not injected | No request for `widget/v1.js` in network | Insert snippet before `</body>`, remove blockers, clear cache |
| 403 on widget config | Domain allowlist mismatch | `EMBED_DOMAIN_NOT_ALLOWED` from `/api/public/chat/:token/widget-config` | Add exact host or wildcard in allowlist (`*.example.com`) |
| Widget opens but chat never starts | Embed page loads without session start | No `conversation_started_from_embed` event | Check `/api/public/chat/:token/start` response and URL params |
| CSP error for script | `script-src` blocks runtime | Console CSP violation | Add `https://0fill.vercel.app` to `script-src` |
| CSP error for API calls | `connect-src` blocks telemetry/handshake | `/api/public/chat/*` blocked | Add API origin to `connect-src` |
| Duplicate floating buttons | Script added multiple times | Multiple `widget/v1.js` entries in DOM/network | Add single-injection guard and remove duplicate insertion point |
| Events missing from dashboard | Telemetry endpoint blocked or dropped | No POST to `/widget-events` | Verify network, ad-blockers, and keepalive/beacon support |

## CSP Baseline

Adjust for your exact host setup.

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://0fill.vercel.app;
  connect-src 'self' https://0fill.vercel.app;
  frame-src 'self' https://0fill.vercel.app;
  img-src 'self' data: https:;
  style-src 'self' 'unsafe-inline';
```

## Duplicate Injection Guard (SPA)

```js
if (!document.querySelector('script[src*="/widget/v1.js"]')) {
  // inject script
}
```
