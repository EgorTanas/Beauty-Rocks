import { motion } from 'framer-motion';
import { CalendarHeart } from 'lucide-react';
import { fadeUp } from '../common/motionVariants';

export default function BookingHero() {
  return (
    <motion.section
      className="booking-hero"
      aria-labelledby="booking-hero-title"
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.08 }}
    >
      <div className="booking-hero__glow" aria-hidden />
      <div className="booking-hero__glow booking-hero__glow--secondary" aria-hidden />

      <div className="booking-container booking-hero__inner">
        <motion.div className="booking-hero__copy" variants={fadeUp} transition={{ duration: 0.65, ease: 'easeOut' }}>
          <p className="booking-hero__eyebrow br-badge br-badge--center">
            <CalendarHeart size={14} strokeWidth={1.5} className="br-badge-icon" aria-hidden />
            <span>Reserve Your Visit</span>
          </p>
          <h1 id="booking-hero-title" className="booking-hero__title">
            Book Your Experience
          </h1>
          <p className="booking-hero__lead booking-hero__lead--desktop">
            Curate your appointment in four refined steps — choose your ritual, your artist, and the moment that suits you.
          </p>
          <p className="booking-hero__lead booking-hero__lead--mobile">
            Choose your service in four simple steps.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
