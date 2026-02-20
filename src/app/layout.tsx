import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Background } from "@/components/Background";

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
        <div className="relative min-h-screen bg-[#0B0B0F] text-white selection:bg-[#9A6BFF] selection:text-white overflow-x-hidden">
          <style>{`
                h1, h2, h3, h4, h5, h6 { font-family: 'Space Grotesk', sans-serif; }
                body { font-family: 'Inter', sans-serif; }
                html { scroll-behavior: smooth; }
              `}</style>
          <Background />
          <Navbar />
          <div className="pt-20">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
