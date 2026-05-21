import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';
import {
  BOOKING_CATEGORIES,
  groupBookingServicesByCategory,
} from './bookingData';
import { catalogItem, catalogStagger } from '../common/motionVariants';

function ServiceCard({ service, selected, onSelect }) {
  const isSelected = selected;
  return (
    <motion.li variants={catalogItem} role="listitem">
      <button
        type="button"
        className={[
          'booking-service-card',
          isSelected ? 'booking-service-card--selected' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onSelect(service)}
        aria-pressed={isSelected}
      >
        <span className="booking-service-card__media">
          <img src={service.image} alt="" loading="lazy" />
        </span>
        <span className="booking-service-card__body">
          <span className="booking-service-card__title">{service.title}</span>
          <span className="booking-service-card__meta">
            <span className="booking-service-card__duration">
              <Clock size={14} strokeWidth={1.75} aria-hidden />
              {service.duration}
            </span>
            <span className="booking-service-card__price">{service.price}</span>
          </span>
        </span>
        {isSelected ? (
          <span className="booking-service-card__check" aria-hidden>
            <Sparkles size={16} strokeWidth={1.75} />
          </span>
        ) : null}
      </button>
    </motion.li>
  );
}

export default function ServiceSelectionStep({ selectedId, onSelect }) {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const groups = groupBookingServicesByCategory(activeCategoryId);

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
