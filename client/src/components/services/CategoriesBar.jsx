import { CATEGORY_FILTERS } from './servicesData';

export default function CategoriesBar({
  activeCategoryId = 'all',
  onCategoryChange,
  searchQuery = '',
  onSearchChange,
}) {
  return (
    <section className="services-categories" aria-label="Service categories">
      <div className="services-container services-categories__inner">
        <div className="services-categories__pills" role="tablist" aria-label="Filter by category">
          {CATEGORY_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              className={`services-pill${activeCategoryId === id ? ' services-pill--active' : ''}`}
              aria-selected={activeCategoryId === id}
              onClick={() => onCategoryChange?.(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="services-categories__tools">
          <input
            type="search"
            className="services-search"
            placeholder="Search nails, hair, bridal..."
            aria-label="Search services"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          <select className="services-sort" aria-label="Sort services" defaultValue="">
            <option value="" disabled>
              Sort by
            </option>
            <option value="popular">Most popular</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>
    </section>
  );
}
