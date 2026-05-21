const BADGE_MAP = {
  nails: 'nails',
  hair: 'hair',
  'hair-women': 'hair',
  'hair-men': 'hair',
  manicure: 'nails',
  pedicure: 'nails',
  skincare: 'skincare',
  bridal: 'bridal',
};

export function categoryBadgeClass(category) {
  const key = String(category || '').toLowerCase().trim();
  return `adm-badge adm-badge--${BADGE_MAP[key] || 'other'}`;
}

export function formatCategoryLabel(category) {
  const key = String(category || '').trim();
  if (!key) return 'Other';
  return key
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatAdminPrice(price) {
  const p = String(price ?? '').trim();
  if (!p) return '—';
  if (p.startsWith('$')) return p;
  if (/^\d+(\.\d+)?$/.test(p)) return `$${p}`;
  return p;
}

export function formatAdminDuration(duration) {
  const d = String(duration ?? '').trim();
  if (!d) return '—';
  if (/min/i.test(d)) return d;
  if (/^\d+$/.test(d)) return `${d} min`;
  return d;
}

export function formatServiceMeta(price, duration) {
  return `${formatAdminPrice(price)} · ${formatAdminDuration(duration)}`;
}
