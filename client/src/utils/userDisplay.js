const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/** Display name for header / profile (username from API or legacy name field). */
export function getUserDisplayName(user) {
  if (!user) return 'Account';
  const name = user.username || user.name;
  if (typeof name === 'string' && name.trim()) return name.trim();
  return 'Account';
}

/** Initials for avatar fallback (max 2 chars). */
export function getUserInitials(user) {
  const name = getUserDisplayName(user);
  if (name === 'Account') return '?';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/** Resolves avatar URL for img src (absolute or API-backed uploads path). */
export function getUserAvatarUrl(user) {
  const raw = user?.avatar;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const url = raw.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE.replace(/\/$/, '')}${url}`;
  return `${API_BASE.replace(/\/$/, '')}/uploads/avatars/${url}`;
}
