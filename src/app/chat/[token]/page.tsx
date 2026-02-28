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
            title: 'Form Not Found | Formless',
            description: 'The requested form could not be found or is inactive.',
        };
    }

    return {
        title: `${form.title} | Formless Chat`,
        description: form.description || 'Complete this form via an intelligent AI conversation.',
        openGraph: {
            title: `${form.title} | Formless`,
            description: form.description,
            type: 'website',
        },
    };
}

export default async function PublicChatPage({ params }: PageProps) {
    const { token } = await params;

    return (
        <ChatClient token={token} />
    );
}
