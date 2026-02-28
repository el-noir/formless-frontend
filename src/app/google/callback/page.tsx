'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleGoogleCallback } from '@/lib/api/oAuthForm';
import { Loader2 } from 'lucide-react';
import { Background } from '@/components/Background';

const STORAGE_KEY = 'google_access_token';

export default function GoogleCallbackPage() {
  const router = useRouter();
  
  // Check for code immediately — if missing, start with error
  const code = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('code')
    : null;

  const [error, setError] = useState<string | null>(
    code ? null : 'No authorization code found in the URL.'
  );

  useEffect(() => {
    if (!code) return;

    let mounted = true;

    (async () => {
      try {
        const result = await handleGoogleCallback(code);

        if (!mounted) return;

        if (!result.success) {
          setError(result.message || 'Authentication failed.');
          return;
        }

        // Persist the access token so the dashboard can use it
        localStorage.setItem(STORAGE_KEY, result.accessToken);

        // Redirect to dashboard
        router.replace('/dashboard');
      } catch (err: unknown) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'An error occurred during authentication.';
        setError(message);
      }
    })();
    return () => { mounted = false; };
  }, [router, code]);

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center relative">
      <Background />
      <div className="text-center relative z-10">
        {error ? (
          <>
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => router.replace('/dashboard')}
              className="text-[#9A6BFF] underline text-sm"
            >
              Go back to Dashboard
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-[#9A6BFF] mx-auto mb-4" />
            <p className="text-gray-400">Connecting your Google account…</p>
          </>
        )}
      </div>
    </div>
  );
}
