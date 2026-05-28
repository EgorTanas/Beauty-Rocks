import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { buildBookingServiceFromCard, setBookingPrefill } from '../../utils/bookingPrefill';
import {
  CATEGORY_META,
  resolveServiceImage,
} from '@/data/servicesData';
import { catalogItem, catalogStagger } from '../common/motionVariants';

export default function ProfileSavedSection({ favorites, onRemove }) {
  const reduceMotion = useReducedMotion();

  const sectionMotion = reduceMotion
    ? {}
    : {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, amount: 0.12 },
        variants: catalogStagger,
      };

  return (
    <motion.section className="pf-saved" aria-labelledby="pf-saved-title" {...sectionMotion}>
      <motion.article
        className="pf-panel pf-panel--saved"
        variants={reduceMotion ? undefined : catalogItem}
      >
        <h2 id="pf-saved-title" className="pf-panel__label">
          Saved services
        </h2>

        {favorites.length === 0 ? (
          <p className="pf-panel__text">Heart services on the menu to save them here.</p>
        ) : (
          <motion.ul
            className="pf-saved__list"
            variants={reduceMotion ? undefined : catalogStagger}
            initial={reduceMotion ? false : 'hidden'}
            animate={reduceMotion ? false : 'visible'}
          >
            {favorites.map((item) => {
              const categoryLabel =
                CATEGORY_META[item.category]?.label || item.category || 'Service';
              const thumb = resolveServiceImage({
                name: item.title,
                image: item.image,
                category: item.category,
              });

              return (
                <motion.li key={item.id} variants={reduceMotion ? undefined : catalogItem}>
                  <motion.div
                    className="pf-saved-item"
                    whileHover={reduceMotion ? undefined : { x: 4 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className="pf-saved-item__thumb">
                      <img
                        src={thumb}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = resolveServiceImage({
                            name: item.title,
                            category: item.category,
                          });
                        }}
                      />
                    </div>
                    <div className="pf-saved-item__body">
                      <span className="pf-saved-item__cat">{categoryLabel}</span>
                      <span className="pf-saved-item__title">{item.title}</span>
                      {(item.duration || item.price) && (
                        <span className="pf-saved-item__meta">
                          {[item.duration, item.price].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                    <div className="pf-saved-item__acts">
                      <Link
                        to="/booking"
                        className="pf-btn pf-btn--outline pf-btn--sm"
                        onClick={() => {
                          const payload = buildBookingServiceFromCard({
                            id: item.id,
                            title: item.title,
                            desc: item.desc,
                            duration: item.duration,
                            price: item.price,
                            image: item.image,
                            category: item.category,
                          });
                          if (payload) setBookingPrefill(payload);
                        }}
                      >
                        Book
                      </Link>
                      <button
                        type="button"
                        className="pf-saved-item__remove"
                        onClick={() => onRemove(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}

        <Link to="/services" className="pf-panel__link pf-panel__link--block">
          Browse all services
          <ArrowUpRight size={14} aria-hidden />
        </Link>
      </motion.article>
    </motion.section>
  );
}
