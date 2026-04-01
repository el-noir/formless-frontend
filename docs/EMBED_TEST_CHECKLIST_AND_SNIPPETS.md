# Test Embed Checklist + Sample Snippets

## Sample Snippets

### Bubble (recommended)

```html
<script
  src="https://0fill.vercel.app/widget/v1.js"
  data-zerofill-token="YOUR_CHAT_LINK_TOKEN"
  data-mode="bubble"
  data-position="bottom-right"
  data-auto-open="false"
></script>
```

### Popup launcher

```html
<script
  src="https://0fill.vercel.app/widget/v1.js"
  data-zerofill-token="YOUR_CHAT_LINK_TOKEN"
  data-mode="popup"
></script>
```

### Inline iframe mode

```html
<script
  src="https://0fill.vercel.app/widget/v1.js"
  data-zerofill-token="YOUR_CHAT_LINK_TOKEN"
  data-mode="inline"
  data-theme-inherit="true"
></script>
```

## QA Checklist (Per Target)

- [ ] Snippet present once on page.
- [ ] Widget renders without console errors.
- [ ] `widget_loaded` appears in telemetry.
- [ ] User can open widget.
- [ ] `widget_opened` appears in telemetry.
- [ ] Chat starts and returns greeting.
- [ ] `conversation_started_from_embed` appears in telemetry.
- [ ] Embed funnel cards increment in dashboard.
- [ ] Host domain segment row exists.
- [ ] Embed mode segment row exists.

## Negative Tests

- [ ] Remove domain from allowlist -> verify clear domain failure.
- [ ] Enforce restrictive CSP -> verify CSP error and mitigation works.
- [ ] Intentionally inject script twice -> verify duplicate issue reproduced and fixed.

## Browser Matrix

- [ ] Chrome latest (desktop)
- [ ] Firefox latest (desktop)
- [ ] Safari latest (desktop/macOS)
- [ ] iOS Safari latest
- [ ] Android Chrome latest
