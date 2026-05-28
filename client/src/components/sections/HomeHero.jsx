import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { fadeUp } from '../common/motionVariants';

const HERO_PORTRAIT_SRC = '/imgHome/girl%20exported.png';
const HERO_PORTRAIT_W = 1536;
const HERO_PORTRAIT_H = 1024;

export default function HomeHero() {
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const portraitMaskId = useId().replace(/:/g, '');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return (
    <motion.section
      className="br-hero br-hero--luxury"
      aria-labelledby="br-hero-title"
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.12 }}
    >
      <div className="br-hero-bg" aria-hidden>
        <div className="br-blob br-blob--a" />
        <div className="br-blob br-blob--b" />
        <div className="br-blob br-blob--c" />
        <div className="br-hero-bg-photo" style={{ backgroundImage: 'url(/imgHome/image.png)' }} />
      </div>

      <span className="br-deco-spark br-deco-spark--tr" aria-hidden>
        <Sparkles size={36} strokeWidth={1.25} />
      </span>
      <span className="br-deco-spark br-deco-spark--bl" aria-hidden>
        <Sparkles size={28} strokeWidth={1.25} />
      </span>

      <div className="br-hero-grid">
        <motion.div
          className="br-hero-copy"
          variants={fadeUp}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <p className="br-badge">
            <Sparkles size={14} strokeWidth={1.5} className="br-badge-icon" aria-hidden />
            <span>Premium beauty experience</span>
          </p>
          <h1 id="br-hero-title" className="br-hero-title">
            <span className="br-hero-line">Bold. Confident.</span>
            <span className="br-hero-line br-hero-line--accent">Beautiful.</span>
          </h1>
          <span className="br-hero-separator" aria-hidden />
          <p className="br-hero-lead">
            Luxury beauty services crafted to bring out your best self.
          </p>
          <div className="br-hero-cta">
            <Link to="/booking" className="br-btn br-btn--solid">
              Book appointment
              <ChevronRight size={18} strokeWidth={2} className="br-btn-icon" aria-hidden />
            </Link>
            <a href="#services" className="br-btn br-btn--outline">
              Explore services
            </a>
          </div>
        </motion.div>

        <motion.div
          className="br-hero-visual"
          variants={fadeUp}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        >
          <motion.div
            className="br-hero-portrait-stack br-hero-portrait-stack--desktop"
            animate={reduceMotion || isMobile ? false : { y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="br-hero-portrait-deco" aria-hidden>
              <span className="br-hero-photo-aura" />
              <span className="br-hero-photo-orbit br-hero-photo-orbit--outer" />
            </div>
            <svg
              className="br-hero-portrait-svg"
              viewBox={`0 0 ${HERO_PORTRAIT_W} ${HERO_PORTRAIT_H}`}
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              role="img"
              aria-label="Beauty Rocks salon style — polished hair and makeup"
            >
              <defs>
                <linearGradient id={`${portraitMaskId}-fade`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="78%" stopColor="#fff" />
                  <stop offset="100%" stopColor="#000" />
                </linearGradient>
                <mask id={`${portraitMaskId}-mask`}>
                  <rect width={HERO_PORTRAIT_W} height={HERO_PORTRAIT_H} fill={`url(#${portraitMaskId}-fade)`} />
                </mask>
              </defs>
              <image
                href={HERO_PORTRAIT_SRC}
                xlinkHref={HERO_PORTRAIT_SRC}
                width={HERO_PORTRAIT_W}
                height={HERO_PORTRAIT_H}
                preserveAspectRatio="xMidYMid meet"
                mask={`url(#${portraitMaskId}-mask)`}
              />
            </svg>
          </motion.div>

          <motion.div
            className="br-hero-photo-frame br-hero-photo-frame--mobile"
            animate={reduceMotion || isMobile ? false : { y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="br-hero-photo-aura" aria-hidden />
            <span className="br-hero-photo-orbit br-hero-photo-orbit--outer" aria-hidden />
            <div className="br-hero-photo-crop">
              <img
                src={HERO_PORTRAIT_SRC}
                alt="Beauty Rocks salon style — polished hair and makeup"
                className="br-hero-photo"
                width={560}
                height={700}
                loading="eager"
                decoding="async"
              />
              <span className="br-hero-photo-shine" aria-hidden />
              <span className="br-hero-photo-vignette" aria-hidden />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="br-hero-scroll-hint" aria-hidden>
        <span className="br-scroll-dot" />
      </div>
    </motion.section>
  );
}
