const BRAND = {
  name: 'Beauty Rocks Salon & Studio',
  shortName: 'Beauty Rocks',
  logoUrl:
    process.env.BRAND_LOGO_URL?.trim() ||
    `${process.env.CLIENT_URL || 'http://localhost:5173'}/img/logoL.png`,
  address: 'Strada Hristo Botev 27, Beauty Rocks Salon',
  phone: '+1 (323) 555-6245',
  email: 'hello@beautyrocks.studio',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hristo%20Botev%2027%2C%20Beauty%20Rocks%20salon',
  websiteUrl: process.env.CLIENT_URL?.trim() || 'http://localhost:5173',
  instagramUrl:
    'https://www.instagram.com/beauty_rocks_salon?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
  facebookUrl: 'https://www.facebook.com/p/Beauty-Rocks-Salon-61563559533562/',
  tiktokUrl: 'https://www.tiktok.com/@beauty.rocks.salon?is_from_webapp=1&sender_device=pc',
  timezone: process.env.BUSINESS_TIMEZONE?.trim() || 'Europe/Chisinau',
};

module.exports = { BRAND };
