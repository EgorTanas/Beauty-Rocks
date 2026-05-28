import {
  CATEGORY_FILTERS,
  CATEGORY_META,
  getCategoryDisplayLabel,
  normalizeCategory,
  resolveServiceImage,
} from './servicesData';

/** Categoriile pentru filtrare în booking — aceleași ca la pagina Services */
export const BOOKING_CATEGORIES = CATEGORY_FILTERS;

const CATEGORY_ORDER = ['manicure', 'pedicure', 'hair-women', 'hair-men', 'beard', 'other'];

export function getCategoryLabel(categoryId) {
  return CATEGORY_META[categoryId]?.label ?? categoryId;
}

/** Mapează un serviciu din API în forma folosită în booking */
export function apiServiceToBooking(service) {
  const categoryId = normalizeCategory(service?.category);
  return {
    id: String(service._id || service.id),
    title: service.name || service.title || 'Service',
    duration: service.duration || '',
    price: service.price || '',
    priceValue: Number.parseFloat(String(service.price || '').replace(/[^\d.]/g, '')) || undefined,
    image: resolveServiceImage(service),
    categoryId,
  };
}

/** Grupează serviciile pe categorii pentru afișare */
export function groupBookingServicesByCategory(
  activeCategoryId = 'all',
  catalog = [],
) {
  const list =
    activeCategoryId === 'all'
      ? catalog
      : catalog.filter((s) => s.categoryId === activeCategoryId);

  if (activeCategoryId !== 'all') {
    return [{ categoryId: activeCategoryId, services: list }];
  }

  return CATEGORY_ORDER.map((categoryId) => ({
    categoryId,
    services: list.filter((s) => s.categoryId === categoryId),
  })).filter((g) => g.services.length > 0);
}

/** Etichetele pentru tipurile de specialiști */
export const BOOKING_SPECIALIST_TYPE_LABELS = {
  nails: 'Nails',
  pedicure: 'Pedicure',
  hair: 'Hair',
  color: 'Color',
  styling: 'Styling',
  bridal: 'Bridal',
  makeup: 'Makeup',
};

/** Ce tipuri de specialist necesită fiecare categorie de serviciu */
const CATEGORY_TO_SPECIALIST_TYPES = {
  manicure: ['nails'],
  pedicure: ['pedicure', 'nails'],
  'hair-women': ['hair', 'color', 'styling'],
  'hair-men': ['hair'],
  beard: ['hair'],
  other: ['bridal', 'makeup', 'styling'],
};

export function getServiceSpecialistTypes(service) {
  if (!service) return [];
  if (Array.isArray(service.specialistTypes) && service.specialistTypes.length > 0) {
    return service.specialistTypes;
  }
  return CATEGORY_TO_SPECIALIST_TYPES[service.categoryId] ?? [];
}

export function getSpecialistDisplayTags(specialist) {
  if (Array.isArray(specialist.serviceCategories) && specialist.serviceCategories.length > 0) {
    return specialist.serviceCategories.map((id) => getCategoryDisplayLabel(id));
  }
  if (specialist.specialtyTypes?.length) {
    return specialist.specialtyTypes.map(
      (type) => BOOKING_SPECIALIST_TYPE_LABELS[type] ?? type,
    );
  }
  return [];
}

export function isSpecialistCompatibleWithService(specialist, service) {
  if (!specialist || !service) return false;
  const required = getServiceSpecialistTypes(service);
  return specialist.specialtyTypes.some((type) => required.includes(type));
}

export const BOOKING_TIME_SLOTS = [
  '9:00 AM',
  '10:30 AM',
  '12:00 PM',
  '1:30 PM',
  '3:00 PM',
  '4:30 PM',
  '6:00 PM',
];

export const BOOKING_STEPS = [
  { id: 1, label: 'Service', short: 'Service' },
  { id: 2, label: 'Specialist', short: 'Specialist' },
  { id: 3, label: 'Date & Time', short: 'Schedule' },
  { id: 4, label: 'Confirmation', short: 'Confirm' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Construiește grila calendaristică pentru o lună */
export function buildCalendarMonth(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < startPad; i += 1) {
    cells.push({ empty: true, key: `pad-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const isPast = date < today;
    const isSunday = date.getDay() === 0;
    const unavailable = isPast || isSunday;
    cells.push({
      empty: false,
      key: `${year}-${month + 1}-${day}`,
      day,
      date,
      unavailable,
      label: `${WEEKDAYS[date.getDay()]}, ${date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`,
    });
  }

  return {
    year,
    month,
    monthLabel: first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    cells,
  };
}

export function formatBookingDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}