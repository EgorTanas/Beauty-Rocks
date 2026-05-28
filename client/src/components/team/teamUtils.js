import { TEAM_PAGE_FALLBACK } from './teamData';
import { resolveAvatarUrl } from '@/lib/media';

export function getMemberInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function resolveTeamAvatar(avatar) {
  return resolveAvatarUrl(avatar);
}

export function mapApiMember(member) {
  return {
    id: member._id,
    name: member.name,
    role: member.role,
    bio: member.bio || '',
    image: resolveTeamAvatar(member.avatar),
    initials: getMemberInitials(member.name),
    specialties: Array.isArray(member.specialties) ? member.specialties.filter(Boolean) : [],
  };
}

export function mapPreviewMember(member, index) {
  return {
    id: `preview-${index}`,
    name: member.name,
    role: member.role,
    bio: member.bio || '',
    image: member.image || null,
    initials: member.initials || getMemberInitials(member.name),
    specialties: Array.isArray(member.specialties) ? member.specialties : [],
  };
}

export const FALLBACK_TEAM = TEAM_PAGE_FALLBACK.map(mapPreviewMember);
