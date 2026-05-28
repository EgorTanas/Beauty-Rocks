import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { fadeUp } from '../common/motionVariants';

export default function ServicesHero() {
  return (
    <motion.section
      className="services-hero services-hero--minimal"
      aria-labelledby="services-hero-title"
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.08 }}
    >
      <div className="services-hero__glow-gold" aria-hidden />

      <div className="services-container services-hero__container services-hero__container--centered">
        <motion.div
          className="services-hero__copy services-hero__copy--centered"
          variants={fadeUp}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <p className="br-badge br-badge--center">
            <Sparkles size={14} strokeWidth={1.5} className="br-badge-icon" aria-hidden />
            <span>Studio Menu</span>
          </p>
          <h1 id="services-hero-title" className="services-hero__title services-hero__title--centered">
            <span>Our Services</span>
          </h1>
          <p className="services-hero__lead services-hero__lead--centered">
            Bespoke manicures, couture hair transformations, and premium beauty rituals.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
