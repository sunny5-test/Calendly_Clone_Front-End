'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import Toast from '@/components/layout/Toast';
import { bookingAPI } from '@/services/api';
import { formatDate, formatTime, formatTimeRange, getRelativeDateLabel } from '@/utils/dateUtils';
import { getGoogleCalendarUrl, getOutlookCalendarUrl, downloadICSFile } from '@/utils/calendarUtils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function MeetingsPageContent() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [tabTransitionKey, setTabTransitionKey] = useState(0);

  // Sliding glass indicator
  const tabContainerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const tabs = ['upcoming', 'past'];

  // Measure active tab position for the sliding indicator
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

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setTabTransitionKey((k) => k + 1);
    setActiveTab(tab);
  };

  const fetchBookings = async (type) => {
    try {
      setLoading(true);
      const res = await bookingAPI.getAll(type);
      setBookings(res.data.data);
    } catch (err) {
      setToast({ message: 'Failed to load bookings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab]);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      setToast({ message: 'Booking cancelled successfully', type: 'success' });
      fetchBookings(activeTab);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel booking';
      setToast({ message: msg, type: 'error' });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <Header
        title="Meetings"
        subtitle="View and manage your scheduled meetings"
      />

      {/* Tabs with sliding glass indicator */}
      <div
        ref={tabContainerRef}
        className="relative flex gap-1 rounded-xl p-1 mb-6 max-w-xs glass"
      >
        {/* Sliding glass pill indicator */}
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
            key={tab}
            ref={(el) => (tabRefs.current[tab] = el)}
            onClick={() => handleTabChange(tab)}
            className={`
              flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 relative z-10 cursor-pointer
              ${activeTab === tab
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
            style={{ background: 'transparent', border: 'none' }}
            id={`tab-${tab}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-4">
                  <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="skeleton h-5 w-3/4 mb-2" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="card glass text-center py-12 sm:py-16">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">
              No {activeTab} meetings
            </h3>
            <p className="text-[var(--text-secondary)] text-sm">
              {activeTab === 'upcoming'
                ? 'You have no upcoming meetings scheduled.'
                : 'No past meetings to show.'}
            </p>
          </div>
        )}

        {/* Bookings List */}
        {!loading && bookings.length > 0 && (
          <div className="flex flex-col gap-4">
            {bookings.map((booking, i) => (
              <div
                key={booking.id}
                className="card glass animate-fade-in hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left side */}
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    {/* Color accent */}
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold"
                      style={{ backgroundColor: booking.eventType?.color || '#006BFF' }}
                    >
                      {booking.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] m-0 truncate">
                          {booking.name}
                        </h3>
                        {/* Role badge */}
                        {booking.role === 'host' ? (
                          <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                            Host
                          </span>
                        ) : booking.role === 'co-host' ? (
                          <span className="badge" style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            background: '#FFFBEB',
                            color: '#D97706',
                          }}>
                            Co-Host
                          </span>
                        ) : (
                          <span className="badge" style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            background: '#F3E8FF',
                            color: '#7C3AED',
                          }}>
                            Invitee
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] m-0 mb-2 truncate">
                        {booking.email}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[var(--text-muted)]">
                        {/* Event type */}
                        <span className="badge badge-blue">
                          {booking.eventType?.name}
                        </span>

                        {/* Date */}
                        <div className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {getRelativeDateLabel(booking.startTime)}
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12,6 12,12 16,14" />
                          </svg>
                          {formatTimeRange(booking.startTime, booking.endTime)}
                        </div>

                        {/* Status badge */}
                        {booking.status === 'cancelled' && (
                          <span className="badge badge-red">Cancelled</span>
                        )}

                        {/* Location */}
                        {booking.eventType?.locationType && booking.eventType.locationType !== 'none' && (
                          <span className="flex items-center gap-1">
                            {booking.eventType.locationType === 'google-meet' ? '🎥' :
                             booking.eventType.locationType === 'teams' ? '💬' :
                             booking.eventType.locationType === 'zoom' ? '📹' : '📍'}
                            {booking.eventType.locationValue && booking.eventType.locationType !== 'custom' ? (
                              <a href={booking.eventType.locationValue} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline no-underline">
                                Join
                              </a>
                            ) : (
                              <span className="truncate max-w-[120px]">{booking.eventType.locationValue || (booking.eventType.locationType === 'custom' ? 'In-Person' : '')}</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {booking.status === 'scheduled' && (
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      {/* Add to Calendar dropdown */}
                      <CalendarDropdown booking={booking} />

                      {/* Cancel button (only for upcoming) */}
                      {activeTab === 'upcoming' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="btn btn-danger btn-sm"
                          id={`cancel-booking-${booking.id}`}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
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

/**
 * Calendar dropdown for adding a booking to external calendars.
 */
function CalendarDropdown({ booking }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const calendarData = {
    title: `${booking.eventType?.name || 'Meeting'} — ${booking.name}`,
    startTime: booking.startTime,
    endTime: booking.endTime,
    description: `Meeting: ${booking.eventType?.name || 'Meeting'}\nWith: ${booking.name} (${booking.email})\nDuration: ${booking.eventType?.duration || 30} min`,
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-secondary btn-sm"
        id={`cal-btn-${booking.id}`}
        title="Add to Calendar"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="hidden sm:inline">Calendar</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 rounded-lg py-1 z-50 min-w-[180px] animate-fade-in"
          style={{
            background: 'rgba(255, 255, 255, 0.23)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.55)',
          }}
        >
          <a
            href={getGoogleCalendarUrl(calendarData)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors no-underline"
            onClick={() => setOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Google Calendar
          </a>
          <a
            href={getOutlookCalendarUrl(calendarData)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors no-underline"
            onClick={() => setOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0078D4" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Outlook Calendar
          </a>
          <button
            onClick={() => { downloadICSFile(calendarData); setOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors w-full text-left bg-transparent border-none cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download .ics
          </button>
        </div>
      )}
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <ProtectedRoute>
      <MeetingsPageContent />
    </ProtectedRoute>
  );
}
