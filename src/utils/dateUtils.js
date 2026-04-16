import { format, parseISO, isToday, isTomorrow, isPast, isFuture } from 'date-fns';

/**
 * Format a date for display.
 * @param {string|Date} date
 * @param {string} formatStr - date-fns format string
 * @returns {string}
 */
export function formatDate(date, formatStr = 'EEEE, MMMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * Format a time for display.
 * @param {string|Date} date
 * @returns {string} e.g. "9:00 AM"
 */
export function formatTime(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

/**
 * Format a date range for display.
 * @param {string} start
 * @param {string} end
 * @returns {string} e.g. "9:00 AM - 9:30 AM"
 */
export function formatTimeRange(start, end) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Get a relative date label.
 * @param {string|Date} date
 * @returns {string} "Today", "Tomorrow", or formatted date
 */
export function getRelativeDateLabel(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'EEEE, MMMM d');
}

/**
 * Check if a date is in the past.
 */
export function isDatePast(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isPast(d);
}

/**
 * Check if a date is in the future.
 */
export function isDateFuture(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isFuture(d);
}

/**
 * Day names for the weekly availability editor.
 */
export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Short day names.
 */
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
