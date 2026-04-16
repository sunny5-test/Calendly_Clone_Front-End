'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
} from 'date-fns';

/**
 * Calendar component for date selection (Calendly-style month view).
 */
export default function Calendar({ selectedDate, onDateSelect, minDate }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const today = startOfDay(new Date());
  const effectiveMinDate = minDate ? startOfDay(new Date(minDate)) : today;

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="btn btn-ghost p-2 rounded-lg"
        id="calendar-prev-month"
        aria-label="Previous month"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15,18 9,12 15,6" />
        </svg>
      </button>
      <h3 className="text-base font-semibold m-0">
        {format(currentMonth, 'MMMM yyyy')}
      </h3>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="btn btn-ghost p-2 rounded-lg"
        id="calendar-next-month"
        aria-label="Next month"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </button>
    </div>
  );

  const renderDayNames = () => {
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return (
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-[var(--text-muted)] py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const rows = [];
    let day = calStart;

    while (day <= calEnd) {
      const cells = [];
      for (let i = 0; i < 7; i++) {
        const cellDate = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        const isPast = isBefore(day, effectiveMinDate);

        cells.push(
          <button
            key={day.toString()}
            onClick={() => !isPast && isCurrentMonth && onDateSelect(cellDate)}
            disabled={isPast || !isCurrentMonth}
            className={`
              aspect-square flex items-center justify-center rounded-full text-sm font-medium
              transition-all duration-200 relative
              ${!isCurrentMonth ? 'text-[var(--border)] cursor-default' : ''}
              ${isPast && isCurrentMonth ? 'text-[var(--text-muted)] cursor-not-allowed opacity-40' : ''}
              ${isSelected ? 'bg-[var(--primary)] text-white shadow-md' : ''}
              ${isToday && !isSelected ? 'ring-2 ring-[var(--primary)] ring-inset text-[var(--primary)] font-bold' : ''}
              ${!isSelected && !isPast && isCurrentMonth ? 'hover:bg-[var(--primary-light)] hover:text-[var(--primary)] cursor-pointer' : ''}
            `}
            id={`calendar-day-${format(cellDate, 'yyyy-MM-dd')}`}
          >
            {format(day, 'd')}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {cells}
        </div>
      );
    }
    return <div className="flex flex-col gap-1">{rows}</div>;
  };

  return (
    <div className="select-none">
      {renderHeader()}
      {renderDayNames()}
      {renderCells()}
    </div>
  );
}
