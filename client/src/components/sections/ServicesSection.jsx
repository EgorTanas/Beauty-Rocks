import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import ServiceCard from '../common/ServiceCard';
import { sectionReveal } from '../common/motionVariants';
import { SERVICES } from './homeData';

export default function ServicesSection() {
  const reduceMotion = useReducedMotion();
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
          <div className="br-services-grid">
            {SERVICES.map((service, index) => (
              <ServiceCard key={service.title} {...service} index={index} reduceMotion={reduceMotion} />
            ))}
          </div>
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
