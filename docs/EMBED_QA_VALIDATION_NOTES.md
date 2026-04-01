# Embed QA Validation Notes

## Scope

Validate embed installation and telemetry funnel across:

- Next.js app
- React SPA
- WordPress site
- Shopify storefront

## Environment

- Widget runtime: `widget/v1.js`
- API base: `https://0fill.vercel.app/api`
- Test form: published with stable token
- Domain allowlist configured for all target hosts

## Validation Steps

1. Install target-specific snippet from guide.
2. Hard refresh and clear site cache/CDN cache.
3. Verify runtime assets load.
4. Open widget and send first user message.
5. Confirm events in DB-backed dashboard:
   - `widget_loaded`
   - `widget_opened`
   - `conversation_started_from_embed`
6. Confirm dashboard cards update:
   - Loaded
   - Opened
   - Started Conversations
   - Open and start rates
7. Confirm segmentation tables include:
   - Host domain row for target host
   - Embed mode row for selected mode

## Pass Criteria

- Install completed in <= 15 minutes from docs only.
- Conversation start reproducible in all 4 targets.
- Event chain visible from runtime to dashboard.
- Host and mode segmentation populated.

## Evidence to Capture

- Screenshot of page with widget rendered.
- Network trace showing `/widget-config`, `/widget-events`, `/start`.
- Dashboard screenshots for funnel and segmentation.
- Any console errors and final fix notes.

## Result Template

| Target | Install Time | Loaded | Opened | Started | Host Segment | Mode Segment | Pass/Fail | Notes |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Next.js |  |  |  |  |  |  |  |  |
| React SPA |  |  |  |  |  |  |  |  |
| WordPress |  |  |  |  |  |  |  |  |
| Shopify |  |  |  |  |  |  |  |  |
