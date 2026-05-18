import { motion } from 'framer-motion';
import { Award, Heart, Sparkles, Users } from 'lucide-react';
import { sectionReveal } from '../common/motionVariants';

export default function AboutSection() {
  return (
<motion.section
      id="about"
      className="br-section br-section--editorial"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-12%' }}
      variants={sectionReveal}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >

        <div className="br-container br-about">
          <div className="br-about-copy">
            <p className="br-badge">
              <Sparkles size={14} strokeWidth={1.5} className="br-badge-icon" aria-hidden />
              <span>About us</span>
            </p>
            <h2 className="br-section-title br-section-title--left">Where beauty meets passion</h2>
            <div className="br-about-text">
              <p>
                Welcome to Beauty Rocks Salon &amp; Studio — a team of nail artists and stylists who believe
                everyone deserves to feel extraordinary.
              </p>
              <p>
                From meticulous nail art to transformative color, we create looks that feel like you, only more
                polished. Our studio is your slow-down space for self-care and celebration.
              </p>
            </div>
            <div className="br-stats">
              <div className="br-stat">
                <Award size={22} strokeWidth={1.6} className="br-stat-icon" aria-hidden />
                <span className="br-stat-num">8+</span>
                <span className="br-stat-label">Years experience</span>
              </div>
              <div className="br-stat">
                <Users size={22} strokeWidth={1.6} className="br-stat-icon" aria-hidden />
                <span className="br-stat-num">15K+</span>
                <span className="br-stat-label">Happy clients</span>
              </div>
              <div className="br-stat">
                <Sparkles size={22} strokeWidth={1.6} className="br-stat-icon" aria-hidden />
                <span className="br-stat-num">20+</span>
                <span className="br-stat-label">Specialists</span>
              </div>
              <div className="br-stat">
                <Heart size={22} strokeWidth={1.6} className="br-stat-icon" aria-hidden />
                <span className="br-stat-num">100%</span>
                <span className="br-stat-label">Premium care</span>
              </div>
            </div>
          </div>
          <div className="br-about-visual" aria-hidden>
            <div className="br-about-collage">
              <img
                className="br-about-collage__img br-about-collage__img--a"
                src="/imgHome/model.png"
                alt="Beauty Rocks salon model"
                loading="lazy"
                decoding="async"
              />
              <img
                className="br-about-collage__img br-about-collage__img--b"
                src="/imgHome/nail1.jpg"
                alt="Nail art at Beauty Rocks"
                loading="lazy"
                decoding="async"
              />
              <img
                className="br-about-collage__img br-about-collage__img--c"
                src="/imgHome/nail2.jpeg"
                alt="Manicure detail at Beauty Rocks"
                loading="lazy"
                decoding="async"
              />
              <div className="br-about-collage__glow" />
            </div>
          </div>
        </div>
    </motion.section>
  );
}
