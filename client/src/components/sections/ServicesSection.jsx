import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { sectionReveal } from '../common/motionVariants';
import ServiceListingCard from '../services/ServiceListingCard';
import { toListingCard } from '../services/servicesData';
import '../../style/services.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const HOME_LIMIT = 6;

export default function ServicesSection() {
  const reduceMotion = useReducedMotion();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/services`);
        if (!res.ok) throw new Error('Failed to load services');
        const json = await res.json();
        if (!cancelled) {
          const list = Array.isArray(json?.data) ? json.data : [];
          setServices(list.slice(0, HOME_LIMIT).map(toListingCard));
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
      className="br-section br-section--tight br-section--services-luxury br-section--band-milk"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-12%' }}
      variants={sectionReveal}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="br-container"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-8%' }}
        variants={sectionReveal}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="br-section-head br-section-head--services">
          <p className="br-badge br-badge--center">
            <Sparkles size={14} strokeWidth={1.5} className="br-badge-icon" aria-hidden />
            <span>What we offer</span>
          </p>
          <h2 className="br-section-title">Our services</h2>
          <motion.div
            className="br-section-head-deco"
            aria-hidden
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <span />
            <span className="br-section-head-deco-diamond" />
            <span />
          </motion.div>
        </header>

        {loading && (
          <motion.div
            className="br-services-grid br-services-grid--listing"
            aria-busy="true"
            aria-label="Loading services"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Array.from({ length: HOME_LIMIT }).map((_, i) => (
              <div key={i} className="br-service-card--skeleton services-card services-card--light" aria-hidden>
                <motion.div
                  className="services-card__media-wrap br-skeleton-box"
                  animate={reduceMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
                <motion.div
                  className="services-card__body"
                  animate={reduceMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.1 }}
                >
                  <div className="br-skeleton-line br-skeleton-line--title" />
                  <motion.div className="br-skeleton-line" />
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}

        {!loading && error && (
          <p className="br-services-error">
            Could not load services right now. Please try refreshing the page.
          </p>
        )}

        {!loading && !error && services.length > 0 && (
          <motion.div
            className="br-services-grid br-services-grid--listing"
            initial={reduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-6%' }}
            transition={{ staggerChildren: 0.07, delayChildren: 0.05 }}
          >
            {services.map((service) => (
              <motion.div
                key={service.id}
                className="br-services-grid__item"
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <ServiceListingCard
                  {...service}
                  variant="light"
                  showWishlist={true}
                  showAddButton={true}
                  interactive
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && !error && services.length === 0 && (
          <p className="br-services-empty">No services available yet. Check back soon!</p>
        )}

        <div className="br-section-cta">
          <Link to="/services" className="br-link-services">
            View all services
            <ChevronRight size={18} strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </motion.div>
    </motion.section>
  );
}
