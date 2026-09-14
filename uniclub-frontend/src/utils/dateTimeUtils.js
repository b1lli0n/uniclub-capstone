/**
 * Shared Date & Time Utilities for UniClub Frontend
 * Ensures synchronized 24-hour time formatting, parsing, sorting, and loose input normalization.
 */

const pad2 = (num) => String(num).padStart(2, '0');

/**
 * Format any date/ISO string to 24-hour "HH:mm".
 * Uses getHours() and getMinutes() to avoid cross-browser locale discrepancies.
 */
export function formatTime24(dateValue, fallback = '') {
  if (!dateValue) return fallback;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return fallback;
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Format a start and end time into a synchronized 24-hour range: "09:00 - 11:30".
 */
export function formatTimeRange24(startTime, endTime, fallback = '--:--') {
  const start = formatTime24(startTime, '');
  const end = formatTime24(endTime, '');
  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  if (end) return end;
  return fallback;
}

/**
 * Format date to Vietnamese format "DD/MM/YYYY".
 */
export function formatDateVN(dateValue, fallback = '') {
  if (!dateValue) return fallback;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return fallback;
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Format date and time to "HH:mm DD/MM/YYYY".
 */
export function formatDateTimeVN(dateValue, fallback = '') {
  if (!dateValue) return fallback;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return fallback;
  return `${formatTime24(d)} ${formatDateVN(d)}`;
}

/**
 * Parse loose time input into parts { hour: '08', minute: '00', period: 'AM' }
 * for UI select dropdowns. Handles 12h AM/PM, 24h "HH:mm", and casual "9h30" inputs.
 */
export function parseTimeParts(timeStr = '08:00 AM') {
  if (!timeStr) return { hour: '08', minute: '00', period: 'AM' };
  const raw = String(timeStr).trim();

  // 1. Format 12-hour AM/PM: e.g. "8:00 AM", "08:00PM", "2:30 pm"
  const ampmMatch = raw.match(/^(\d{1,2}):([0-5]\d)(?::[0-5]\d)?\s*(AM|PM)$/i);
  if (ampmMatch) {
    const rawH = parseInt(ampmMatch[1], 10);
    const clampedH = Math.min(12, Math.max(1, rawH));
    return {
      hour: pad2(clampedH),
      minute: ampmMatch[2],
      period: ampmMatch[3].toUpperCase(),
    };
  }

  // 2. Format tiếng Việt "9h", "9h30", "14h20"
  const hMatch = raw.match(/^(\d{1,2})h(\d{1,2})?$/i);
  if (hMatch) {
    let h = parseInt(hMatch[1], 10);
    const m = pad2(hMatch[2] || '0');
    let p = 'AM';
    if (h >= 12) {
      p = 'PM';
      if (h > 12) h -= 12;
    }
    if (h === 0) h = 12;
    return { hour: pad2(h), minute: m, period: p };
  }

  // 3. Format 24h "14:30" hoặc "9:00"
  const [hStr, mStr] = raw.split(':');
  let h = parseInt(hStr || '8', 10);
  const m = mStr ? mStr.substring(0, 2).padStart(2, '0') : '00';
  let p = 'AM';
  if (h >= 12) {
    p = 'PM';
    if (h > 12) h -= 12;
  }
  if (h === 0) h = 12;
  return { hour: pad2(h), minute: m, period: p };
}

/**
 * Normalizes any loose time input into standard 24-hour "HH:mm" (e.g. "09:00", "14:30").
 */
export function normalizeTimeInput(timeStr = '08:00 AM') {
  if (!timeStr) return '08:00';
  const raw = String(timeStr).trim();

  // "9:00", "09:00", "14:30"
  if (/^\d{1,2}:[0-5]\d$/.test(raw)) {
    const [h, m] = raw.split(':');
    return `${pad2(h)}:${m}`;
  }

  // "9h", "9h30", "9h5"
  const hMatch = raw.match(/^(\d{1,2})h(\d{1,2})?$/i);
  if (hMatch) {
    const hh = pad2(hMatch[1]);
    const mm = pad2(hMatch[2] || '0');
    return `${hh}:${mm}`;
  }

  // AM/PM format
  const { hour, minute, period } = parseTimeParts(raw);
  let h = parseInt(hour, 10);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${pad2(h)}:${minute}`;
}

/**
 * Stable sorting function for timeline lists.
 * Compares actual timelineAt (Date timestamp), falling back to 24h string time.
 */
export function sortTimelines(a, b) {
  const timeA = a.timelineAt ? new Date(a.timelineAt).getTime() : 0;
  const timeB = b.timelineAt ? new Date(b.timelineAt).getTime() : 0;
  if (timeA && timeB && timeA !== timeB) {
    return timeA - timeB;
  }
  return (a.time || '').localeCompare(b.time || '');
}
