import { normalizeCategory } from '../components/services/servicesData';

const STORAGE_KEY = 'br_booking_prefill';

export function normalizeBookingService(input) {
  if (!input) return null;
  const id = String(input.id || input._id || '');
  if (!id) return null;

  const price = input.price || '';
  const parsed = Number.parseFloat(String(price).replace(/[^\d.]/g, ''));
  const priceValue =
    input.priceValue ?? (Number.isFinite(parsed) ? parsed : undefined);

  return {
    id,
    title: input.title || input.name || 'Service',
    duration: input.duration || '',
    price,
    priceValue: Number.isFinite(priceValue) ? priceValue : undefined,
    image: input.image || '',
    categoryId: normalizeCategory(input.categoryId || input.category),
  };
}

export function setBookingPrefill(service) {
  const normalized = normalizeBookingService(service);
  if (!normalized) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    /* ignore */
  }
}

export function consumeBookingPrefill() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeBookingService(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function buildBookingServiceFromCard(card) {
  return normalizeBookingService({
    id: card.id,
    title: card.title,
    duration: card.duration,
    price: card.price,
    image: card.image,
    categoryId: card.category,
  });
}
