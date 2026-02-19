'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleGoogleCallback } from '@/lib/api/oAuthForm';
import { Loader2 } from 'lucide-react';
import { Background } from '@/components/Background';

const STORAGE_KEY = 'google_access_token';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      setError('No authorization code found in the URL.');
      return;
    }

    (async () => {
      try {
        const result = await handleGoogleCallback(code);

        if (!result.success) {
          setError(result.message || 'Authentication failed.');
          return;
        }

        // Persist the access token so the dashboard can use it
        localStorage.setItem(STORAGE_KEY, result.accessToken);

        // Redirect to dashboard
        router.replace('/dashboard');
      } catch (err: any) {
        console.error('Google callback error:', err);
        setError(err?.message || 'An error occurred during authentication.');
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center relative">
      <Background />
      <div className="text-center relative z-10">
        {error ? (
          <>
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => router.replace('/dashboard')}
              className="text-[#6E8BFF] underline text-sm"
            >
              Go back to Dashboard
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-[#6E8BFF] mx-auto mb-4" />
            <p className="text-gray-400">Connecting your Google account…</p>
          </>
        )}
      </div>
    </div>
  );
}
