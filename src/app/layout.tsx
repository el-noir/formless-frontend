import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormAI - Turn Forms Into AI Conversations | No-Code Form Builder",
  description: "Transform static Google Forms into intelligent AI-driven chat experiences that collect structured data automatically. No coding required. Trusted by 2,000+ companies.",
  keywords: [
    "AI forms",
    "conversational forms",
    "form builder",
    "Google Forms alternative",
    "AI chatbot forms",
    "data collection",
    "no-code forms",
    "intelligent forms",
    "form automation",
    "customer surveys"
  ],
  authors: [{ name: "FormAI Team" }],
  creator: "FormAI",
  publisher: "FormAI Inc.",
  metadataBase: new URL('https://formai.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://formai.app',
    title: 'FormAI - Turn Forms Into AI Conversations',
    description: 'Transform static Google Forms into intelligent AI-driven chat experiences. No coding required. Trusted by 2,000+ companies.',
    siteName: 'FormAI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FormAI - AI-Powered Conversational Forms',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FormAI - Turn Forms Into AI Conversations',
    description: 'Transform static Google Forms into intelligent AI-driven chat experiences. No coding required.',
    creator: '@formai',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
