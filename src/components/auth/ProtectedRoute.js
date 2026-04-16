'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAuthenticated, setToken } from '@/utils/auth';

/**
 * Loading spinner shown while auth state is being resolved.
 */
function AuthSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 border-3 border-[var(--border)] rounded-full"
          style={{
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p className="text-sm text-[var(--text-muted)]">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Inner component that uses useSearchParams (requires Suspense boundary).
 * Captures any OAuth token from the URL, then checks authentication.
 * Supports returnTo redirect after OAuth login.
 */
function ProtectedRouteInner({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // 1. Capture token from URL (Google OAuth redirect lands here)
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // Clean the URL so the token isn't visible in the address bar
      window.history.replaceState({}, document.title, window.location.pathname);

      // Check if there's a returnTo URL saved before the OAuth redirect
      const returnTo = sessionStorage.getItem('returnTo');
      if (returnTo) {
        sessionStorage.removeItem('returnTo');
        router.replace(returnTo);
        return;
      }
    }

    // 2. Now check if user is authenticated (token in localStorage)
    if (isAuthenticated()) {
      setAuthed(true);
    } else {
      router.replace('/login');
    }
    setChecking(false);
  }, [router, searchParams]);

  if (checking || !authed) {
    return <AuthSpinner />;
  }

  return children;
}

/**
 * ProtectedRoute wrapper component.
 * Wraps ProtectedRouteInner in a Suspense boundary (required by Next.js
 * for components using useSearchParams during static generation).
 */
export default function ProtectedRoute({ children }) {
  return (
    <Suspense fallback={<AuthSpinner />}>
      <ProtectedRouteInner>{children}</ProtectedRouteInner>
    </Suspense>
  );
}
