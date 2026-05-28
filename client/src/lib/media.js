import { API_BASE } from './api';

/**
 * Resolves a stored upload path to a full URL (avatars, service images, etc.).
 * Accepts absolute URLs, root-relative paths, or bare filenames.
 */
export function resolveUploadUrl(path, { folder = 'avatars' } = {}) {
  if (typeof path !== 'string' || !path.trim()) return null;
  const url = path.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return `${API_BASE}/uploads/${folder}/${url}`;
}

/** @deprecated Use resolveUploadUrl — kept for call-site clarity. */
export function resolveAvatarUrl(avatar) {
  return resolveUploadUrl(avatar, { folder: 'avatars' });
}
