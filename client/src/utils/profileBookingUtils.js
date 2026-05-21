export function formatProfileTime(time24) {
  if (!time24 || typeof time24 !== 'string') return '—';
  const [hRaw, mRaw] = time24.split(':');
  const h = Number.parseInt(hRaw, 10);
  const m = Number.parseInt(mRaw, 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function formatProfileDate(dateInput) {
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

export function mapProfileAppointment(apt) {
  return {
    id: apt._id,
    serviceName: apt.service?.name || '—',
    specialistName: apt.teamMember?.name || '—',
    specialistRole: apt.teamMember?.role || '',
    servicePrice: apt.service?.price || '',
    serviceDuration: apt.service?.duration || '',
    date: apt.date,
    dateLabel: formatProfileDate(apt.date),
    timeLabel: formatProfileTime(apt.startTime),
    endTimeLabel: formatProfileTime(apt.endTime),
    status: apt.status || 'pending',
    notes: apt.notes || '',
  };
}
