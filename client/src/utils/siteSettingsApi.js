import { apiFetch, parseJson } from './api';
import { setDynamicCategoryLabels } from './categories';

let cached = null;

export async function fetchSiteSettings({ force = false } = {}) {
  if (cached && !force) return cached;
  const res = await apiFetch('/api/site-settings');
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json.message || 'Failed to load settings');
  cached = json.data;
  if (cached?.categoryLabels) setDynamicCategoryLabels(cached.categoryLabels);
  return cached;
}

export async function updateSiteSettings(payload) {
  const res = await apiFetch('/api/admin/site-settings', {
    method: 'PUT',
    body: payload,
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json.message || 'Failed to save settings');
  cached = json.data;
  if (cached?.categoryLabels) setDynamicCategoryLabels(cached.categoryLabels);
  return cached;
}

export function clearSiteSettingsCache() {
  cached = null;
}
