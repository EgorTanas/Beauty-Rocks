import { formatDisplayDate, mapApiAppointment } from '../bookings/bookingAdminUtils';

export function buildOverviewStats({ bookings, services, team }) {
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const today = new Date().toISOString().split('T')[0];
  const todayCount = bookings.filter((b) => b.dateKey === today).length;

  return {
    totalBookings: bookings.length,
    totalServices: services.length,
    teamMembers: team.length,
    pendingAppointments: pending,
    todayAppointments: todayCount,
  };
}

export function sortBookingsRecent(bookings, limit = 5) {
  return [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, limit);
}

export function getTodayBookings(bookings) {
  const today = new Date().toISOString().split('T')[0];
  return bookings
    .filter((b) => b.dateKey === today)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

export function formatActivityTime(dateInput) {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDisplayDate(dateInput);
}

export function buildAttentionItems({ bookings, services, team }) {
  const items = [];
  const pending = bookings.filter((b) => b.status === 'pending');
  if (pending.length > 0) {
    items.push({
      id: 'pending',
      message: `${pending.length} booking${pending.length === 1 ? '' : 's'} need confirmation`,
      href: '/admin/bookings',
    });
  }
  const hiddenActive = services.filter((s) => s.isActive === false);
  if (hiddenActive.length > 0) {
    items.push({
      id: 'hidden-services',
      message: `${hiddenActive.length} service${hiddenActive.length === 1 ? '' : 's'} hidden from site`,
      href: '/admin/services',
    });
  }
  const inactiveTeam = team.filter((m) => m.isActive === false);
  if (inactiveTeam.length > 0) {
    items.push({
      id: 'hidden-team',
      message: `${inactiveTeam.length} team member${inactiveTeam.length === 1 ? '' : 's'} hidden`,
      href: '/admin/team',
    });
  }
  return items.slice(0, 4);
}

export { mapApiAppointment };
