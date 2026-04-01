# Install Guide: Shopify (Generic Script Insert)

## Time Budget

Expected install time: 10-15 minutes.

## Prerequisites

- Published ZeroFill form token.
- Store domain allowlisted in ZeroFill.

## Method A: Theme custom code (recommended)

1. Shopify Admin -> Online Store -> Themes -> Edit code.
2. Open `layout/theme.liquid`.
3. Paste before `</body>`:

```liquid
<script
  src="https://0fill.vercel.app/widget/v1.js"
  data-zerofill-token="YOUR_CHAT_LINK_TOKEN"
  data-mode="bubble"
  data-position="bottom-right"
></script>
```

4. Save and publish theme changes.

## Method B: Custom pixel/script app

Insert same script globally through your script management app.

## Verify

1. Open storefront on desktop and mobile.
2. Confirm widget opens and embed chat starts.
3. Confirm host domain segmentation row appears in embed funnel dashboard.

## Shopify-specific pitfalls

- Theme duplication: snippet added to inactive theme only.
- App-level script plus theme script causes duplicate injection.
- CSP rules from checkout extensions may differ from storefront.
