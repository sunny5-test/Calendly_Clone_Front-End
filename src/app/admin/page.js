'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/layout/Toast';
import { adminAPI } from '@/services/api';
import { getUser } from '@/utils/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ADMIN_EMAIL = 'konda20006@gmail.com';

/* ───────────────────────── helpers ───────────────────────── */
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
function fmtTimeRange(start, end) {
  const s = new Date(start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const e = new Date(end).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return `${s} – ${e}`;
}

/* ──────────────────────── MAIN PAGE ─────────────────────── */
function AdminDashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);
  const [tabTransitionKey, setTabTransitionKey] = useState(0);

  // Sliding glass indicator
  const tabContainerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // data
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState('upcoming');

  // search
  const [userSearch, setUserSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');

  // Measure active tab position for sliding indicator
  useEffect(() => {
    const activeEl = tabRefs.current[activeTab];
    const container = tabContainerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  const handleTabChange = (key) => {
    if (key === activeTab) return;
    setTabTransitionKey((k) => k + 1);
    setActiveTab(key);
  };

  useEffect(() => {
    const u = getUser();
    if (!u || u.email !== ADMIN_EMAIL) {
      router.replace('/dashboard');
      return;
    }
    setUser(u);
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getStats();
      setStats(res.data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers();
      setUsers(res.data.data);
    } catch {
      setToast({ message: 'Failed to load users', type: 'error' });
    } finally { setLoading(false); }
  };

  const loadBookings = async (type) => {
    try {
      setLoading(true);
      const res = await adminAPI.getBookings(type);
      setBookings(res.data.data);
    } catch {
      setToast({ message: 'Failed to load bookings', type: 'error' });
    } finally { setLoading(false); }
  };

  const loadEventTypes = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getEventTypes();
      setEventTypes(res.data.data);
    } catch {
      setToast({ message: 'Failed to load event types', type: 'error' });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'overview') loadStats();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'meetings') loadBookings(bookingFilter);
    else if (activeTab === 'event-types') loadEventTypes();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'meetings') loadBookings(bookingFilter);
  }, [bookingFilter]);

  const handleCancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await adminAPI.cancelBooking(id);
      setToast({ message: 'Booking cancelled', type: 'success' });
      loadBookings(bookingFilter);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to cancel', type: 'error' });
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This will remove all their event types, bookings, and data. This action cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      setToast({ message: `User "${name}" deleted`, type: 'success' });
      loadUsers();
      adminAPI.getStats().then(r => setStats(r.data.data)).catch(() => {});
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete user', type: 'error' });
    }
  };

  if (!user || user.email !== ADMIN_EMAIL) return null;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'meetings', label: 'Meetings', icon: '📅' },
    { key: 'event-types', label: 'Event Types', icon: '⭐' },
  ];

  // Filtered data
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredBookings = bookings.filter(b =>
    b.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.email?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.eventType?.name?.toLowerCase().includes(bookingSearch.toLowerCase())
  );
  const filteredEventTypes = eventTypes.filter(et =>
    et.name?.toLowerCase().includes(eventSearch.toLowerCase()) ||
    et.user?.name?.toLowerCase().includes(eventSearch.toLowerCase()) ||
    et.user?.email?.toLowerCase().includes(eventSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* ─── Admin Header ─── */}
      <div
        className="card mb-8 animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.85) 60%, rgba(51, 65, 85, 0.85) 100%)',
          backdropFilter: 'blur(2.9px)',
          WebkitBackdropFilter: 'blur(2.9px)',
          border: '1px solid rgba(255, 255, 255, 0.55)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #38BDF8, #06B6D4)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold m-0" style={{ color: 'whitesmoke' }}>
                Admin Console
              </h1>
              <p className="text-slate-400 text-sm mt-1 m-0">
                Platform management & analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#7DD3FC',
                borderColor: 'rgba(56, 189, 248, 0.3)',
              }}
            >
              ✦ Super Admin
            </span>
          </div>
        </div>
      </div>

      {/* ─── Tabs with sliding glass indicator ─── */}
      <div
        ref={tabContainerRef}
        className="relative flex gap-1 rounded-xl p-1 mb-6 overflow-x-auto glass"
      >
        {/* Sliding glass pill */}
        <div
          className="absolute top-1 bottom-1 rounded-lg transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] z-0"
          style={{
            left: indicator.left,
            width: indicator.width,
            background: 'rgba(255, 255, 255, 0.75)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.key}
            ref={(el) => (tabRefs.current[tab.key] = el)}
            onClick={() => handleTabChange(tab.key)}
            className={`
              flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap relative z-10 cursor-pointer
              ${activeTab === tab.key
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
            style={{ background: 'transparent', border: 'none' }}
            id={`admin-tab-${tab.key}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content area with smooth glass transition */}
      <div
        key={tabTransitionKey}
        style={{
          animation: 'glassTabFade 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        }}
      >
      {/* ════════════════════ OVERVIEW TAB ════════════════════ */}
      {activeTab === 'overview' && (
        <div>
          {loading || !stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card"><div className="skeleton h-24 w-full" /></div>
              ))}
            </div>
          ) : (
            <>
              {/* Stat Cards — clean light style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    label: 'Total Users',
                    value: stats.totalUsers,
                    sub: `+${stats.recentUsers} this week`,
                    bg: '#EFF6FF', accent: '#2563EB', iconBg: '#DBEAFE',
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Total Bookings',
                    value: stats.totalBookings,
                    sub: `+${stats.recentBookings} this week`,
                    bg: '#ECFDF5', accent: '#059669', iconBg: '#D1FAE5',
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Event Types',
                    value: stats.totalEventTypes,
                    sub: 'Across all users',
                    bg: '#FFF7ED', accent: '#D97706', iconBg: '#FEF3C7',
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Upcoming',
                    value: stats.upcomingBookings,
                    sub: `${stats.cancelledBookings} cancelled`,
                    bg: '#F0FDFA', accent: '#0D9488', iconBg: '#CCFBF1',
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
                      </svg>
                    ),
                  },
                ].map((card, i) => (
                  <div
                    key={card.label}
                    className="rounded-2xl p-5 animate-fade-in glass"
                    style={{
                      animationDelay: `${i * 80}ms`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: card.iconBg }}
                      >
                        {card.icon}
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1" style={{ color: '#0F172A' }}>{card.value}</div>
                    <div className="text-sm font-medium" style={{ color: '#475569' }}>{card.label}</div>
                    <div className="text-xs mt-1" style={{ color: card.accent }}>{card.sub}</div>
                  </div>
                ))}
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Booking Breakdown */}
                <div className="card glass">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <span style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: '#EFF6FF', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 14
                    }}>📈</span>
                    Booking Breakdown
                  </h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'Upcoming', value: stats.upcomingBookings, color: '#059669', bg: '#D1FAE5' },
                      { label: 'Completed', value: stats.pastBookings, color: '#2563EB', bg: '#DBEAFE' },
                      { label: 'Cancelled', value: stats.cancelledBookings, color: '#DC2626', bg: '#FEE2E2' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                        </div>
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: item.bg, color: item.color }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Segmented bar */}
                  <div className="mt-4 h-2.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex">
                    {stats.totalBookings > 0 && (
                      <>
                        <div style={{ width: `${(stats.upcomingBookings / stats.totalBookings) * 100}%`, backgroundColor: '#059669', transition: 'width 0.6s ease' }} className="h-full" />
                        <div style={{ width: `${(stats.pastBookings / stats.totalBookings) * 100}%`, backgroundColor: '#2563EB', transition: 'width 0.6s ease' }} className="h-full" />
                        <div style={{ width: `${(stats.cancelledBookings / stats.totalBookings) * 100}%`, backgroundColor: '#DC2626', transition: 'width 0.6s ease' }} className="h-full" />
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card glass">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <span style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: '#FEF3C7', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 14
                    }}>⚡</span>
                    Quick Actions
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Manage Users', tab: 'users', icon: '👥', bg: '#EFF6FF' },
                      { label: 'View All Meetings', tab: 'meetings', icon: '📅', bg: '#ECFDF5' },
                      { label: 'Browse Event Types', tab: 'event-types', icon: '⭐', bg: '#FFF7ED' },
                    ].map(action => (
                      <button
                        key={action.tab}
                        onClick={() => handleTabChange(action.tab)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-primary)] hover:shadow-sm transition-all duration-200 w-full text-left border cursor-pointer"
                        style={{ background: action.bg, borderColor: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = ''; }}
                      >
                        <span className="text-lg">{action.icon}</span>
                        {action.label}
                        <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════ USERS TAB ════════════════════ */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] m-0">All Users</h2>
              <p className="text-xs text-[var(--text-muted)] m-0 mt-0.5">{users.length} registered users</p>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="input"
              style={{ maxWidth: 280 }}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              id="admin-user-search"
            />
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card"><div className="skeleton h-16 w-full" /></div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-[var(--text-secondary)]">No users found.</p>
            </div>
          ) : (
            <div className="card glass overflow-x-auto" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    {['User', 'Email', 'Events', 'Bookings', 'Joined', 'Actions'].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '14px 16px',
                          textAlign: 'left',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-[var(--border)]" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: '#0F172A' }}>
                              {(u.name || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-[var(--text-primary)]">{u.name}</div>
                            {u.email === ADMIN_EMAIL && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>ADMIN</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="text-sm text-[var(--text-secondary)]">{u.email}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge badge-blue">{u._count?.eventTypes || 0}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge badge-green">{u._count?.inviteeBookings || 0}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="text-xs text-[var(--text-muted)]">{fmtDate(u.createdAt)}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {u.email !== ADMIN_EMAIL && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="btn btn-danger btn-sm"
                            id={`delete-user-${u.id}`}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════ MEETINGS TAB ════════════════════ */}
      {activeTab === 'meetings' && (
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex gap-1 rounded-xl p-1 glass">
              {['upcoming', 'past', 'cancelled'].map(f => (
                <button
                  key={f}
                  onClick={() => setBookingFilter(f)}
                  className={`
                    py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
                    ${bookingFilter === f
                      ? 'bg-white text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                  id={`admin-booking-filter-${f}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search bookings..."
              className="input"
              style={{ maxWidth: 280 }}
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              id="admin-booking-search"
            />
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="card"><div className="skeleton h-16 w-full" /></div>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </div>
              <p className="text-sm text-[var(--text-secondary)] m-0">No {bookingFilter} bookings found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredBookings.map((booking, i) => (
                <div
                  key={booking.id}
                  className="card glass animate-fade-in hover:-translate-y-0.5 transition-all duration-300"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold"
                        style={{ backgroundColor: booking.eventType?.color || '#006BFF' }}
                      >
                        {booking.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">
                            {booking.name}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {booking.eventType?.user?.name || 'Unknown Host'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span className="badge badge-blue">{booking.eventType?.name}</span>
                          <span>{fmtDate(booking.startTime)}</span>
                          <span>{fmtTimeRange(booking.startTime, booking.endTime)}</span>
                          {booking.status === 'cancelled' && (
                            <span className="badge badge-red">Cancelled</span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">
                          <span style={{ color: 'var(--text-secondary)' }}>Invitee:</span> {booking.email} &nbsp;·&nbsp;
                          <span style={{ color: 'var(--text-secondary)' }}>Host:</span> {booking.eventType?.user?.email || '—'}
                        </div>
                      </div>
                    </div>
                    {booking.status === 'scheduled' && bookingFilter !== 'past' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="btn btn-danger btn-sm shrink-0"
                        id={`admin-cancel-booking-${booking.id}`}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════ EVENT TYPES TAB ════════════════════ */}
      {activeTab === 'event-types' && (
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] m-0">All Event Types</h2>
              <p className="text-xs text-[var(--text-muted)] m-0 mt-0.5">{eventTypes.length} event types across all users</p>
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="input"
              style={{ maxWidth: 280 }}
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              id="admin-event-search"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card"><div className="skeleton h-24 w-full" /></div>
              ))}
            </div>
          ) : filteredEventTypes.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-[var(--text-secondary)]">No event types found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEventTypes.map((et, i) => (
                <div
                  key={et.id}
                  className="card glass animate-fade-in hover:-translate-y-0.5 transition-all duration-300"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
                >
                  {/* Color top bar */}
                  <div
                    className="h-1.5 rounded-full mb-4"
                    style={{ backgroundColor: et.color || '#006BFF' }}
                  />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] m-0 mb-2">
                    {et.name}
                  </h3>
                  {/* Owner */}
                  <div className="flex items-center gap-2 mb-3">
                    {et.user?.avatar ? (
                      <img src={et.user.avatar} alt={et.user.name} className="w-5 h-5 rounded-full object-cover border border-[var(--border)]" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: '#0F172A' }}>
                        {(et.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs text-[var(--text-muted)]">{et.user?.name || 'Unknown'}</span>
                    <span className="text-xs text-[var(--text-muted)]">·</span>
                    <span className="text-xs text-[var(--text-muted)]">{et.user?.email}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="badge badge-blue">{et.duration} min</span>
                    <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{et.kind}</span>
                    <span className="badge badge-green">{et._count?.bookings || 0} bookings</span>
                    {et.locationType && et.locationType !== 'none' && (
                      <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', textTransform: 'capitalize' }}>
                        {et.locationType === 'google-meet' ? '🎥 Meet' :
                         et.locationType === 'teams' ? '💬 Teams' :
                         et.locationType === 'zoom' ? '📹 Zoom' : '📍 Custom'}
                      </span>
                    )}
                  </div>

                  {et.coHosts?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                      <span className="text-xs text-[var(--text-muted)]">
                        Co-hosts: {et.coHosts.map(ch => ch.user?.name || ch.user?.email).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
