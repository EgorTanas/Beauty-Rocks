/** Studio address — shared across home contact, footer, booking */
export const STUDIO_ADDRESS = {
  street: 'Strada Hristo Botev 27',
  name: 'Beauty Rocks Salon',
  mapsQuery: 'Hristo Botev 27, Beauty Rocks salon',
};

export const STUDIO_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STUDIO_ADDRESS.mapsQuery)}`;

export const STUDIO_MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(STUDIO_ADDRESS.mapsQuery)}&output=embed`;
