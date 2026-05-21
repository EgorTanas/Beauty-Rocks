const ACTIVE = new Set(['pending', 'confirmed']);

export function isUpcomingBooking(apt) {
  if (!apt?.date) return false;
  const status = (apt.status || '').toLowerCase();
  if (!ACTIVE.has(status)) return false;
  const d = new Date(apt.date);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

export function sortByDateAsc(a, b) {
  const da = new Date(a.date).getTime();
  const db = new Date(b.date).getTime();
  if (da !== db) return da - db;
  return String(a.startTime || '').localeCompare(String(b.startTime || ''));
}

export function getUpcomingBookings(bookings) {
  return [...bookings].filter(isUpcomingBooking).sort(sortByDateAsc);
}

export function getNextAppointment(bookings) {
  return getUpcomingBookings(bookings)[0] || null;
}

export function getUpcomingList(bookings, limit = 3) {
  const upcoming = getUpcomingBookings(bookings);
  return upcoming.slice(1, 1 + limit);
}

export function parsePriceAmount(priceStr) {
  if (!priceStr) return 0;
  const n = Number.parseFloat(String(priceStr).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(total) {
  if (!total) return '—';
  return `$${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function computeTotalSpent(bookings) {
  return bookings
    .filter((b) => ['completed', 'confirmed'].includes((b.status || '').toLowerCase()))
    .reduce((sum, b) => sum + parsePriceAmount(b.servicePrice), 0);
}

export function getTopArtists(bookings, limit = 3) {
  const map = new Map();
  for (const b of bookings) {
    const name = b.specialistName;
    if (!name || name === '—') continue;
    const cur = map.get(name) || {
      name,
      role: b.specialistRole || 'Specialist',
      count: 0,
    };
    cur.count += 1;
    if (b.specialistRole) cur.role = b.specialistRole;
    map.set(name, cur);
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export function getLoyalty(totalVisits) {
  const visits = Math.max(0, totalVisits);
  if (visits >= 20) {
    return {
      tier: 'Platinum',
      nextTier: null,
      progress: 100,
      pointsToNext: 0,
      label: 'Platinum Member',
    };
  }
  if (visits >= 10) {
    const progress = Math.min(99, Math.round(((visits - 10) / 10) * 100));
    return {
      tier: 'Gold',
      nextTier: 'Platinum',
      progress: Math.max(progress, 8),
      pointsToNext: (20 - visits) * 10,
      label: 'Gold Member',
    };
  }
  if (visits >= 3) {
    const progress = Math.min(99, Math.round(((visits - 3) / 7) * 100));
    return {
      tier: 'Silver',
      nextTier: 'Gold',
      progress: Math.max(progress, 12),
      pointsToNext: (10 - visits) * 10,
      label: 'Silver Member',
    };
  }
  const progress = visits === 0 ? 0 : Math.min(99, Math.round((visits / 3) * 100));
  return {
    tier: 'Member',
    nextTier: 'Silver',
    progress,
    pointsToNext: (3 - visits) * 10,
    label: 'Member',
  };
}

export function formatHeroDate(dateInput) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '—';
  const day = d.getDate();
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatUpcomingWhen(apt) {
  if (!apt?.date) return '—';
  const d = new Date(apt.date);
  if (Number.isNaN(d.getTime())) return '—';
  const datePart = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  return `${datePart}, ${apt.timeLabel || ''}`.trim();
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
