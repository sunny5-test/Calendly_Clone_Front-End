'use client';

import { useState } from 'react';

const KIND_LABELS = {
  'one-on-one': { label: 'One-on-one', color: '#006BFF', bg: '#EFF6FF' },
  'group': { label: 'Group', color: '#059669', bg: '#ECFDF5' },
  'round-robin': { label: 'Round Robin', color: '#D97706', bg: '#FFFBEB' },
  'collective': { label: 'Collective', color: '#7C3AED', bg: '#F5F3FF' },
};

/**
 * Event type card for the dashboard grid.
 * Shows event name, kind, duration, slug, and provides edit/delete/copy-link actions.
 */
export default function EventTypeCard({ eventType, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/event/${eventType.slug}`;
  const kindInfo = KIND_LABELS[eventType.kind] || KIND_LABELS['one-on-one'];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="card glass animate-fade-in group relative">
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: eventType.color || '#006BFF' }}
      />

      <div className="pt-2">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[var(--text-primary)] m-0 truncate">
              {eventType.name}
            </h3>
            <p className="text-sm text-[var(--text-muted)] mt-1 m-0">
              /{eventType.slug}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${eventType.color}15` }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={eventType.color || '#006BFF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* Event kind badge */}
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: kindInfo.bg, color: kindInfo.color }}
          >
            {kindInfo.label}
          </span>

          {/* Duration */}
          <span className="badge badge-blue">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            {eventType.duration} min
          </span>

          {/* Group: max invitees */}
          {eventType.kind === 'group' && (
            <span className="badge" style={{ background: '#ECFDF5', color: '#059669' }}>
              Max {eventType.maxInvitees}
            </span>
          )}

          {/* Co-hosts count */}
          {(eventType.kind === 'round-robin' || eventType.kind === 'collective') && eventType.coHosts?.length > 0 && (
            <span className="badge" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
              {eventType.coHosts.length + 1} hosts
            </span>
          )}

          {/* Location badge */}
          {eventType.locationType && eventType.locationType !== 'none' && (
            <span className="badge" style={{ background: '#F0F9FF', color: '#0369A1' }}>
              {eventType.locationType === 'google-meet' ? '🎥 Meet' :
               eventType.locationType === 'teams' ? '💬 Teams' :
               eventType.locationType === 'zoom' ? '📹 Zoom' :
               '📍 In-Person'}
            </span>
          )}

          {/* Booking count */}
          {eventType._count?.bookings > 0 && (
            <span className="badge badge-gray">
              {eventType._count.bookings} booking{eventType._count.bookings !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)] pt-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className="btn btn-ghost btn-sm"
              id={`copy-link-${eventType.id}`}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Copy link
                </>
              )}
            </button>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(eventType)}
                className="btn btn-ghost btn-sm"
                id={`edit-event-${eventType.id}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(eventType.id)}
                className="btn btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                id={`delete-event-${eventType.id}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
