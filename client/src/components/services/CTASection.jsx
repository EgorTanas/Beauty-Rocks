import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { sectionReveal } from '../common/motionVariants';

export default function CTASection() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="services-cta"
      aria-labelledby="services-cta-title"
      initial={reduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-12%' }}
      variants={sectionReveal}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="services-cta__glow" aria-hidden />
      <div className="services-container">
        <div className="services-cta__inner">
          <div className="services-cta__copy">
            <p className="br-badge">
              <Sparkles size={14} strokeWidth={1.5} className="br-badge-icon" aria-hidden />
              <span>Ready to glow?</span>
            </p>
            <h2 id="services-cta-title" className="services-cta__title">
              Book Your Appointment Today
            </h2>
            <p className="services-cta__lead">
              Quick and easy booking. Your beauty, our priority — reserve your visit in minutes.
            </p>
          </div>

          <div className="services-cta__actions">
            <Link to="/booking" className="br-btn br-btn--solid">
              Book appointment
              <ArrowRight size={16} strokeWidth={2} className="br-btn-icon" aria-hidden />
            </Link>
            <p className="services-cta__note">
              <Sparkles size={14} strokeWidth={1.75} aria-hidden />
              Quick &amp; easy booking. Your beauty, our priority.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

