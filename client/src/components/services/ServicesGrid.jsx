import ServiceListingCard from './ServiceListingCard';
import { getVisibleCategories } from './servicesData';

export default function ServicesGrid({ activeCategoryId = 'all', searchQuery = '' }) {
  const categories = getVisibleCategories(activeCategoryId, searchQuery);

  return (
    <section id="services-catalog" className="services-grid-section" aria-labelledby="services-grid-title">
      <div className="services-container">
        <header className="services-section-head">
          <p className="services-eyebrow">Service menu</p>
          <h2 id="services-grid-title" className="services-section-title">
            {activeCategoryId === 'all' ? 'Explore All Services' : categories[0]?.label ?? 'Services'}
          </h2>
          {activeCategoryId === 'all' ? (
            <p className="services-section-lead">
              Browse by category — manicure, pedicure, hair, and curated packages.
            </p>
          ) : (
            <p className="services-section-lead">{categories[0]?.lead}</p>
          )}
        </header>

        {categories.length === 0 ? (
          <p className="services-empty">No services match your search. Try another term or category.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              id={`category-${category.id}`}
              className="services-category-block"
              aria-labelledby={`category-title-${category.id}`}
            >
              {activeCategoryId === 'all' ? (
                <header className="services-category-head">
                  <h3 id={`category-title-${category.id}`} className="services-category-title">
                    {category.label}
                  </h3>
                  <p className="services-category-lead">{category.lead}</p>
                </header>
              ) : null}
              <div className="services-card-grid services-card-grid--4">
                {category.services.map((service) => (
                  <ServiceListingCard key={service.id} {...service} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
