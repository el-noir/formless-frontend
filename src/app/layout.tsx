import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Formless - Turn Forms Into AI Conversations | No-Code Form Builder",
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
  authors: [{ name: "Formless Team" }],
  creator: "Formless",
  publisher: "Formless Inc.",
  metadataBase: new URL('https://Formless.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://Formless.app',
    title: 'Formless - Turn Forms Into AI Conversations',
    description: 'Transform static Google Forms into intelligent AI-driven chat experiences. No coding required. Trusted by 2,000+ companies.',
    siteName: 'Formless',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Formless - AI-Powered Conversational Forms',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formless - Turn Forms Into AI Conversations',
    description: 'Transform static Google Forms into intelligent AI-driven chat experiences. No coding required.',
    creator: '@Formless',
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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}>
      <body className={`${inter.className} antialiased`}>
        <div className="relative min-h-screen bg-[#0B0B0F] text-white selection:bg-[#9A6BFF] selection:text-white overflow-x-hidden">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
