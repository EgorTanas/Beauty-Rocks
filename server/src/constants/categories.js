/** Built-in salon service categories (slug → label) */
const BUILTIN_CATEGORIES = {
  manicure: 'Manicure',
  pedicure: 'Pedicure',
  'hair-women': "Women's haircut",
  'hair-men': "Men's haircut",
  beard: 'Beard & grooming',
  other: 'Other',
};

const LEGACY_CATEGORY_MAP = {
  nails: 'manicure',
  hair: 'hair-women',
  skincare: 'other',
  bridal: 'other',
};

function slugifyCategory(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function normalizeCategory(category) {
  const slug = slugifyCategory(category);
  if (!slug) return 'other';
  if (BUILTIN_CATEGORIES[slug]) return slug;
  if (LEGACY_CATEGORY_MAP[slug]) return LEGACY_CATEGORY_MAP[slug];
  return slug;
}

function getCategoryLabel(slug, customLabels = {}) {
  const key = normalizeCategory(slug);
  return customLabels[key] || BUILTIN_CATEGORIES[key] || key.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function mergeCategoryList(customSlugs = [], customLabels = {}) {
  const slugs = new Set([...Object.keys(BUILTIN_CATEGORIES), ...customSlugs.map(normalizeCategory)]);
  return [...slugs].map((id) => ({ id, label: getCategoryLabel(id, customLabels) }));
}

module.exports = {
  BUILTIN_CATEGORIES,
  LEGACY_CATEGORY_MAP,
  slugifyCategory,
  normalizeCategory,
  getCategoryLabel,
  mergeCategoryList,
};
