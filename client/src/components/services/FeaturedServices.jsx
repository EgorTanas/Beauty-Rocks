import ServiceListingCard from './ServiceListingCard';
import { getFeaturedServices } from './servicesData';

export default function FeaturedServices() {
  const featured = getFeaturedServices();

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
            <ServiceListingCard key={service.id} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
