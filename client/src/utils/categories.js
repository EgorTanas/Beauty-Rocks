/** Client-side category helpers (mirrors server slugs) */

export const BUILTIN_CATEGORY_META = {
  manicure: { label: 'Manicure' },
  pedicure: { label: 'Pedicure' },
  'hair-women': { label: "Women's haircut" },
  'hair-men': { label: "Men's haircut" },
  beard: { label: 'Beard & grooming' },
  other: { label: 'Other' },
};

const LEGACY_CATEGORY_MAP = {
  nails: 'manicure',
  hair: 'hair-women',
  skincare: 'other',
  bridal: 'other',
};

export function slugifyCategory(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function normalizeCategory(category) {
  const slug = slugifyCategory(category);
  if (!slug) return 'other';
  if (BUILTIN_CATEGORY_META[slug]) return slug;
  if (LEGACY_CATEGORY_MAP[slug]) return LEGACY_CATEGORY_MAP[slug];
  return slug;
}

let dynamicLabels = {};

export function setDynamicCategoryLabels(labels = {}) {
  dynamicLabels = { ...labels };
}

export function getCategoryLabel(categoryId) {
  const id = normalizeCategory(categoryId);
  return (
    dynamicLabels[id] ||
    BUILTIN_CATEGORY_META[id]?.label ||
    id.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  );
}

export function buildCategoryOptions(apiCategories = []) {
  const map = new Map();
  for (const [id, meta] of Object.entries(BUILTIN_CATEGORY_META)) {
    map.set(id, { id, label: meta.label });
  }
  for (const item of apiCategories) {
    if (item?.id) map.set(item.id, { id: item.id, label: item.label || getCategoryLabel(item.id) });
  }
  return [...map.values()];
}
