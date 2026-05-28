import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { catalogFade, catalogItem, catalogSlide, catalogStagger } from '../common/motionVariants';
import ServiceListingCard from './ServiceListingCard';
import {
  CATEGORY_META,
  matchesDurationFilter,
  matchesPriceRange,
  matchesServiceSearch,
  normalizeCategory,
  sortServices,
  toListingCard,
} from '@/data/servicesData';
import { API_BASE } from '@/lib/api';

const PAGE_SIZE = 8;

function groupByCategory(services) {
  const map = {};
  services.forEach((s) => {
    const cat = normalizeCategory(s.category);
    if (!map[cat]) {
      map[cat] = {
        id: cat,
        label: CATEGORY_META[cat]?.label ?? cat,
        lead: CATEGORY_META[cat]?.lead ?? '',
        services: [],
      };
    }
    map[cat].services.push(toListingCard(s));
  });
  const ORDER = ['manicure', 'pedicure', 'hair-women', 'hair-men', 'other'];
  return ORDER.map((k) => map[k]).filter(Boolean);
}

export default function ServicesGrid({
  activeCategoryId = 'all',
  searchQuery = '',
  categoryDirection = 1,
  sortBy = 'popular',
  durationFilter = 'all',
  priceMax = 200,
  onResultCount,
}) {
  const reduceMotion = useReducedMotion();
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/services`);
        if (!res.ok) throw new Error('Failed to load services');
        const json = await res.json();
        if (!cancelled) {
          setAllServices(Array.isArray(json?.data) ? json.data : []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return allServices.filter((s) => {
      const cat = normalizeCategory(s.category);
      const matchCat = activeCategoryId === 'all' || cat === activeCategoryId;
      return (
        matchCat &&
        matchesServiceSearch(s, searchQuery) &&
        matchesPriceRange(s, priceMax) &&
        matchesDurationFilter(s, durationFilter)
      );
    });
  }, [allServices, activeCategoryId, searchQuery, sortBy, durationFilter, priceMax]);

  const sorted = useMemo(
    () => sortServices(filtered, sortBy).map(toListingCard),
    [filtered, sortBy],
  );

  const categories = useMemo(() => groupByCategory(filtered), [filtered]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategoryId, searchQuery, sortBy, durationFilter, priceMax]);

  useEffect(() => {
    if (!loading && !error) {
      onResultCount?.(sorted.length);
    }
  }, [sorted.length, loading, error, onResultCount]);

  const filterKey = `${activeCategoryId}-${searchQuery.trim().toLowerCase()}-${sortBy}-${durationFilter}-${priceMax}`;

  const flatForDisplay = useMemo(() => {
    if (activeCategoryId !== 'all') return sorted;
    return categories.flatMap((c) => c.services);
  }, [activeCategoryId, sorted, categories]);

  const visibleServices = flatForDisplay.slice(0, visibleCount);
  const hasMore = visibleCount < flatForDisplay.length;

  if (loading) {
    return (
      <section id="services-catalog" className="services-catalog">
        <div className="services-container">
          <div className="services-loading" aria-live="polite">
            <span className="services-loading__spinner" aria-hidden />
            <p>Loading services…</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services-catalog" className="services-catalog">
        <div className="services-container">
          <p className="services-empty">
            Could not load services right now. Please refresh the page.
          </p>
        </div>
      </section>
    );
  }

  const sectionTitle =
    activeCategoryId === 'all'
      ? 'Explore All Services'
      : (CATEGORY_META[activeCategoryId]?.label ?? 'Services');

  return (
    <motion.section
      id="services-catalog"
      className="services-catalog"
      aria-labelledby="services-catalog-title"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="services-container">
        <header className="services-catalog__head">
          <h2 id="services-catalog-title" className="services-catalog__title">
            {sectionTitle}
          </h2>
          {activeCategoryId !== 'all' ? (
            <p className="services-catalog__lead">{CATEGORY_META[activeCategoryId]?.lead}</p>
          ) : null}
        </header>

        <AnimatePresence mode="wait">
          {sorted.length === 0 ? (
            <motion.p
              key="empty"
              className="services-empty"
              variants={catalogFade}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              No services match your filters. Try adjusting search or price range.
            </motion.p>
          ) : activeCategoryId === 'all' ? (
            <motion.div
              key={filterKey}
              custom={categoryDirection}
              variants={reduceMotion ? catalogFade : catalogSlide}
              initial={reduceMotion ? 'hidden' : 'enter'}
              animate={reduceMotion ? 'visible' : 'center'}
              exit={reduceMotion ? 'hidden' : 'exit'}
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  id={`category-${category.id}`}
                  className="services-category-block"
                >
                  <header className="services-category-head">
                    <h3 className="services-category-title">{category.label}</h3>
                    <p className="services-category-lead">{category.lead}</p>
                  </header>
                  <ul className="services-grid services-grid--catalog">
                    {category.services.map((service) => (
                      <li key={service.id} className="services-grid__item">
                        <ServiceListingCard
                          {...service}
                          variant="light"
                          showAddButton
                          showWishlist={true}
                          showCategoryTag={false}
                          interactive
                          highlightQuery={searchQuery}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={filterKey}
              custom={categoryDirection}
              variants={reduceMotion ? catalogFade : catalogSlide}
              initial={reduceMotion ? 'hidden' : 'enter'}
              animate={reduceMotion ? 'visible' : 'center'}
              exit={reduceMotion ? 'hidden' : 'exit'}
            >
              <ul className="services-grid services-grid--catalog">
                {visibleServices.map((service) => (
                  <motion.li key={service.id} variants={catalogItem} className="services-grid__item">
                    <ServiceListingCard
                      {...service}
                      variant="light"
                      showAddButton
                      showWishlist={true}
                      showCategoryTag={false}
                      interactive
                      highlightQuery={searchQuery}
                    />
                  </motion.li>
                ))}
              </ul>
              {hasMore ? (
                <div className="services-catalog__more-wrap">
                  <button
                    type="button"
                    className="br-btn services-btn--load-more"
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  >
                    Load more services
                    <ChevronDown size={16} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
