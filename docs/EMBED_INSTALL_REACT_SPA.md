# Install Guide: React SPA

## Time Budget

Expected install time: 10-15 minutes.

## Prerequisites

- Published form token from ZeroFill.
- Host domain added to allowed domains.

## Option A: `public/index.html`

Paste before `</body>`:

```html
<script
  src="https://0fill.vercel.app/widget/v1.js"
  data-zerofill-token="YOUR_CHAT_LINK_TOKEN"
  data-mode="bubble"
  data-position="bottom-right"
  data-auto-open="false"
></script>
```

## Option B: Load once from app root

```tsx
// src/App.tsx
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    if (document.getElementById('zerofill-widget-loader')) return;

    const s = document.createElement('script');
    s.id = 'zerofill-widget-loader';
    s.src = 'https://0fill.vercel.app/widget/v1.js';
    s.setAttribute('data-zerofill-token', 'YOUR_CHAT_LINK_TOKEN');
    s.setAttribute('data-mode', 'bubble');
    s.async = true;
    document.body.appendChild(s);

    return () => {
      // Optional: keep it mounted across route changes in SPAs.
    };
  }, []);

  return <main>Your app</main>;
}
```

## Verify

1. Reload app and confirm widget icon appears.
2. Open widget and verify chat loads.
3. Confirm events in ZeroFill dashboard embed telemetry panel.
