'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout } from '@/utils/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function DashboardContent() {
  const router = useRouter();
  const [user, setUserState] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load user info from token (token capture is handled by ProtectedRoute)
    const currentUser = getUser();
    setUserState(currentUser);
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (!mounted) return null;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="card mb-8 animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(0, 107, 255, 0.85) 0%, rgba(0, 82, 204, 0.85) 100%)',
        backdropFilter: 'blur(2.9px)',
        WebkitBackdropFilter: 'blur(2.9px)',
        border: '1px solid rgba(255, 255, 255, 0.55)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/30 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold shadow-md backdrop-blur-sm">
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white m-0">
                Welcome back, {user?.name || 'there'}! 👋
              </h1>
              <p className="text-white/80 text-sm mt-1 m-0">
                {user?.email || 'Signed in user'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            id="logout-btn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/15 text-white border border-white/25 hover:bg-white/25 transition-all duration-200 cursor-pointer backdrop-blur-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Event Types',
            description: 'Create and manage your meeting types',
            href: '/event-types',
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            ),
            color: 'var(--primary-light)',
          },
          {
            title: 'Availability',
            description: 'Set your weekly schedule',
            href: '/availability',
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            ),
            color: '#DCFCE7',
          },
          {
            title: 'Meetings',
            description: 'View upcoming and past meetings',
            href: '/meetings',
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            ),
            color: '#F3E8FF',
          },
        ].map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={`card glass flex flex-col gap-3 no-underline hover:-translate-y-1 transition-all duration-300 animate-fade-in stagger-${i + 1}`}
            style={{ animationFillMode: 'backwards' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: item.color }}
            >
              {item.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] m-0">{item.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 m-0">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Admin Quick Access — only for admin */}
      {user?.email === 'konda20006@gmail.com' && (
        <div className="mt-6">
          <Link
            href="/admin"
            className="card flex items-center gap-4 no-underline hover:-translate-y-1 transition-all duration-300 animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.85) 60%, rgba(51, 65, 85, 0.85) 100%)',
              backdropFilter: 'blur(2.9px)',
              WebkitBackdropFilter: 'blur(2.9px)',
              border: '1px solid rgba(255, 255, 255, 0.55)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              animationFillMode: 'backwards',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #38BDF8, #06B6D4)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold m-0" style={{ color: 'whitesmoke' }}>Admin Console</h3>
              <p className="text-xs text-slate-400 mt-1 m-0">Manage all users, meetings, and platform data</p>
            </div>
            <svg className="ml-auto" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
