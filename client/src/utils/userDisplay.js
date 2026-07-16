import { resolveAvatarUrl } from '@/lib/media';

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
  if (name === 'Account') return 'BR';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/** Resolves avatar URL for img src (absolute or API-backed uploads path). */
export function getUserAvatarUrl(user) {
  return resolveAvatarUrl(user?.avatar);
}
