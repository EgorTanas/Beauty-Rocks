/** Statuses the current admin API accepts on PATCH /status (until backend adds more) */
export const BOOKING_API_STATUSES = ['pending', 'confirmed', 'cancelled'];

export function isApiPatchableStatus(status) {
  return BOOKING_API_STATUSES.includes(String(status).trim().toLowerCase());
}

export const BOOKING_STATUSES = [
  { id: 'all', label: 'All statuses' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function formatDisplayTime(time24) {
  if (!time24 || typeof time24 !== 'string') return '—';
  const [hRaw, mRaw] = time24.split(':');
  const h = Number.parseInt(hRaw, 10);
  const m = Number.parseInt(mRaw, 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function formatDisplayDate(dateInput) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function toDateInputValue(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function mapApiAppointment(apt) {
  return {
    id: apt._id,
    clientName:
      apt.user?.name?.trim() ||
      apt.user?.email?.split('@')[0] ||
      'Studio guest',
    clientEmail: apt.user?.email || '',
    serviceName: apt.service?.name || '—',
    servicePrice: apt.service?.price ?? '',
    serviceDuration: apt.service?.duration ?? '',
    serviceCategory: apt.service?.category ?? '',
    specialistId: apt.teamMember?._id || '',
    specialistName: apt.teamMember?.name || '—',
    specialistRole: apt.teamMember?.role || '',
    specialistAvatar: apt.teamMember?.avatar || '',
    date: apt.date,
    dateKey: toDateInputValue(apt.date),
    startTime: apt.startTime,
    endTime: apt.endTime,
    timeLabel: formatDisplayTime(apt.startTime),
    dateLabel: formatDisplayDate(apt.date),
    status: apt.status || 'pending',
    notes: apt.notes || '',
    createdAt: apt.createdAt,
  };
}

export function computeBookingStats(bookings) {
  const stats = {
    total: bookings.length,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };
  bookings.forEach((b) => {
    if (stats[b.status] !== undefined) stats[b.status] += 1;
  });
  return stats;
}

export function filterBookingsClient(bookings, { search, status, specialistId, date }) {
  const q = search.trim().toLowerCase();
  return bookings.filter((b) => {
    if (status && status !== 'all' && b.status !== status) return false;
    if (specialistId && specialistId !== 'all' && b.specialistId !== specialistId) return false;
    if (date && b.dateKey !== date) return false;
    if (!q) return true;
    return (
      b.clientName.toLowerCase().includes(q) ||
      b.clientEmail.toLowerCase().includes(q) ||
      b.serviceName.toLowerCase().includes(q) ||
      b.specialistName.toLowerCase().includes(q) ||
      b.notes.toLowerCase().includes(q)
    );
  });
}

export function extractSpecialistsFromBookings(bookings) {
  const map = new Map();
  bookings.forEach((b) => {
    if (b.specialistId && !map.has(b.specialistId)) {
      map.set(b.specialistId, { id: b.specialistId, name: b.specialistName });
    }
  });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
