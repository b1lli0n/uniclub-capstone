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
 * Supports explicit timeline_at or automatically finds the right day in event duration.
 */
const buildTimelineDate = ({ event, time, timeline_at }) => {
  const normalizedTime = normalizeTimeString(time);
  const [hour, minute] = normalizedTime.split(":").map(Number);

  const eventStart = new Date(event.start_time);
  const eventEnd = new Date(event.end_time);

  // Nếu người dùng chỉ định rõ timeline_at (hoặc ngày cụ thể cho sự kiện nhiều ngày)
  if (timeline_at) {
    const candidate = new Date(timeline_at);
    if (!Number.isNaN(candidate.getTime())) {
      candidate.setHours(hour, minute, 0, 0);
      return {
        time: normalizedTime,
        timeline_at: candidate,
      };
    }
  }

  const startDay = new Date(eventStart);
  startDay.setHours(0, 0, 0, 0);

  const endDay = new Date(eventEnd);
  endDay.setHours(23, 59, 59, 999);

  // Tính các ngày ứng viên trong khoảng thời gian diễn ra sự kiện
  const candidates = [];
  const maxDays = Math.min(
    30,
    Math.max(1, Math.ceil((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)))
  );

  for (let i = 0; i < maxDays; i++) {
    const candidate = new Date(startDay);
    candidate.setDate(candidate.getDate() + i);
    candidate.setHours(hour, minute, 0, 0);
    candidates.push(candidate);
  }

  // Ưu tiên 1: nằm đúng trong [event.start_time, event.end_time]
  let matchedDate = candidates.find(
    (candidate) => candidate >= eventStart && candidate <= eventEnd
  );

  // Ưu tiên 2: nằm trong các ngày diễn ra sự kiện (cho phép chuẩn bị trước hoặc dọn dẹp sau giờ)
  if (!matchedDate) {
    matchedDate = candidates.find(
      (candidate) => candidate >= startDay && candidate <= endDay
    );
  }

  // Mặc định: ngày bắt đầu sự kiện
  if (!matchedDate) {
    matchedDate = new Date(eventStart);
    matchedDate.setHours(hour, minute, 0, 0);
  }

  return {
    time: normalizedTime,
    timeline_at: matchedDate,
  };
};

module.exports = {
  normalizeTimeString,
  buildTimelineDate,
};
