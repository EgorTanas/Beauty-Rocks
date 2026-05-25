// ─── favoriteServices.js ─────────────────────────────────────────────────────

import { apiFetch as apiFetchBase } from './api';

const GUEST_KEY = 'br_favorite_services_guest';
const CHANGE_EVENT = 'br:favorites-changed';

function getUserId() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id || user?._id || null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!getUserId();
}

// ─── Cache ───────────────────────────────────────────────────────────────────

function cacheKey() {
  const id = getUserId();
  return id ? `br_fav_cache_${id}` : GUEST_KEY;
}

function readCache() {
  try {
    const raw = localStorage.getItem(cacheKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCache(list) {
  localStorage.setItem(cacheKey(), JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/**
 * Șterge cache-ul userului curent la delogare.
 * Apelat automat când se primește evenimentul 'br-auth-change'.
 */
export function clearFavoritesCache() {
  // Șterge toate cheile de cache din localStorage
  const keys = Object.keys(localStorage).filter(
    (k) => k.startsWith('br_fav_cache_') || k === GUEST_KEY
  );
  keys.forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

// Ascultă delogarea și curăță cache-ul automat
window.addEventListener('br-auth-change', () => {
  // Dacă după eveniment nu mai e user logat, curăță cache-ul
  if (!getUserId()) {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('br_fav_cache_'));
    keys.forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
});

// ─── API calls ───────────────────────────────────────────────────────────────

export async function loadFavoritesFromDB() {
  if (!isLoggedIn()) return [];
  try {
    const res = await apiFetchBase('/api/user/favorites');
    if (!res.ok) return readCache();
    const json = await res.json();
    const list = (json.data || []).map(normalizeDBItem);
    writeCache(list);
    return list;
  } catch {
    return readCache();
  }
}

function normalizeDBItem(item) {
  return {
    id: String(item._id || item.id),
    title: item.name || item.title || 'Service',
    desc: item.description || item.desc || '',
    duration: item.duration || '',
    price: item.price != null ? String(item.price) : '',
    image: item.image || '',
    category: item.category || 'other',
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function getFavoriteServices() {
  if (!isLoggedIn()) return [];
  return readCache().filter((item) => item?.id);
}

export function isFavoriteService(id) {
  if (!id || !isLoggedIn()) return false;
  return readCache().some((item) => String(item.id) === String(id));
}

/**
 * Toggle favorite.
 * Dacă userul nu e logat, dispatch event 'br:auth-required' și returnează false.
 */
export async function toggleFavoriteService(service) {
  if (!service?.id) return false;

  if (!isLoggedIn()) {
    window.dispatchEvent(new CustomEvent('br:auth-required', { detail: { action: 'favorite' } }));
    return false;
  }

  const list = readCache();
  const idx = list.findIndex((item) => String(item.id) === String(service.id));
  const isCurrentlyFav = idx >= 0;

  if (isCurrentlyFav) {
    const newList = list.filter((_, i) => i !== idx);
    writeCache(newList);
    try {
      await apiFetchBase(`/api/user/favorites/${service.id}`, { method: 'DELETE' });
    } catch {
      writeCache(list);
      return true;
    }
    return false;
  } else {
    const newItem = {
      id: String(service.id),
      title: service.title || service.name || 'Service',
      desc: service.desc || service.description || '',
      duration: service.duration || '',
      price: service.price != null ? String(service.price) : '',
      image: service.image || '',
      category: service.category || 'other',
    };
    const newList = [newItem, ...list];
    writeCache(newList);
    try {
      const res = await apiFetchBase('/api/user/favorites', {
        method: 'POST',
        body: { serviceId: service.id },
      });
      if (!res.ok && res.status !== 409) {
        writeCache(list);
        return false;
      }
    } catch {
      writeCache(list);
      return false;
    }
    return true;
  }
}

export async function removeFavoriteService(id) {
  if (!isLoggedIn()) return;
  const list = readCache().filter((item) => String(item.id) !== String(id));
  writeCache(list);
  try {
    await apiFetchBase(`/api/user/favorites/${id}`, { method: 'DELETE' });
  } catch {
    // silent fail
  }
}

export function subscribeFavorites(callback) {
  const handler = () => callback(getFavoriteServices());
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('br-auth-change', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('br-auth-change', handler);
  };
}