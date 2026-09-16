/**
 * Time Helper Utility for Uniclub Backend
 * Standardizes time normalization, parsing, and timeline date association.
 */

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Normalizes any loose time string ("9:00", "9h", "9h30", "9h5", "9:00 AM", "09:00 PM", "14:30:00")
 * into standard 24-hour format "HH:mm" (e.g. "09:00", "14:30").
 */
const normalizeTimeString = (time) => {
  if (!time || !String(time).trim()) {
    throw createError("Time is required", 400);
  }

  let normalized = String(time).trim();

  // 1. Chuẩn hóa 12-hour AM/PM: e.g. "9:00 AM", "09:00 PM", "2:30pm", "12:15 am"
  const ampmMatch = normalized.match(/^(\d{1,2}):([0-5]\d)(?::[0-5]\d)?\s*(am|pm)$/i);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10);
    const minute = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();
    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    normalized = `${String(hour).padStart(2, "0")}:${minute}`;
  }

  // 2. Chuẩn hóa dạng tiếng Việt "9h", "09h", "9h30", "9h5"
  const hMatch = normalized.match(/^(\d{1,2})h(\d{1,2})?$/i);
  if (hMatch) {
    const hh = hMatch[1].padStart(2, "0");
    const mm = (hMatch[2] || "0").padStart(2, "0");
    normalized = `${hh}:${mm}`;
  }

  // 3. Chuẩn hóa "9:00" -> "09:00"
  if (/^\d:[0-5]\d$/.test(normalized)) {
    normalized = `0${normalized}`;
  }

  // 4. Bỏ phần giây nếu có "09:00:00" -> "09:00"
  const secMatch = normalized.match(/^([01]\d|2[0-3]):([0-5]\d):[0-5]\d$/);
  if (secMatch) {
    normalized = `${secMatch[1]}:${secMatch[2]}`;
  }

  // 5. Kiểm tra đúng format 24h chuẩn HH:mm
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(normalized)) {
    throw createError("Time must be in HH:mm format (e.g. 09:00, 14:30)", 400);
  }

  return normalized;
};

/**
 * Builds a valid timeline Date object anchoring to event start/end times.
 * Enforces that the resolved datetime falls strictly within [event.start_time, event.end_time].
 * Throws a 400 error if the timeline falls outside the event duration.
 */
const buildTimelineDate = ({ event, time, timeline_at }) => {
  const normalizedTime = normalizeTimeString(time);
  const [hour, minute] = normalizedTime.split(":").map(Number);

  const eventStart = new Date(event.start_time);
  const eventEnd = new Date(event.end_time);

  /**
   * Helper: format a Date as "HH:mm DD/MM/YYYY" for readable error messages.
   */
  const fmt = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  let candidate;

  if (timeline_at) {
    // Explicit date provided — apply the requested time on that date
    candidate = new Date(timeline_at);
    if (Number.isNaN(candidate.getTime())) {
      throw createError("Invalid timeline_at date", 400);
    }
    candidate.setHours(hour, minute, 0, 0);
  } else {
    // No explicit date — try to place the time on the event's start date first,
    // then on each subsequent day within the event duration.
    const startDay = new Date(eventStart);
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date(eventEnd);
    endDay.setHours(23, 59, 59, 999);

    const maxDays = Math.min(
      30,
      Math.max(1, Math.ceil((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)))
    );

    candidate = null;
    for (let i = 0; i < maxDays; i++) {
      const attempt = new Date(startDay);
      attempt.setDate(attempt.getDate() + i);
      attempt.setHours(hour, minute, 0, 0);

      // Accept the first datetime that falls strictly within event bounds
      if (attempt >= eventStart && attempt <= eventEnd) {
        candidate = attempt;
        break;
      }
    }

    // No valid slot found within the event window
    if (!candidate) {
      throw createError(
        `Timeline ${normalizedTime} is outside event hours (${fmt(eventStart)} – ${fmt(eventEnd)}).`,
        400
      );
    }
  }

  // Final strict check — applies to both explicit and auto-resolved candidates
  if (candidate < eventStart || candidate > eventEnd) {
    throw createError(
      `Timeline ${normalizedTime} is outside event hours (${fmt(eventStart)} – ${fmt(eventEnd)}).`,
      400
    );
  }

  return {
    time: normalizedTime,
    timeline_at: candidate,
  };
};

module.exports = {
  normalizeTimeString,
  buildTimelineDate,
};
