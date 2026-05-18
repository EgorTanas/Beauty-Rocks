import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import GalleryCard from '../common/GalleryCard';
import ReusableButton from '../common/ReusableButton';
import { sectionReveal } from '../common/motionVariants';
import { GALLERY } from './homeData';

export default function GallerySection() {
  const reduceMotion = useReducedMotion();
  return (
<motion.section
      id="gallery"
      className="br-section br-section--gallery-cinematic"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={sectionReveal}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >

        <div className="br-container">
          <header className="br-section-head">
            <p className="br-badge br-badge--center">
              <Sparkles size={14} strokeWidth={1.5} className="br-badge-icon" aria-hidden />
              <span>Our work</span>
            </p>
            <h2 className="br-section-title">Beauty gallery</h2>
          </header>
          <div className="br-gallery br-gallery--masonry">
            {GALLERY.map((item, index) => (
              <GalleryCard key={item.label} {...item} index={index} reduceMotion={reduceMotion} />
            ))}
          </div>
          <div className="br-section-cta">
            <ReusableButton type="button" variant="outline-dark">
              View full gallery
            </ReusableButton>
          </div>
        </div>
    </motion.section>
  );
}
