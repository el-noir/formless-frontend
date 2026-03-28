import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const size = {
    width: 1200,
    height: 630,
};

async function getFormInfo(token: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    try {
        const res = await fetch(`${apiUrl}/public/chat/${token}`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.data;
    } catch (e) {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    let formInfo = null;
    if (token) {
        formInfo = await getFormInfo(token);
    }

    if (!formInfo) {
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0B0B0F',
                        color: 'white',
                    }}
                >
                    <h1 style={{ fontSize: 60, fontWeight: 'bold' }}>ZeroFill</h1>
                    <p style={{ fontSize: 32, color: '#a1a1aa' }}>Intelligent AI Forms</p>
                </div>
            ),
            { ...size }
        );
    }

    const aiName = formInfo.aiName || '0Fill Assistant';
    const title = formInfo.title || 'Untitled Form';

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ZeroFill-frontend.vercel.app';
    const logoSrc = `${appUrl}/logo.png`;

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    backgroundColor: '#0B0B0F',
                    border: '8px solid #1C1C22',
                    padding: '80px',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Brand Header */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 16,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 24,
                            backgroundColor: 'transparent'
                        }}
                    >
                        <img src={logoSrc} width={60} height={60} style={{ objectFit: 'contain' }} alt="0Fill" />
                    </div>
                    <span style={{ color: '#0da372', fontSize: 40, fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                        ZeroFill
                    </span>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1
                        style={{
                            fontSize: 72,
                            fontWeight: 800,
                            color: 'white',
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em',
                            marginBottom: 24,
                            maxWidth: '900px',
                        }}
                    >
                        {title.length > 60 ? `${title.slice(0, 60)}...` : title}
                    </h1>
                    <p
                        style={{
                            fontSize: 36,
                            color: '#a1a1aa',
                            margin: 0,
                            maxWidth: '900px',
                            lineHeight: 1.4,
                        }}
                    >
                        Chat with <strong style={{ color: '#0da372', marginLeft: 8, marginRight: 8, fontWeight: 'bold' }}>{aiName}</strong> to complete this form.
                    </p>
                </div>

                {/* Footer details */}
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1C1C22', padding: '16px 32px', borderRadius: 100 }}>
                        <span style={{ fontSize: 24, color: '#a1a1aa', marginRight: 16 }}>Est. Time:</span>
                        <span style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>~{formInfo.estimatedMinutes} mins</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1C1C22', padding: '16px 32px', borderRadius: 100, marginLeft: 24 }}>
                        <span style={{ fontSize: 24, color: '#a1a1aa', marginRight: 16 }}>Questions:</span>
                        <span style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>{formInfo.questionCount}</span>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
