'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { getGoogleCalendarUrl, getOutlookCalendarUrl, downloadICSFile } from '@/utils/calendarUtils';

function ConfirmationContent() {
  const searchParams = useSearchParams();

  const name = searchParams.get('name');
  const email = searchParams.get('email');
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const eventName = searchParams.get('eventName');
  const duration = searchParams.get('duration');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] p-3 sm:p-4">
      <div className="card max-w-lg w-full text-center py-8 sm:py-12 px-5 sm:px-8 animate-scale-in">
        {/* Success checkmark */}
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2">
          You are scheduled
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8">
          A calendar invitation has been sent to your email address.
        </p>

        {/* Booking Details Card */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 sm:p-6 text-left mb-6 sm:mb-8">
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--border)]">
            {eventName}
          </h3>

          <div className="flex flex-col gap-3">
            {/* Invitee */}
            <div className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" className="mt-0.5 shrink-0" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] m-0">{name}</p>
                <p className="text-xs text-[var(--text-muted)] m-0">{email}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" className="shrink-0" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-sm text-[var(--text-primary)] m-0">
                {startTime && formatDate(startTime)}
              </p>
            </div>

            {/* Time Range */}
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" className="shrink-0" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              <p className="text-sm text-[var(--text-primary)] m-0">
                {startTime && formatTime(startTime)} - {endTime && formatTime(endTime)} ({duration} min)
              </p>
            </div>

            {/* Timezone */}
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" className="shrink-0" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <p className="text-sm text-[var(--text-primary)] m-0">
                India Standard Time
              </p>
            </div>
          </div>
        </div>

        {/* Add to Calendar */}
        {startTime && endTime && (
          <div className="mb-6">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Add to your calendar</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href={getGoogleCalendarUrl({
                  title: `${eventName} — ${name}`,
                  startTime,
                  endTime,
                  description: `Meeting: ${eventName}\nWith: ${name} (${email})\nDuration: ${duration} min`,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-secondary"
                id="add-google-calendar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                Google Calendar
              </a>
              <a
                href={getOutlookCalendarUrl({
                  title: `${eventName} — ${name}`,
                  startTime,
                  endTime,
                  description: `Meeting: ${eventName}\nWith: ${name} (${email})\nDuration: ${duration} min`,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-secondary"
                id="add-outlook-calendar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                Outlook
              </a>
              <button
                onClick={() => downloadICSFile({
                  title: `${eventName} — ${name}`,
                  startTime,
                  endTime,
                  description: `Meeting: ${eventName}\nWith: ${name} (${email})\nDuration: ${duration} min`,
                })}
                className="btn btn-sm btn-secondary"
                id="download-ics"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download .ics
              </button>
            </div>
          </div>
        )}

        {/* Action */}
        <Link href="/dashboard" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

/**
 * Booking confirmation page — displays after successful booking.
 */
export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] p-4">
          <div className="skeleton w-full max-w-sm h-80 sm:h-96 rounded-2xl" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
