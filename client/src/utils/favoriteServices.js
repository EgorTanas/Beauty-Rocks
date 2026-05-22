// ─── favoriteServices.js ─────────────────────────────────────────────────────
// Favorites sunt sincronizate cu DB-ul prin API.
// localStorage rămâne doar ca cache local pentru guest sau fallback rapid.

const GUEST_KEY = 'br_favorite_services_guest';
const CHANGE_EVENT = 'br:favorites-changed';

function getToken() {
  // token-ul nu e necesar — autentificarea se face prin cookie (httpOnly)
  return null;
}

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

// ─── Cache local (doar pentru UI reactiv instant) ────────────────────────────

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

// ─── API calls ───────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  return fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
}

/**
 * Încarcă favorites din DB și actualizează cache-ul local.
 * Returnează array-ul de obiecte favorite normalizate.
 */
export async function loadFavoritesFromDB() {
  if (!isLoggedIn()) return readCache();
  try {
    const res = await apiFetch('/api/user/favorites');
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

/** @returns {FavoriteService[]} — din cache (sincron, pentru render instant) */
export function getFavoriteServices() {
  return readCache().filter((item) => item?.id);
}

/** @param {string} id */
export function isFavoriteService(id) {
  if (!id) return false;
  return readCache().some((item) => String(item.id) === String(id));
}

/**
 * Toggle favorite: salvează în DB dacă user-ul e autentificat,
 * altfel doar în localStorage (guest).
 * @param {{ id: string, title?: string, name?: string, desc?: string, description?: string, duration?: string, price?: string, image?: string, category?: string }} service
 * @returns {Promise<boolean>} — true dacă a fost adăugat, false dacă a fost eliminat
 */
export async function toggleFavoriteService(service) {
  if (!service?.id) return false;

  const list = readCache();
  const idx = list.findIndex((item) => String(item.id) === String(service.id));
  const isCurrentlyFav = idx >= 0;

  if (isCurrentlyFav) {
    // ── Remove ──
    const newList = list.filter((_, i) => i !== idx);
    writeCache(newList);

    if (isLoggedIn()) {
      try {
        await apiFetch(`/api/user/favorites/${service.id}`, { method: 'DELETE' });
      } catch {
        // revert cache dacă request-ul a eșuat
        writeCache(list);
        return true;
      }
    }
    return false;
  } else {
    // ── Add ──
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

    if (isLoggedIn()) {
      try {
        const res = await apiFetch('/api/user/favorites', {
          method: 'POST',
          body: JSON.stringify({ serviceId: service.id }),
        });
        if (!res.ok && res.status !== 409) {
          // revert dacă a eșuat (409 = deja exista, e ok)
          writeCache(list);
          return false;
        }
      } catch {
        writeCache(list);
        return false;
      }
    }
    return true;
  }
}

/** @param {string} id */
export async function removeFavoriteService(id) {
  const list = readCache().filter((item) => String(item.id) !== String(id));
  writeCache(list);

  if (isLoggedIn()) {
    try {
      await apiFetch(`/api/user/favorites/${id}`, { method: 'DELETE' });
    } catch {
      // silent fail — cache deja actualizat
    }
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

/**
 * @typedef {{ id: string, title: string, desc?: string, duration?: string, price?: string, image?: string, category?: string }} FavoriteService
 */
