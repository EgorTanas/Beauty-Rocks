import { useEffect, useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import ServicesCarousel from './ServicesCarousel';
import ServiceListingCard from './ServiceListingCard';
import { toListingCard } from './servicesData';
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/$/, '');

const DEFAULT_COPY = {
  badge: 'Featured services',
  title: 'Our Most Loved',
  linkText: 'View all services',
};

/** Featured row — services pinned in admin + editable section copy */
export default function FeaturedServices({ searchQuery = '' }) {
  const [featured, setFeatured] = useState([]);
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API}/api/services?featured=true`);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json?.data)) {
          setFeatured(json.data.map(toListingCard));
        }
      } catch {
        /* hide on failure */
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  if (featured.length === 0) return null;

  return (
    <div className="services-featured-block" aria-labelledby="services-featured-title">
      <header className="services-featured__head">
        <div className="services-featured__intro">
          <p className="br-badge">
            <Sparkles size={14} strokeWidth={1.5} className="br-badge-icon" aria-hidden />
            <span>{DEFAULT_COPY.badge}</span>
          </p>
          <h2 id="services-featured-title" className="services-featured__title">
            {DEFAULT_COPY.title}
          </h2>
        </div>
        <a href="#services-catalog" className="services-featured__link">
          {DEFAULT_COPY.linkText}
          <ChevronRight size={15} strokeWidth={2.5} aria-hidden />
        </a>
      </header>

      <ServicesCarousel
        className="services-featured__carousel"
        services={featured}
        dotsLabel="Featured services"
        renderCard={(service) => (
          <ServiceListingCard
            {...service}
            variant="dark"
            showWishlist={true}
            showAddButton={true}
            showCategoryTag={false}
            interactive
            highlightQuery={searchQuery}
          />
        )}
      />
    </div>
  );
}

