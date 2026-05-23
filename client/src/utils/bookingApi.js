import { apiFetch, isMongoId, parseJson, toISODateString } from './api';
import { resolveTeamAvatar } from '../components/team/teamUtils';
import { getServiceSpecialistTypes } from '../components/booking/bookingData';

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
  return types.size ? [...types] : ['hair', 'nails', 'styling', 'pedicure'];
}

export function mapApiMemberToBookingSpecialist(member) {
  const specialtyTypes = inferSpecialtyTypes(member.specialties);
  return {
    id: String(member._id || member.id),
    name: member.name,
    role: member.role,
    image: resolveTeamAvatar(member.avatar) || '/imgHome/team1.png',
    bio: member.bio || '',
    specialtyTypes,
    fromApi: true,
  };
}

export async function fetchBookingTeam() {
  const res = await apiFetch('/api/team');
  const json = await parseJson(res);
  if (!res.ok || !Array.isArray(json.data)) return [];
  return json.data
    .filter((m) => m.isActive !== false)
    .map(mapApiMemberToBookingSpecialist);
}

/**
 * Filtrează specialiștii din API după serviciul selectat.
 * Dacă niciun specialist nu corespunde, returnează toată lista (fără fallback hardcodat).
 */
export function mergeBookingSpecialists(apiList, service) {
  const required = service ? getServiceSpecialistTypes(service) : [];
  const apiFiltered = service
    ? apiList.filter((s) =>
        s.specialtyTypes.some((type) => required.includes(type)),
      )
    : apiList;

  // Dacă niciun specialist nu se potrivește strict, arată toți (mai util decât lista goală)
  return apiFiltered.length > 0 ? apiFiltered : apiList;
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

export { isMongoId };