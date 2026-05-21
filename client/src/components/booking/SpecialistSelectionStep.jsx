import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import {
  filterSpecialistsForService,
  getSpecialistDisplayTags,
} from './bookingData';
import { catalogItem, catalogStagger } from '../common/motionVariants';

const listFade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export default function SpecialistSelectionStep({
  service,
  selectedId,
  onSelect,
}) {
  const specialists = useMemo(
    () => filterSpecialistsForService(service),
    [service],
  );

  const filterKey = service?.id ?? 'none';

  if (!service) {
    return (
      <motion.div
        className="booking-step booking-step--specialists"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="booking-specialist-hint">Select a service first to see available specialists.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="booking-step booking-step--specialists"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="booking-step__head">
        <p className="booking-step__eyebrow">Step 2</p>
        <h2 className="booking-step__title">Choose your specialist</h2>
        <p className="booking-step__lead">
          Artists shown match your selected service — pick who you would like for this visit.
        </p>
      </header>

      <p className="booking-specialist-hint">Available specialists for this service</p>

      <AnimatePresence mode="wait">
        <motion.div key={filterKey} {...listFade}>
          {specialists.length === 0 ? (
            <p className="booking-specialist-empty">
              No specialists are listed for this service in the demo catalog. Go back and choose another
              treatment.
            </p>
          ) : (
            <motion.ul
              className="booking-specialist-grid"
              variants={catalogStagger}
              initial="hidden"
              animate="visible"
              role="list"
            >
              {specialists.map((person) => {
                const selected = selectedId === person.id;
                const tags = getSpecialistDisplayTags(person);
                return (
                  <motion.li key={person.id} variants={catalogItem} role="listitem">
                    <button
                      type="button"
                      className={[
                        'booking-specialist-card',
                        selected ? 'booking-specialist-card--selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => onSelect(person)}
                      aria-pressed={selected}
                    >
                      <span className="booking-specialist-card__photo">
                        <img src={person.image} alt="" loading="lazy" />
                      </span>
                      <span className="booking-specialist-card__content">
                        <span className="booking-specialist-card__name">{person.name}</span>
                        <span className="booking-specialist-card__role">{person.role}</span>
                        <span className="booking-specialist-card__bio">{person.bio}</span>
                        <span className="booking-specialist-card__tags">
                          {tags.map((tag) => (
                            <span key={tag} className="booking-tag">
                              {tag}
                            </span>
                          ))}
                        </span>
                      </span>
                      {selected ? (
                        <span className="booking-specialist-card__check" aria-hidden>
                          <Check size={14} strokeWidth={2.5} />
                        </span>
                      ) : null}
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
