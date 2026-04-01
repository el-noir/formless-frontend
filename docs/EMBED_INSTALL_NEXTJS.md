# Install Guide: Next.js

## Time Budget

Expected install time: 10-15 minutes.

## Prerequisites

- You have a published ZeroFill form with a chat token.
- You added your host domain to ZeroFill allowed domains.
- You can edit your Next.js app layout.

## Option A: Global install (all pages)

Add the script to your root layout.

```tsx
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          id="zerofill-widget"
          src="https://0fill.vercel.app/widget/v1.js"
          strategy="afterInteractive"
          data-zerofill-token="YOUR_CHAT_LINK_TOKEN"
          data-mode="bubble"
          data-position="bottom-right"
          data-auto-open="false"
        />
      </body>
    </html>
  );
}
```

## Option B: Route-only install

Add script only on selected pages using `next/script` in that route page/layout.

## Verify

1. Open page with widget.
2. Confirm floating button appears.
3. Click button and verify chat opens.
4. Send one message and confirm conversation starts.

## Notes

- Do not include both `widget.js` and `widget/v1.js` on the same page.
- Prefer `widget/v1.js` for explicit runtime versioning.
