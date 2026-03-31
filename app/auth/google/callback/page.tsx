'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');

    if (error || !accessToken || !refreshToken) {
      router.replace('/auth/login?error=google-auth-failed');
      return;
    }

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    router.replace('/dashboard');
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="card max-w-md text-center">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">Completing sign-in</h1>
        <p className="text-gray-600">We are finishing your Google authentication and redirecting you now.</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
          <div className="card max-w-md text-center">
            <h1 className="mb-3 text-2xl font-bold text-gray-900">Preparing sign-in</h1>
            <p className="text-gray-600">Please wait while we complete your Google authentication.</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}