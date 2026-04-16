'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Toast from '@/components/layout/Toast';
import { availabilityAPI } from '@/services/api';
import { DAY_NAMES } from '@/utils/dateUtils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

/**
 * Generate time options in 30-minute increments.
 */
function generateTimeOptions() {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      const time = `${hour}:${minute}`;

      // Friendly label
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${displayHour}:${minute} ${period}`;

      options.push({ value: time, label });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

const DEFAULT_SCHEDULE = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i,
  enabled: i >= 1 && i <= 5, // Mon-Fri enabled by default
  startTime: '09:00',
  endTime: '17:00',
}));

function AvailabilityPageContent() {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch existing availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await availabilityAPI.getAll();
        const data = res.data.data;

        if (data.length > 0) {
          setSchedule(
            DAY_NAMES.map((_, i) => {
              const existing = data.find((a) => a.dayOfWeek === i);
              return {
                dayOfWeek: i,
                enabled: !!existing,
                startTime: existing?.startTime || '09:00',
                endTime: existing?.endTime || '17:00',
              };
            })
          );
        }
      } catch (err) {
        setToast({ message: 'Failed to load availability', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const handleToggle = (dayOfWeek) => {
    setSchedule((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const handleTimeChange = (dayOfWeek, field, value) => {
    setSchedule((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const enabledSchedules = schedule
        .filter((s) => s.enabled)
        .map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          timezone: 'Asia/Kolkata',
        }));

      await availabilityAPI.set(enabledSchedules);
      setToast({ message: 'Availability saved successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to save availability', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <Header
        title="Availability"
        subtitle="Set your weekly hours when you're available for meetings"
        action={
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
            id="save-availability"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        }
      />

      <div className="card glass">
        {/* Timezone info */}
        <div className="flex items-center gap-2 mb-6 pb-5 border-b border-[var(--border)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-sm text-[var(--text-muted)]">
            Timezone: Asia/Kolkata (IST)
          </span>
        </div>

        {/* Schedule Rows */}
        <div className="flex flex-col gap-0">
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="skeleton w-11 h-6 rounded-full" />
                    <div className="skeleton h-4 w-24" />
                  </div>
                  <div className="flex-1 flex items-center gap-3 pl-14 sm:pl-0">
                    <div className="skeleton h-10 flex-1" />
                    <div className="skeleton h-10 flex-1" />
                  </div>
                </div>
              ))
            : schedule.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4 border-b border-[var(--border)] last:border-0 transition-opacity duration-200 ${
                    !day.enabled ? 'opacity-50' : ''
                  }`}
                >
                  {/* Toggle + Day name row */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      className={`toggle ${day.enabled ? 'active' : ''}`}
                      onClick={() => handleToggle(day.dayOfWeek)}
                      id={`toggle-day-${day.dayOfWeek}`}
                      aria-label={`Toggle ${DAY_NAMES[day.dayOfWeek]}`}
                    />
                    <span className="w-28 text-sm font-medium text-[var(--text-primary)]">
                      {DAY_NAMES[day.dayOfWeek]}
                    </span>
                  </div>

                  {/* Time pickers */}
                  {day.enabled ? (
                    <div className="flex-1 flex items-center gap-3 pl-14 sm:pl-0">
                      <select
                        className="input flex-1 min-w-0"
                        value={day.startTime}
                        onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                        id={`start-time-${day.dayOfWeek}`}
                      >
                        {TIME_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <span className="text-[var(--text-muted)] text-sm shrink-0">to</span>

                      <select
                        className="input flex-1 min-w-0"
                        value={day.endTime}
                        onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                        id={`end-time-${day.dayOfWeek}`}
                      >
                        {TIME_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--text-muted)] italic pl-14 sm:pl-0">
                      Unavailable
                    </span>
                  )}
                </div>
              ))
          }
        </div>
      </div>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default function AvailabilityPage() {
  return (
    <ProtectedRoute>
      <AvailabilityPageContent />
    </ProtectedRoute>
  );
}
