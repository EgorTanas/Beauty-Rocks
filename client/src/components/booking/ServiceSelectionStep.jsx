import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Heart } from 'lucide-react';
import {
  isFavoriteService,
  subscribeFavorites,
  toggleFavoriteService,
} from '../../utils/favoriteServices';
import {
  BOOKING_CATEGORIES,
  BOOKING_SERVICES,
  groupBookingServicesByCategory,
} from './bookingData';
import { catalogItem, catalogStagger } from '../common/motionVariants';

function ServiceCard({ service, selected, onSelect }) {
  const [saved, setSaved] = useState(() => isFavoriteService(service.id));

  useEffect(() => {
    setSaved(isFavoriteService(service.id));
    return subscribeFavorites(() => setSaved(isFavoriteService(service.id)));
  }, [service.id]);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteService({
      id: service.id,
      title: service.title,
      desc: '',
      duration: service.duration,
      price: service.price,
      image: service.image,
      category: service.categoryId,
    });
  };

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(service);
    }
  };

  return (
    <motion.li variants={catalogItem} role="listitem">
      <div
        className={[
          'booking-service-card',
          selected ? 'booking-service-card--selected' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={() => onSelect(service)}
        onKeyDown={handleCardKeyDown}
      >
        <div className="booking-service-card__media">
          <img src={service.image} alt="" loading="lazy" />
          <button
            type="button"
            className={`booking-service-card__wishlist${saved ? ' booking-service-card__wishlist--active' : ''}`}
            aria-label={saved ? `Remove ${service.title} from favorites` : `Save ${service.title}`}
            aria-pressed={saved}
            onClick={handleFavorite}
          >
            <Heart size={14} strokeWidth={1.75} fill={saved ? 'currentColor' : 'none'} aria-hidden />
          </button>
          {selected ? (
            <span className="booking-service-card__check" aria-hidden>
              <Check size={14} strokeWidth={2.5} />
            </span>
          ) : null}
        </div>
        <div className="booking-service-card__body">
          <span className="booking-service-card__title">{service.title}</span>
          <span className="booking-service-card__meta">
            <span className="booking-service-card__duration">
              <Clock size={14} strokeWidth={1.75} aria-hidden />
              {service.duration}
            </span>
            <span className="booking-service-card__price">{service.price}</span>
          </span>
        </div>
      </div>
    </motion.li>
  );
}

export default function ServiceSelectionStep({
  selectedId,
  onSelect,
  services = BOOKING_SERVICES,
}) {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const groups = groupBookingServicesByCategory(activeCategoryId, services);

  const handleCategoryChange = (categoryId) => {
    setActiveCategoryId(categoryId);
  };

  return (
    <motion.div
      className="booking-step booking-step--services"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="booking-step__head">
        <p className="booking-step__eyebrow">Step 1</p>
        <h2 className="booking-step__title">Select your service</h2>
        <p className="booking-step__lead">
          Browse by category — manicure, pedicure, hair, and studio specials.
        </p>
      </header>

      <div
        className="booking-service-categories"
        role="tablist"
        aria-label="Filter services by category"
      >
        {BOOKING_CATEGORIES.map(({ id, label, Icon }) => {
          const isActive = activeCategoryId === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={[
                'booking-service-categories__pill',
                isActive ? 'booking-service-categories__pill--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleCategoryChange(id)}
            >
              <Icon size={14} strokeWidth={1.75} aria-hidden />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategoryId}
          className="booking-service-sections"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {groups.map(({ categoryId, services }) => (
            <section
              key={categoryId}
              className="booking-service-section"
              aria-labelledby={`booking-cat-${categoryId}`}
            >
              {activeCategoryId === 'all' ? (
                <h3 id={`booking-cat-${categoryId}`} className="booking-service-section__title">
                  {BOOKING_CATEGORIES.find((c) => c.id === categoryId)?.label ??
                    categoryId}
                </h3>
              ) : null}

              <motion.ul
                className="booking-service-grid"
                variants={catalogStagger}
                initial="hidden"
                animate="visible"
                role="list"
              >
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={selectedId === service.id}
                    onSelect={onSelect}
                  />
                ))}
              </motion.ul>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
