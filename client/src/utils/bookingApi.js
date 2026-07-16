import { apiFetch, isMongoId, parseJson, toISODateString } from './api';
import { resolveTeamAvatar } from '../components/team/teamUtils';

const SPECIALTY_KEYWORDS = [
  ['manicure', 'nails'],
  ['nail', 'nails'],
  ['pedicure', 'pedicure'],
  ['hair', 'hair'],
  ['color', 'color'],
  ['colour', 'color'],
  ['balayage', 'color'],
  ['cut', 'hair'],
  ['barber', 'hair'],
  ['groom', 'hair'],
  ['bridal', 'bridal'],
  ['makeup', 'makeup'],
  ['make-up', 'makeup'],
  ['style', 'styling'],
  ['styling', 'styling'],
  ['spa', 'pedicure'],
];

function inferSpecialtyTypes(specialties = []) {
  const types = new Set();
  for (const raw of specialties) {
    const lower = String(raw).toLowerCase();
    for (const [keyword, type] of SPECIALTY_KEYWORDS) {
      if (lower.includes(keyword)) types.add(type);
    }
  }
  return types.size ? [...types] : [];
}

export function mapApiMemberToBookingSpecialist(member) {
  const specialtyTypes = inferSpecialtyTypes(member.specialties);
  const serviceCategories = Array.isArray(member.serviceCategories)
    ? member.serviceCategories.map((c) => String(c).toLowerCase())
    : [];
  return {
    id: String(member._id || member.id),
    name: member.name,
    role: member.role,
    image: resolveTeamAvatar(member.avatar) || '/imgHome/team1.png',
    bio: member.bio || '',
    specialtyTypes,
    serviceCategories,
    fromApi: true,
  };
}

export async function fetchBookingTeam(serviceId) {
  const path = serviceId ? `/api/team?service=${encodeURIComponent(serviceId)}` : '/api/team';
  const res = await apiFetch(path);
  const json = await parseJson(res);
  if (!res.ok || !Array.isArray(json.data)) return [];
  return json.data
    .filter((m) => m.isActive !== false)
    .map(mapApiMemberToBookingSpecialist);
}

/** Client-side filter fallback when full team list was loaded */
export function filterSpecialistsForService(apiList, service) {
  if (!service) return apiList;
  const categoryId = String(service.categoryId || '').toLowerCase();
  return apiList.filter(
    (s) =>
      Array.isArray(s.serviceCategories) &&
      s.serviceCategories.length > 0 &&
      s.serviceCategories.includes(categoryId),
  );
}

export function mergeBookingSpecialists(apiList, service) {
  if (!service) return apiList;
  return filterSpecialistsForService(apiList, service);
}

export async function fetchAvailableSlots({ teamMemberId, serviceId, date }) {
  if (!isMongoId(teamMemberId) || !isMongoId(serviceId) || !date) {
    return { slots: [], error: null, useFallback: true };
  }

  const iso = date instanceof Date ? toISODateString(date) : date;
  const params = new URLSearchParams({
    worker: teamMemberId,
    date: iso,
    service: serviceId,
  });

  const res = await apiFetch(`/api/appointments/available-slots?${params}`);
  const json = await parseJson(res);

  if (!res.ok) {
    return {
      slots: [],
      error: json.message || 'Could not load time slots',
      useFallback: false,
    };
  }

  const slots = Array.isArray(json.data) ? json.data : [];
  return { slots, error: null, useFallback: false };
}

export async function createAppointment({ serviceId, teamMemberId, date, startTime, notes }) {
  if (!isMongoId(serviceId) || !isMongoId(teamMemberId)) {
    return {
      ok: false,
      message:
        'Serviciul sau specialistul selectat nu este valid. Alege un serviciu din catalogul live.',
    };
  }

  const iso = date instanceof Date ? toISODateString(date) : date;

  const res = await apiFetch('/api/appointments', {
    method: 'POST',
    body: {
      service: serviceId,
      teamMember: teamMemberId,
      date: iso,
      startTime,
      notes: notes || '',
    },
  });

  const json = await parseJson(res);
  if (!res.ok) {
    return { ok: false, message: json.message || 'Booking failed' };
  }

  return { ok: true, data: json.data };
}

export async function fetchRescheduleRequest(token) {
  if (!token) {
    return { ok: false, message: 'Missing reschedule token' };
  }

  const res = await apiFetch(`/api/appointments/reschedule/${encodeURIComponent(token)}`);
  const json = await parseJson(res);
  if (!res.ok) {
    return { ok: false, message: json.message || 'Could not load reschedule request' };
  }

  return { ok: true, data: json.data };
}

export async function submitRescheduleRequest(token, { date, startTime }) {
  if (!token || !date || !startTime) {
    return { ok: false, message: 'Token, date and startTime are required' };
  }

  const iso = date instanceof Date ? toISODateString(date) : date;
  const res = await apiFetch(`/api/appointments/reschedule/${encodeURIComponent(token)}`, {
    method: 'POST',
    body: {
      date: iso,
      startTime,
    },
  });
  const json = await parseJson(res);
  if (!res.ok) {
    return { ok: false, message: json.message || 'Could not reschedule appointment' };
  }

  return { ok: true, data: json.data };
}

export { isMongoId };
