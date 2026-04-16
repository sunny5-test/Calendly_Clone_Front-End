'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser, logout } from '@/utils/auth';

const ADMIN_EMAIL = 'konda20006@gmail.com';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Event Types',
    href: '/event-types',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Availability',
    href: '/availability',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
  },
  {
    label: 'Meetings',
    href: '/meetings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const adminNavItem = {
  label: 'Admin Panel',
  href: '/admin',
  icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Hide sidebar on public booking pages and login page
  const isPublicPage = pathname.startsWith('/event/');
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/';

  useEffect(() => {
    setMounted(true);
    const currentUser = getUser();
    setUser(currentUser);
  }, [pathname]);
  
  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (isPublicPage || isLoginPage || isLandingPage) return null;

  const handleLogout = () => {
    logout();
  };

  // Derive display info from user token
  const userEmail = user?.email || 'User';
  const userAvatar = user?.avatar || null;
  const userInitial = (user?.name || userEmail).charAt(0).toUpperCase();
  const userName = user?.name || userEmail.split('@')[0] || 'User';

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[var(--border)]">
        <Link href="/dashboard" className="flex items-center gap-2.5 no-underline" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[var(--text-primary)]">Calendly</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="list-none p-0 m-0 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200
                    ${isActive
                      ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  <span className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}

          {/* Admin Panel — only for admin user */}
          {mounted && user?.email === ADMIN_EMAIL && (
            <>
              <li className="my-1 mx-4 border-t border-[var(--border)]" />
              <li>
                <Link
                  href={adminNavItem.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200
                    ${pathname === '/admin'
                      ? 'bg-[#F0FDFA] text-[#0F766E]'
                      : 'text-[#0F766E] hover:bg-[#F0FDFA]'
                    }
                  `}
                >
                  <span className="text-[#0D9488]">
                    {adminNavItem.icon}
                  </span>
                  {adminNavItem.label}
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[#0F172A] text-white font-bold">
                    ADM
                  </span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Footer — User info + Logout */}
      <div className="px-4 py-4 border-t border-[var(--border)]">
        <Link href="/profile" className="flex items-center gap-3 mb-3 px-2 no-underline hover:opacity-80 transition-opacity" onClick={() => setMobileOpen(false)}>
          {mounted && userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {mounted ? userInitial : 'U'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] m-0 truncate">
              {mounted ? userName : 'Loading...'}
            </p>
            <p className="text-xs text-[var(--text-muted)] m-0 truncate">
              {mounted ? userEmail : ''}
            </p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          id="sidebar-logout-btn"
          className="w-full flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer bg-transparent border-none text-left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile: Hamburger Button (top bar) ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center px-4 py-3"
        style={{
          background: 'rgba(255, 255, 255, 0.23)',
          backdropFilter: 'blur(2.9px)',
          WebkitBackdropFilter: 'blur(2.9px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.55)',
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          className="btn btn-ghost p-2 rounded-lg"
          id="mobile-menu-toggle"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 no-underline ml-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="text-base font-bold text-[var(--text-primary)]">Calendly</span>
        </Link>
      </div>

      {/* ── Mobile: Slide-in Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="absolute top-0 left-0 bottom-0 w-[280px] flex flex-col shadow-lg"
            style={{
              animation: 'slideInLeft 0.25s ease-out forwards',
              background: 'rgba(255, 255, 255, 0.23)',
              backdropFilter: 'blur(2.9px)',
              WebkitBackdropFilter: 'blur(2.9px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.55)',
            }}
          >
            {/* Close button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="btn btn-ghost p-1.5 rounded-lg"
                id="mobile-menu-close"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ── Desktop: Fixed Sidebar ── */}
      <aside
        className="hidden md:flex w-[260px] border-r flex-col min-h-screen shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.23)',
          backdropFilter: 'blur(2.9px)',
          WebkitBackdropFilter: 'blur(2.9px)',
          borderColor: 'rgba(255, 255, 255, 0.55)',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
