import { Metadata } from 'next';
import { ChatClient } from './ChatClient';

interface PageProps {
    params: Promise<{ token: string }>;
}

async function getFormInfo(token: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    try {
        const res = await fetch(`${apiUrl}/public/chat/${token}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.data;
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { token } = await params;
    const form = await getFormInfo(token);

    if (!form) {
        return {
            title: 'Form Not Found | ZeroFill',
            description: 'The requested form could not be found or is inactive.',
        };
    }

    const title = `${form.title} | ZeroFill`;
    const description = form.description || 'Complete this form via an intelligent AI conversation.';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ZeroFill-frontend.vercel.app';
    const imageUrl = `${appUrl}/api/og?token=${token}`;

    return {
        title: `${form.title} | ZeroFill Chat`,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            images: [
                {
                    url: imageUrl,
                    secureUrl: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function PublicChatPage({ params }: PageProps) {
    const { token } = await params;

    return (
        <ChatClient token={token} />
    );
}
