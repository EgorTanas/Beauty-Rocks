import { useEffect, useState } from 'react';
import ServiceListingCard from './ServiceListingCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FEATURED_COUNT = 4;

export default function FeaturedServices() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/api/services`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          // Primele FEATURED_COUNT servicii active, sortate deja după `order` de server
          setFeatured(json.data.slice(0, FEATURED_COUNT));
        }
      })
      .catch(console.error);

    return () => { cancelled = true; };
  }, []);

  // Nu afișa secțiunea dacă nu sunt servicii
  if (featured.length === 0) return null;

  return (
    <section className="services-featured" aria-labelledby="services-featured-title">
      <div className="services-container">
        <header className="services-section-head services-section-head--row">
          <div>
            <p className="services-eyebrow">Featured services</p>
            <h2 id="services-featured-title" className="services-section-title">
              Our Most Loved
            </h2>
          </div>
          <a href="#services-catalog" className="services-link">
            View full menu
          </a>
        </header>

        <div className="services-card-grid services-card-grid--4">
          {featured.map((service) => (
            <ServiceListingCard
              key={service._id}
              id={service._id}
              title={service.name}
              desc={service.description}
              duration={service.duration}
              price={service.price}
              image={service.image || ''}
              variant="light"
            />
          ))}
        </div>
      </div>
    </section>
  );
}