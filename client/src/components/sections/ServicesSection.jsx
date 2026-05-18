import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Clock, Sparkles, Tag } from 'lucide-react';
import { sectionReveal } from '../common/motionVariants';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CATEGORY_ICON = {
  nails:    '',
  hair:     '',
  skincare: '',
  bridal:   '',
  other:    '',
};
const HOME_LIMIT = 6;
export default function ServicesSection() {
  const reduceMotion = useReducedMotion();
  const [services, setServices]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState(null);
  useEffect(() => {
    let cancelled = false;
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/services`);
        if (!res.ok) throw new Error('Failed to load services');
        const json = await res.json();
        if (!cancelled) {
          setServices(json.data.slice(0, HOME_LIMIT));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchServices();
    return () => { cancelled = true; };
  }, []);
  return (
    <motion.section
      id="services"
      className="br-section br-section--tight br-section--services-luxury"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-12%' }}
      variants={sectionReveal}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="br-container">
        <header className="br-section-head br-section-head--services">
          <p className="br-badge br-badge--center">
            <Sparkles size={14} strokeWidth={1.5} className="br-badge-icon" aria-hidden />
            <span>What we offer</span>
          </p>
          <h2 className="br-section-title">Our services</h2>
          <div className="br-section-head-deco" aria-hidden>
            <span />
            <span className="br-section-head-deco-diamond" />
            <span />
          </div>
        </header>
        {}
        {loading && (
          <div className="br-services-grid">
            {Array.from({ length: HOME_LIMIT }).map((_, i) => (
              <div key={i} className="br-service-card br-service-card--skeleton" aria-hidden>
                <div className="br-service-card__icon-wrap br-skeleton-box" />
                <div className="br-skeleton-line br-skeleton-line--title" />
                <div className="br-skeleton-line" />
                <div className="br-skeleton-line br-skeleton-line--short" />
              </div>
            ))}
          </div>
        )}
        {}
        {!loading && error && (
          <p className="br-services-error">
            Could not load services right now. Please try refreshing the page.
          </p>
        )}
        {}
        {!loading && !error && services.length > 0 && (
          <div className="br-services-grid">
            {services.map((service, index) => (
              <motion.article
                key={service._id}
                className="br-service-card"
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                {}
                <div className="br-service-card__icon-wrap" aria-hidden>
                  <span className="br-service-card__emoji">
                    {CATEGORY_ICON[service.category] ?? '🌸'}
                  </span>
                </div>
                <div className="br-service-card__body">
                  <span className={`br-service-card__badge br-service-card__badge--${service.category}`}>
                    {service.category}
                  </span>
                  <h3 className="br-service-card__title">{service.name}</h3>
                  {service.description && (
                    <p className="br-service-card__desc">{service.description}</p>
                  )}
                  <div className="br-service-card__meta">
                    <span className="br-service-card__meta-item">
                      <Tag size={13} strokeWidth={1.75} aria-hidden />
                      {service.price}
                    </span>
                    <span className="br-service-card__meta-item">
                      <Clock size={13} strokeWidth={1.75} aria-hidden />
                      {service.duration}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
        {}
        {!loading && !error && services.length === 0 && (
          <p className="br-services-empty">No services available yet. Check back soon!</p>
        )}
        <div className="br-section-cta">
          <Link to="/services" className="br-link-services">
            View all services
            <ChevronRight size={18} strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}