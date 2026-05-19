import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import ServicesCarousel from './ServicesCarousel';
import ServiceListingCard from './ServiceListingCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FEATURED_COUNT = 4;

const FEATURED_IMAGE_OVERRIDES = {
  balayage: '/imgHome/hair2.png',
  'bridal-package': '/imgHome/salon2.jpg',
};

function toFeaturedCard(service) {
  const slug = service.name?.toLowerCase().replace(/\s+/g, '-');
  return {
    id: service._id,
    title: service.name,
    desc: service.description,
    duration: service.duration,
    price: service.price,
    image: FEATURED_IMAGE_OVERRIDES[slug] ?? service.image ?? '',
  };
}

export default function FeaturedServices() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/api/services`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setFeatured(json.data.slice(0, FEATURED_COUNT).map(toFeaturedCard));
        }
      })
      .catch(console.error);

    return () => { cancelled = true; };
  }, []);

  if (featured.length === 0) return null;

  return (
    <section className="services-featured" aria-labelledby="services-featured-title">
      <div className="services-container">
        <header className="services-section-head services-section-head--row services-featured__head">
          <div className="services-featured__intro">
            <p className="services-eyebrow services-featured__eyebrow">Featured services</p>
            <h2 id="services-featured-title" className="services-section-title services-featured__title">
              Our Most Loved
            </h2>
            <p className="services-featured__lead services-featured__lead--desktop">
              Signature treatments our clients book again and again — refined technique, lasting results.
            </p>
          </div>
          <a href="#services-catalog" className="services-link services-featured__link">
            View all services
            <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
          </a>
        </header>

        <ServicesCarousel
          className="services-featured__carousel"
          services={featured}
          dotsLabel="Featured services"
          renderCard={(service) => (
            <ServiceListingCard {...service} variant="light" showWishlist />
          )}
        />
      </div>
    </section>
  );
}