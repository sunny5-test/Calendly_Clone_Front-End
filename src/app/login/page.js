'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/utils/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://calendly-clone-backend-homc.onrender.com/api';

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Get returnTo URL from query params (e.g., /login?returnTo=/event/some-slug)
  const returnTo = searchParams.get('returnTo');

  useEffect(() => {
    setMounted(true);
    // If already logged in, redirect to returnTo or dashboard
    if (isAuthenticated()) {
      router.replace(returnTo || '/dashboard');
    }
  }, [router, returnTo]);

  const handleGoogleLogin = () => {
    // Save returnTo so we can redirect after OAuth callback
    if (returnTo) {
      sessionStorage.setItem('returnTo', returnTo);
    }
    window.location.href = `${API_BASE}/auth/google`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f6ff 0%, #e8f0fe 30%, #f9fafb 70%, #fff 100%)' }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #00C853 0%, transparent 70%)' }}
        />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in">
        <div
          className="bg-white rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(0, 107, 255, 0.08), 0 4px 20px rgba(0, 0, 0, 0.04)' }}
        >
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-md"
                style={{ boxShadow: '0 4px 14px rgba(0, 107, 255, 0.35)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Welcome to Calendly
            </h1>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Sign in to manage your events, availability, and bookings
            </p>
          </div>

          {/* Divider */}
          <div className="px-8">
            <div className="border-t border-[var(--border)]" />
          </div>

          {/* Login Actions */}
          <div className="px-8 py-8">
            <button
              onClick={handleGoogleLogin}
              id="google-login-btn"
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border border-[var(--border)] bg-white text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] hover:shadow-md active:scale-[0.98] cursor-pointer"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              {/* Google Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-xs text-[var(--text-muted)] mt-6 leading-relaxed">
              By signing in, you agree to our{' '}
              <Link href="#" className="text-[var(--primary)] hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="text-[var(--primary)] hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Secure authentication powered by Google OAuth 2.0
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
