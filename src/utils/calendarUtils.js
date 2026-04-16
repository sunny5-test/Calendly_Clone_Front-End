/**
 * Frontend calendar utilities — generates Google Calendar and Outlook URLs
 * for adding meetings to external calendars.
 */

/**
 * Format date as Google Calendar format: YYYYMMDDTHHmmssZ
 */
function formatGoogleDate(date) {
  return new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generate a Google Calendar event URL.
 */
export function getGoogleCalendarUrl({ title, startTime, endTime, description }) {
  const start = formatGoogleDate(startTime);
  const end = formatGoogleDate(endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: description || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an Outlook Web calendar URL.
 */
export function getOutlookCalendarUrl({ title, startTime, endTime, description }) {
  const start = new Date(startTime).toISOString();
  const end = new Date(endTime).toISOString();

  const params = new URLSearchParams({
    rru: 'addevent',
    subject: title,
    startdt: start,
    enddt: end,
    body: description || '',
    path: '/calendar/action/compose',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate a downloadable .ics file and trigger download.
 */
export function downloadICSFile({ title, startTime, endTime, description }) {
  const start = formatGoogleDate(startTime);
  const end = formatGoogleDate(endTime);
  const now = formatGoogleDate(new Date());
  const uid = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@calendly-clone`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendly Clone//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `DTSTAMP:${now}`,
    `UID:${uid}`,
    `SUMMARY:${(title || '').replace(/[;,]/g, ' ')}`,
    `DESCRIPTION:${(description || '').replace(/[;,]/g, ' ').replace(/\n/g, '\\n')}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(title || 'meeting').replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
