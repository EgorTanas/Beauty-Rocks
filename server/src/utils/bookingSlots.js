const DEFAULT_BREAK_MINUTES = 10;

const TIME_PATTERN = /^([0-1]?\d|2[0-3]):[0-5]\d$/;

function toMinutes(time) {
  const [hours, minutes] = String(time || '').split(':').map(Number);
  return (hours * 60) + minutes;
}

function toTime(minutes) {
  const normalized = Math.max(0, Math.floor(Number(minutes) || 0));
  const hours = Math.floor(normalized / 60).toString().padStart(2, '0');
  const mins = (normalized % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function normalizeDate(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function getZonedParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});
}

function getCurrentMinutesInTimeZone(date, timeZone) {
  const parts = getZonedParts(date, timeZone);
  return ((Number(parts.hour) || 0) * 60) + (Number(parts.minute) || 0);
}

function isSameCalendarDayInTimeZone(left, right, timeZone) {
  const a = getZonedParts(left, timeZone);
  const b = getZonedParts(right, timeZone);
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function parseMinutes(value, fallback = DEFAULT_BREAK_MINUTES) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function resolveServiceDurationMinutes(service) {
  const durationMinutes = parseMinutes(service?.durationMinutes, 0);
  if (durationMinutes > 0) return durationMinutes;

  if (typeof service?.duration === 'number') {
    return service.duration > 0 ? service.duration : 0;
  }

  const raw = String(service?.duration || '').trim();
  const hoursMatch = raw.match(/(\d+)\s*h/i);
  const minsMatch = raw.match(/(\d+)\s*m/i);

  if (hoursMatch || minsMatch) {
    const hours = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 0;
    const mins = minsMatch ? Number.parseInt(minsMatch[1], 10) : 0;
    return (hours * 60) + mins;
  }

  return parseMinutes(raw, 0);
}

function resolveBreakMinutes(source, fallback = DEFAULT_BREAK_MINUTES) {
  return parseMinutes(source, fallback);
}

function buildBusyBlocks(appointments = [], fallbackBreakMinutes = DEFAULT_BREAK_MINUTES) {
  return appointments.map((appointment) => {
    const breakMinutes = resolveBreakMinutes(
      appointment.breakMinutes,
      fallbackBreakMinutes
    );

    return {
      start: toMinutes(appointment.startTime),
      end: toMinutes(appointment.endTime) + breakMinutes,
    };
  });
}

function mergeIntervals(intervals) {
  if (!intervals.length) return [];

  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i += 1) {
    const current = intervals[i];
    const last = merged[merged.length - 1];

    if (current.start > last.end) {
      merged.push({ ...current });
      continue;
    }

    last.end = Math.max(last.end, current.end);
  }

  return merged;
}

function buildFreeIntervals({
  workStart,
  workEnd,
  busyBlocks = [],
}) {
  const clamped = busyBlocks
    .map((block) => ({
      start: Math.max(block.start, workStart),
      end: Math.min(block.end, workEnd),
    }))
    .filter((block) => block.start < block.end)
    .sort((a, b) => a.start - b.start);

  const merged = mergeIntervals(clamped);
  const freeIntervals = [];
  let cursor = workStart;

  for (const block of merged) {
    if (cursor < block.start) {
      freeIntervals.push({ start: cursor, end: block.start });
    }
    cursor = Math.max(cursor, block.end);
  }

  if (cursor < workEnd) {
    freeIntervals.push({ start: cursor, end: workEnd });
  }

  return freeIntervals;
}

function generateSlotsFromFreeIntervals({
  freeIntervals = [],
  serviceDurationMinutes,
}) {
  const slots = [];

  for (const interval of freeIntervals) {
    for (
      let start = interval.start;
      start + serviceDurationMinutes <= interval.end;
      start += serviceDurationMinutes
    ) {
      slots.push(start);
    }
  }

  return slots;
}

function isValidTimeString(value) {
  return TIME_PATTERN.test(String(value || '').trim());
}

module.exports = {
  DEFAULT_BREAK_MINUTES,
  buildBusyBlocks,
  buildFreeIntervals,
  generateSlotsFromFreeIntervals,
  isValidTimeString,
  getCurrentMinutesInTimeZone,
  isSameCalendarDayInTimeZone,
  normalizeDate,
  resolveBreakMinutes,
  resolveServiceDurationMinutes,
  toMinutes,
  toTime,
};
