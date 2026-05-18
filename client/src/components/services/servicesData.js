const nailImages = ['/imgHome/nail1.jpg', '/imgHome/nails3.jpeg', '/imgHome/nail2.jpeg'];
const hairImages = ['/imgHome/hair.png', '/imgHome/hair2.png', '/imgHome/model.png'];

function nailImg(index = 0) {
  return nailImages[index % nailImages.length];
}

function hairImg(index = 0) {
  return hairImages[index % hairImages.length];
}

export const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Services' },
  { id: 'manicure', label: 'Manicure' },
  { id: 'pedicure', label: 'Pedicure' },
  { id: 'hair', label: 'Hair' },
  { id: 'packages', label: 'Packages' },
];

export const SERVICE_MENU = [
  {
    id: 'manicure',
    label: 'Manicure',
    lead: 'Classic care, gel, Russian technique, extensions, and custom nail art.',
    services: [
      {
        id: 'classic-manicure',
        title: 'Classic Manicure',
        desc: 'Shape, cuticle care, and polished finish — clean, refined everyday nails.',
        duration: '45 min',
        price: 'From $35',
        image: nailImg(0),
        variant: 'light',
      },
      {
        id: 'gel-polish-manicure',
        title: 'Gel Polish Manicure',
        desc: 'Chip-resistant gel color with a glossy, lasting finish.',
        duration: '60 min',
        price: 'From $45',
        image: nailImg(1),
        variant: 'light',
      },
      {
        id: 'russian-manicure',
        title: 'Russian Manicure',
        desc: 'Precision e-file cuticle work for an ultra-clean, long-lasting base.',
        duration: '75 min',
        price: 'From $55',
        image: nailImg(2),
        variant: 'light',
      },
      {
        id: 'biab-nails',
        title: 'BIAB Nails',
        desc: 'Builder gel overlay for strength, flexibility, and natural-looking length.',
        duration: '75 min',
        price: 'From $60',
        image: nailImg(0),
        variant: 'light',
      },
      {
        id: 'nail-extensions',
        title: 'Nail Extensions',
        desc: 'Length and shape built to suit you — almond, coffin, or stiletto.',
        duration: '90 min',
        price: 'From $65',
        image: nailImg(1),
        variant: 'light',
      },
      {
        id: 'nail-maintenance',
        title: 'Nail Maintenance',
        desc: 'Refills, reshaping, and refresh for existing gel or extensions.',
        duration: '45 min',
        price: 'From $40',
        image: nailImg(2),
        variant: 'light',
      },
      {
        id: 'luxury-manicure',
        title: 'Luxury Manicure',
        desc: 'Extended care ritual with massage, mask, and premium polish.',
        duration: '75 min',
        price: 'From $65',
        image: nailImg(0),
        variant: 'light',
      },
      {
        id: 'french-design',
        title: 'French Design',
        desc: 'Timeless French tips — hand-painted or gel for a crisp, elegant line.',
        duration: '60 min',
        price: 'From $50',
        image: nailImg(1),
        variant: 'light',
      },
      {
        id: 'nail-art',
        title: 'Nail Art',
        desc: 'Custom designs, accents, and detail — from minimal to statement.',
        duration: '60 min',
        price: 'From $55',
        image: nailImg(2),
        variant: 'light',
      },
    ],
  },
  {
    id: 'pedicure',
    label: 'Pedicure',
    lead: 'Spa pedicures and gel finishes for rested, polished feet.',
    services: [
      {
        id: 'pedicure-spa',
        title: 'Pedicure Spa',
        desc: 'Soak, exfoliation, massage, and flawless polish — complete foot renewal.',
        duration: '60 min',
        price: 'From $50',
        image: nailImg(2),
        variant: 'light',
      },
      {
        id: 'gel-pedicure',
        title: 'Gel Pedicure',
        desc: 'Long-wear gel color with shaping and cuticle care for sandal-ready feet.',
        duration: '60 min',
        price: 'From $55',
        image: nailImg(0),
        variant: 'light',
      },
    ],
  },
  {
    id: 'hair',
    label: 'Hair',
    lead: 'Cuts, color, styling, keratin, and grooming — salon and event ready.',
    services: [
      {
        id: 'haircut',
        title: 'Haircut',
        desc: 'Consultation, precision cut, and finish tailored to your face and lifestyle.',
        duration: '45 min',
        price: 'From $45',
        image: hairImg(0),
        variant: 'light',
      },
      {
        id: 'blowout',
        title: 'Blowout',
        desc: 'Wash, blow-dry, and polished volume — red-carpet smooth or soft movement.',
        duration: '45 min',
        price: 'From $50',
        image: hairImg(1),
        variant: 'light',
      },
      {
        id: 'hair-coloring',
        title: 'Hair Coloring',
        desc: 'Full color, gloss, and tone correction with premium color lines.',
        duration: '120 min',
        price: 'From $120',
        image: hairImg(2),
        variant: 'light',
      },
      {
        id: 'balayage',
        title: 'Balayage',
        desc: 'Hand-painted dimension and seamless grow-out for sun-kissed depth.',
        duration: '150 min',
        price: 'From $150',
        image: hairImg(2),
        variant: 'dark',
      },
      {
        id: 'keratin-treatment',
        title: 'Keratin Treatment',
        desc: 'Smoothing treatment for frizz control, shine, and manageable daily styling.',
        duration: '120 min',
        price: 'From $140',
        image: hairImg(0),
        variant: 'light',
      },
      {
        id: 'bridal-hairstyle',
        title: 'Bridal Hairstyle',
        desc: 'Trial and wedding-day styling — elegant updos and soft romantic looks.',
        duration: '90 min',
        price: 'From $150',
        image: hairImg(1),
        variant: 'dark',
      },
      {
        id: 'beard-trim',
        title: 'Beard Trim',
        desc: 'Shaped beard, clean lines, and finishing balm — sharp, groomed detail.',
        duration: '30 min',
        price: 'From $28',
        image: hairImg(0),
        variant: 'light',
      },
      {
        id: 'hair-styling',
        title: 'Hair Styling',
        desc: 'Event-ready styling — waves, sleek pins, or textured looks that last.',
        duration: '60 min',
        price: 'From $55',
        image: hairImg(1),
        variant: 'light',
      },
    ],
  },
  {
    id: 'packages',
    label: 'Packages',
    lead: 'Curated combinations for bridal parties and full beauty days.',
    services: [
      {
        id: 'bridal-package',
        title: 'Bridal Package',
        desc: 'Hair, nails, and touch-ups for the bride — trials and wedding-day coordination.',
        duration: '240 min',
        price: 'From $350',
        image: '/imgHome/model.png',
        variant: 'dark',
      },
      {
        id: 'full-beauty-package',
        title: 'Full Beauty Package',
        desc: 'Manicure, pedicure, hair styling, and finish — one visit, head-to-toe polish.',
        duration: '180 min',
        price: 'From $280',
        image: '/imgHome/salonimage.jpeg',
        variant: 'dark',
      },
      {
        id: 'nails-hair-package',
        title: 'Nails + Hair Package',
        desc: 'Gel manicure and blowout or styling — the essentials for any occasion.',
        duration: '150 min',
        price: 'From $220',
        image: '/imgHome/salon2.jpg',
        variant: 'dark',
      },
    ],
  },
];

export const FEATURED_SERVICE_IDS = [
  'classic-manicure',
  'gel-polish-manicure',
  'balayage',
  'bridal-package',
];

export function getAllServices() {
  return SERVICE_MENU.flatMap((category) =>
    category.services.map((service) => ({ ...service, categoryId: category.id, categoryLabel: category.label })),
  );
}

export function getFeaturedServices() {
  const all = getAllServices();
  return FEATURED_SERVICE_IDS.map((id) => all.find((s) => s.id === id)).filter(Boolean);
}

export function getVisibleCategories(activeCategoryId, searchQuery = '') {
  const query = searchQuery.trim().toLowerCase();
  let categories =
    activeCategoryId === 'all'
      ? SERVICE_MENU
      : SERVICE_MENU.filter((category) => category.id === activeCategoryId);

  if (!query) return categories;

  return categories
    .map((category) => ({
      ...category,
      services: category.services.filter(
        (service) =>
          service.title.toLowerCase().includes(query) || service.desc.toLowerCase().includes(query),
      ),
    }))
    .filter((category) => category.services.length > 0);
}
