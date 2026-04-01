# Install Guide: WordPress

## Time Budget

Expected install time: 10-15 minutes.

## Prerequisites

- Published ZeroFill form token.
- Site domain allowlisted in ZeroFill.

## Method A: Site-wide via plugin (recommended)

1. In WP admin, install and activate **WPCode** (or similar header/footer injector).
2. Navigate to Header & Footer scripts.
3. Add this script to footer section:

```html
<script
  src="https://0fill.vercel.app/widget/v1.js"
  data-zerofill-token="YOUR_CHAT_LINK_TOKEN"
  data-mode="bubble"
  data-position="bottom-right"
></script>
```

4. Save and clear any site cache/CDN cache.

## Method B: Theme footer

Add snippet to `footer.php` before `</body>`.

## Verify

1. Open public page in incognito.
2. Confirm widget appears and opens.
3. Start a conversation and verify dashboard funnel increments.

## WordPress-specific pitfalls

- Optimization plugins may defer/merge scripts incorrectly.
- Full page cache can delay deployment of new snippet.
- Ensure no duplicate script insertion from multiple plugins.
