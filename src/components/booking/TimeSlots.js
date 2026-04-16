'use client';

import { formatTime } from '@/utils/dateUtils';

/**
 * Time slots component — displays available slots as a scrollable list.
 */
export default function TimeSlots({ slots, selectedSlot, onSelect, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="mx-auto mb-3">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
        <p className="text-sm text-[var(--text-muted)] m-0">
          No available slots for this date
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
      {slots.map((slot, index) => {
        const isSelected = selectedSlot?.start === slot.start;
        return (
          <button
            key={slot.start}
            onClick={() => onSelect(slot)}
            className={`
              py-3 px-4 rounded-lg border text-sm font-semibold transition-all duration-200
              animate-fade-in
              ${isSelected
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md'
                : 'bg-white text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary-light)]'
              }
            `}
            style={{ animationDelay: `${index * 30}ms` }}
            id={`time-slot-${index}`}
          >
            {formatTime(slot.start)}
            {slot.spotsLeft !== undefined && (
              <span className={`block text-xs font-normal mt-0.5 ${isSelected ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                {slot.spotsLeft} spot{slot.spotsLeft !== 1 ? 's' : ''} left
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
