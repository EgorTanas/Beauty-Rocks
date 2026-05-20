import { useId, useRef, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, SlidersHorizontal } from 'lucide-react';
import { CATEGORY_FILTERS } from './servicesData';

export default function CategoriesBar({
  activeCategoryId = 'all',
  onCategoryChange,
  searchQuery = '',
  onSearchChange,
  resultCount = null,
  sortBy = 'popular',
  onSortChange,
  durationFilter = 'all',
  onDurationChange,
  priceMax = 200,
  onPriceMaxChange,
}) {
  const reduceMotion = useReducedMotion();
  const searchId = useId();
  const searchRef = useRef(null);
  const hasQuery = searchQuery.trim().length > 0;
  const activeLabel = CATEGORY_FILTERS.find((c) => c.id === activeCategoryId)?.label ?? 'All Services';

  // Toggle state for secondary filters
  const [showFilters, setShowFilters] = useState(false);

  const handleClearSearch = () => {
    onSearchChange?.('');
    searchRef.current?.focus();
  };

  return (
    <div className="services-filter" aria-label="Service filters">
      <div className="services-filter__top-bar">
        <div
          className={`services-filter__search${hasQuery ? ' services-filter__search--filled' : ''}`}
        >
          <Search className="services-filter__search-icon" size={18} strokeWidth={1.75} aria-hidden />
          <input
            ref={searchRef}
            id={searchId}
            type="search"
            className="services-filter__search-input"
            placeholder="Search for a service..."
            aria-label="Search services"
            aria-describedby={resultCount !== null ? `${searchId}-status` : undefined}
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            autoComplete="off"
          />
          {hasQuery ? (
            <button
              type="button"
              className="services-filter__search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={14} strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className={`services-filter__toggle-btn${showFilters ? ' services-filter__toggle-btn--active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={15} aria-hidden />
          <span>Filters</span>
        </button>
      </div>

      <div className="services-filter__categories" role="tablist" aria-label="Filter by category">
        {CATEGORY_FILTERS.map(({ id, label, Icon }) => {
          const isActive = activeCategoryId === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              className={`services-filter__cat${isActive ? ' services-filter__cat--active' : ''}`}
              aria-selected={isActive}
              onClick={() => onCategoryChange?.(id)}
            >
              {isActive && !reduceMotion ? (
                <motion.span
                  layoutId="services-cat-indicator"
                  className="services-filter__cat-indicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  aria-hidden
                />
              ) : isActive ? (
                <span className="services-filter__cat-indicator" aria-hidden />
              ) : null}
              <Icon size={16} strokeWidth={1.75} aria-hidden />
              <span className="services-filter__cat-label">{label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            className="services-filter__controls"
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <label className="services-filter__field">
              <span className="services-filter__field-label">Sort by</span>
              <select
                className="services-filter__select"
                aria-label="Sort services"
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value)}
              >
                <option value="popular">Popular</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>

            <label className="services-filter__field">
              <span className="services-filter__field-label">Duration</span>
              <select
                className="services-filter__select"
                aria-label="Filter by duration"
                value={durationFilter}
                onChange={(e) => onDurationChange?.(e.target.value)}
              >
                <option value="all">All durations</option>
                <option value="short">Under 1 hour</option>
                <option value="medium">1–2 hours</option>
                <option value="long">Over 2 hours</option>
              </select>
            </label>

            <div className="services-filter__price">
              <div className="services-filter__price-head">
                <span className="services-filter__field-label">Price range</span>
                <span className="services-filter__price-value">
                  $0 – {priceMax >= 200 ? '$200+' : `$${priceMax}`}
                </span>
              </div>
              <input
                type="range"
                className="services-filter__range"
                min={0}
                max={200}
                step={5}
                value={priceMax}
                onChange={(e) => onPriceMaxChange?.(Number(e.target.value))}
                aria-label="Maximum price"
                aria-valuemin={0}
                aria-valuemax={200}
                aria-valuenow={priceMax}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="services-filter__foot">
        <p
          id={`${searchId}-status`}
          className="services-filter__status"
          aria-live="polite"
          aria-atomic="true"
        >
          {resultCount !== null ? (
            <>
              <span className="services-filter__status-count">{resultCount}</span>
              {resultCount === 1 ? ' service' : ' services'} available
              {hasQuery || activeCategoryId !== 'all' ? (
                <span className="services-filter__status-context">
                  {hasQuery && activeCategoryId !== 'all'
                    ? ` · “${searchQuery.trim()}” in ${activeLabel}`
                    : hasQuery
                      ? ` · “${searchQuery.trim()}”`
                      : ` · ${activeLabel}`}
                </span>
              ) : null}
            </>
          ) : (
            <span>Browse by category, duration, or price</span>
          )}
        </p>
      </footer>
    </div>
  );
}
