const LEGACY_KEY = 'br_favorite_services';
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

function storageKey() {
  const id = getUserId();
  return id ? `br_favorite_services_${id}` : GUEST_KEY;
}

function readRaw() {
  const key = storageKey();
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy && key !== GUEST_KEY) {
      const parsed = JSON.parse(legacy);
      const list = Array.isArray(parsed) ? parsed : [];
      if (list.length) {
        localStorage.setItem(key, JSON.stringify(list));
        return list;
      }
    }
    return [];
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(storageKey(), JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** @typedef {{ id: string, title: string, desc?: string, duration?: string, price?: string, image?: string, category?: string }} FavoriteService */

/** @returns {FavoriteService[]} */
export function getFavoriteServices() {
  return readRaw().filter((item) => item?.id);
}

/** @param {string} id */
export function isFavoriteService(id) {
  if (!id) return false;
  return readRaw().some((item) => String(item.id) === String(id));
}

/** @param {FavoriteService} service */
export function toggleFavoriteService(service) {
  if (!service?.id) return false;
  const list = readRaw();
  const idx = list.findIndex((item) => String(item.id) === String(service.id));
  if (idx >= 0) {
    list.splice(idx, 1);
    write(list);
    return false;
  }
  list.unshift({
    id: String(service.id),
    title: service.title || service.name || 'Service',
    desc: service.desc || service.description || '',
    duration: service.duration || '',
    price: service.price || '',
    image: service.image || '',
    category: service.category || 'other',
  });
  write(list);
  return true;
}

/** @param {string} id */
export function removeFavoriteService(id) {
  const list = readRaw().filter((item) => String(item.id) !== String(id));
  write(list);
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
