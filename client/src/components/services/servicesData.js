import {
  Grid3x3,
  Scissors,
  Sparkles,
  Footprints,
  UserRound,
} from 'lucide-react';
import {
  normalizeCategory as normalizeCategorySlug,
  getCategoryLabel as getDynamicCategoryLabel,
} from '../../utils/categories';

/** Salon categories — no skincare */
export const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Services', Icon: Grid3x3 },
  { id: 'manicure', label: 'Manicure', Icon: Sparkles },
  { id: 'pedicure', label: 'Pedicure', Icon: Footprints },
  { id: 'hair-women', label: 'Women\'s cut', Icon: Scissors },
  { id: 'hair-men', label: 'Men\'s cut', Icon: UserRound },
  { id: 'beard', label: 'Beard & grooming', Icon: UserRound },
  { id: 'other', label: 'Other', Icon: Sparkles },
];

export const CATEGORY_META = {
  manicure: {
    label: 'Manicure',
    lead: 'Classic, gel, semi-permanent, extensions și nail art.',
  },
  pedicure: {
    label: 'Pedicure',
    lead: 'Îngrijire picioare, pedichiură clasică și tratamente spa.',
  },
  'hair-women': {
    label: 'Women\'s haircut',
    lead: 'Tunsori femei, styling, culoare, balayage și keratin.',
  },
  'hair-men': {
    label: 'Men\'s haircut',
    lead: 'Tunsori bărbați, aranjat barbă și styling masculin.',
  },
  beard: {
    label: 'Beard & grooming',
    lead: 'Tuns barbă, contur și îngrijire masculină.',
  },
  other: {
    label: 'Other',
    lead: 'Pachete speciale și servicii la cerere.',
  },
};

export function normalizeCategory(category) {
  return normalizeCategorySlug(category);
}

export function getCategoryDisplayLabel(category) {
  const id = normalizeCategory(category);
  if (CATEGORY_META[id]?.label) return CATEGORY_META[id].label;
  return getDynamicCategoryLabel(id);
}

export const CATEGORY_IMAGES = {
  manicure: '/imgHome/nail1.jpg',
  pedicure: '/imgHome/nails3.jpeg',
  'hair-women': '/imgHome/hair2.png',
  'hair-men': '/imgHome/hair2.png',
  beard: '/imgHome/hair2.png',
  other: '/imgHome/salon2.jpg',
};

const DEFAULT_SERVICE_IMAGE = '/imgHome/image.png';

const SLUG_IMAGE_OVERRIDES = {
  balayage: '/imgHome/hair2.png',
  'bridal-package': '/imgHome/salon2.jpg',
  manichiura: '/imgHome/nail1.jpg',
  manicure: '/imgHome/nail1.jpg',
  pedicure: '/imgHome/nails3.jpeg',
};

export function slugifyServiceName(name) {
  return name?.toLowerCase().replace(/\s+/g, '-') ?? '';
}

export function resolveServiceImage(service) {
  // 1. Dacă există imagine din DB, folosește-o cu prioritate
  const raw = service.image?.trim();
  if (raw) {
    // URL absolut (Cloudinary, orice CDN, sau path local)
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
      return raw;
    }
  }

  // 2. Fallback la imaginea locală pe baza categoriei
  const cat = normalizeCategory(service.category);
  return CATEGORY_IMAGES[cat] || DEFAULT_SERVICE_IMAGE;
}

export function toListingCard(service) {
  const category = normalizeCategory(service.category);
  return {
    id: String(service._id),
    title: service.name,
    desc: service.description,
    duration: service.duration,
    price: service.price,
    image: resolveServiceImage(service),
    category,
  };
}

export function parseServicePrice(priceStr) {
  const n = parseFloat(String(priceStr ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function matchesServiceSearch(service, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const category = normalizeCategory(service.category);
  const categoryLabel = getCategoryDisplayLabel(category).toLowerCase();

  return (
    service.name?.toLowerCase().includes(q) ||
    service.description?.toLowerCase().includes(q) ||
    category.includes(q) ||
    categoryLabel.includes(q)
  );
}

export function matchesPriceRange(service, maxPrice) {
  if (maxPrice >= 200) return true;
  const value = parseServicePrice(service.price);
  if (value === null) return true;
  return value <= maxPrice;
}

function parseDurationMinutes(str) {
  const s = String(str ?? '').toLowerCase();
  const hourMatch = s.match(/(\d+)\s*h/);
  const minMatch = s.match(/(\d+)\s*m(?:in)?/);
  let total = 0;
  if (hourMatch) total += Number.parseInt(hourMatch[1], 10) * 60;
  if (minMatch) total += Number.parseInt(minMatch[1], 10);
  if (!total) {
    const num = Number.parseInt(s.replace(/[^\d]/g, ''), 10);
    if (Number.isFinite(num)) total = num;
  }
  return total || null;
}

export function matchesDurationFilter(service, filter) {
  if (filter === 'all') return true;
  const mins = parseDurationMinutes(service.duration);
  if (mins === null) return true;
  if (filter === 'short') return mins < 60;
  if (filter === 'medium') return mins >= 60 && mins <= 120;
  if (filter === 'long') return mins > 120;
  return true;
}

export function sortServices(services, sortBy) {
  const list = [...services];
  switch (sortBy) {
    case 'price-asc':
      return list.sort((a, b) => (parseServicePrice(a.price) ?? 0) - (parseServicePrice(b.price) ?? 0));
    case 'price-desc':
      return list.sort((a, b) => (parseServicePrice(b.price) ?? 0) - (parseServicePrice(a.price) ?? 0));
    case 'name':
      return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'popular':
    default:
      return list;
  }
}