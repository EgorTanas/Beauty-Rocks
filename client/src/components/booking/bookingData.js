import {
  CATEGORY_FILTERS,
  CATEGORY_META,
  normalizeCategory,
  resolveServiceImage,
} from '../services/servicesData';

/** Static booking catalog — frontend only, aligned with salon categories */
export const BOOKING_SERVICES = [
  {
    id: 'gel-manicure',
    title: 'Signature Gel Manicure',
    duration: '75 min',
    price: '$85',
    priceValue: 85,
    image: '/imgHome/nail1.jpg',
    categoryId: 'manicure',
  },
  {
    id: 'classic-manicure',
    title: 'Classic Manicure & Polish',
    duration: '45 min',
    price: '$45',
    priceValue: 45,
    image: '/imgHome/nail1.jpg',
    categoryId: 'manicure',
  },
  {
    id: 'spa-pedicure',
    title: 'Luxury Spa Pedicure',
    duration: '90 min',
    price: '$110',
    priceValue: 110,
    image: '/imgHome/nails3.jpeg',
    categoryId: 'pedicure',
  },
  {
    id: 'classic-pedicure',
    title: 'Classic Pedicure',
    duration: '60 min',
    price: '$65',
    priceValue: 65,
    image: '/imgHome/nails3.jpeg',
    categoryId: 'pedicure',
  },
  {
    id: 'balayage',
    title: 'Lived-In Balayage',
    duration: '3 hrs',
    price: '$220',
    priceValue: 220,
    image: '/imgHome/hair2.png',
    categoryId: 'hair-women',
  },
  {
    id: 'blowout',
    title: 'Couture Blowout & Style',
    duration: '60 min',
    price: '$95',
    priceValue: 95,
    image: '/imgHome/hair.png',
    categoryId: 'hair-women',
  },
  {
    id: 'womens-cut',
    title: "Women's Cut & Finish",
    duration: '75 min',
    price: '$85',
    priceValue: 85,
    image: '/imgHome/hair2.png',
    categoryId: 'hair-women',
  },
  {
    id: 'mens-cut',
    title: "Men's Precision Cut",
    duration: '45 min',
    price: '$55',
    priceValue: 55,
    image: '/imgHome/hair2.png',
    categoryId: 'hair-men',
  },
  {
    id: 'beard-trim',
    title: 'Beard Trim & Shape',
    duration: '30 min',
    price: '$35',
    priceValue: 35,
    image: '/imgHome/hair2.png',
    categoryId: 'hair-men',
  },
  {
    id: 'bridal-glam',
    title: 'Bridal Glam Session',
    duration: '2 hrs',
    price: '$165',
    priceValue: 165,
    image: '/imgHome/salon2.jpg',
    categoryId: 'other',
  },
];

/** Same category tabs as Services page */
export const BOOKING_CATEGORIES = CATEGORY_FILTERS;

const CATEGORY_ORDER = ['manicure', 'pedicure', 'hair-women', 'hair-men', 'other'];

export function getCategoryLabel(categoryId) {
  return CATEGORY_META[categoryId]?.label ?? categoryId;
}

/** Map API / listing service into booking catalog shape */
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

/** API services first; static demo entries fill gaps by id */
export function mergeBookingCatalog(apiServices = [], staticServices = BOOKING_SERVICES) {
  const map = new Map();
  for (const s of apiServices) {
    if (s?.id) map.set(String(s.id), s);
  }
  for (const s of staticServices) {
    if (!map.has(String(s.id))) map.set(String(s.id), s);
  }
  return [...map.values()];
}

/** Groups for display — one section per category when viewing all */
export function groupBookingServicesByCategory(
  activeCategoryId = 'all',
  catalog = BOOKING_SERVICES,
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

/** Specialist capability keys — used for frontend matching only */
export const BOOKING_SPECIALIST_TYPE_LABELS = {
  nails: 'Nails',
  pedicure: 'Pedicure',
  hair: 'Hair',
  color: 'Color',
  styling: 'Styling',
  bridal: 'Bridal',
  makeup: 'Makeup',
};

/** Which specialist types each service category requires */
const CATEGORY_TO_SPECIALIST_TYPES = {
  manicure: ['nails'],
  pedicure: ['pedicure', 'nails'],
  'hair-women': ['hair', 'color', 'styling'],
  'hair-men': ['hair'],
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
  return specialist.specialtyTypes.map(
    (type) => BOOKING_SPECIALIST_TYPE_LABELS[type] ?? type,
  );
}

/** Filter specialists compatible with the selected service (frontend only) */
export function filterSpecialistsForService(service) {
  const required = getServiceSpecialistTypes(service);
  if (!required.length) return [...BOOKING_SPECIALISTS];

  return BOOKING_SPECIALISTS.filter((specialist) =>
    specialist.specialtyTypes.some((type) => required.includes(type)),
  );
}

export function isSpecialistCompatibleWithService(specialist, service) {
  if (!specialist || !service) return false;
  const required = getServiceSpecialistTypes(service);
  return specialist.specialtyTypes.some((type) => required.includes(type));
}

export const BOOKING_SPECIALISTS = [
  {
    id: 'maya-chen',
    name: 'Maya Chen',
    role: 'Lead colorist',
    image: '/imgHome/team1.png',
    bio: 'Editorial color and lived-in blondes with a calm, detail-first approach.',
    specialtyTypes: ['hair', 'color', 'styling'],
  },
  {
    id: 'jordan-lee',
    name: 'Jordan Lee',
    role: 'Nail director',
    image: '/imgHome/team2.png',
    bio: 'Structured nail art and gel sculpting for clients who want polish that lasts.',
    specialtyTypes: ['nails', 'pedicure'],
  },
  {
    id: 'sofia-reyes',
    name: 'Sofia Reyes',
    role: 'Bridal specialist',
    image: '/imgHome/team3.png',
    bio: 'Soft glam and timeless bridal looks tailored to your features and dress code.',
    specialtyTypes: ['bridal', 'makeup', 'styling'],
  },
  {
    id: 'ion-russu',
    name: 'Ion Russu',
    role: 'Senior stylist',
    image: '/imgHome/team2.png',
    bio: 'Precision cuts and finishes for everyday polish and special occasions.',
    specialtyTypes: ['hair', 'styling'],
  },
  {
    id: 'elena-marchetti',
    name: 'Elena Marchetti',
    role: 'Nail artist',
    image: '/imgHome/team1.png',
    bio: 'Gel, classic manicure, and detailed nail art with a clean studio finish.',
    specialtyTypes: ['nails', 'pedicure'],
  },
  {
    id: 'irina-kotova',
    name: 'Irina Kotova',
    role: 'Color specialist',
    image: '/imgHome/team3.png',
    bio: 'Balayage, gloss, and tone work tailored to your skin and lifestyle.',
    specialtyTypes: ['hair', 'color'],
  },
  {
    id: 'ana-popescu',
    name: 'Ana Popescu',
    role: 'Men\'s grooming',
    image: '/imgHome/hair2.png',
    bio: 'Men\'s cuts, beard shaping, and low-maintenance styling.',
    specialtyTypes: ['hair'],
  },
  {
    id: 'luca-vasile',
    name: 'Luca Vasile',
    role: 'Spa therapist',
    image: '/imgHome/nails3.jpeg',
    bio: 'Pedicure rituals and restorative foot care for long-lasting comfort.',
    specialtyTypes: ['pedicure', 'nails'],
  },
];

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

/** Build a simple month grid for the fake calendar (no backend) */
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
