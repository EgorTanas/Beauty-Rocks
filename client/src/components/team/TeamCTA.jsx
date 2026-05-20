import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { sectionReveal } from '../common/motionVariants';

export default function TeamCTA() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="team-cta"
      aria-labelledby="team-cta-title"
      initial={reduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-12%' }}
      variants={sectionReveal}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="team-cta__glow" aria-hidden />
      <div className="team-container">
        <div className="team-cta__inner">
          <div className="team-cta__copy">
            <p className="br-badge">
              <Sparkles size={14} strokeWidth={1.5} className="br-badge-icon" aria-hidden />
              <span>Your chair awaits</span>
            </p>
            <h2 id="team-cta-title" className="team-cta__title">
              Book with your favorite artist
            </h2>
            <p className="team-cta__lead">
              Choose your service, pick a time, and we will match you with the right specialist.
            </p>
          </div>
          <div className="team-cta__actions">
            <Link to="/booking" className="br-btn br-btn--solid">
              Book appointment
              <ArrowRight size={16} strokeWidth={2} className="br-btn-icon" aria-hidden />
            </Link>
            <Link to="/services" className="br-btn br-btn--outline team-cta__btn-outline">
              View services
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
