import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { SOCIAL_LINKS } from '../../constants/socialLinks';
import { IconFacebook, IconInstagram, IconTikTok } from '../common/SocialIcons';
import { fadeUp } from '../common/motionVariants';

export default function HeroSection() {
  const reduceMotion = useReducedMotion();
  const [pauseHeroMotion, setPauseHeroMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const apply = () => setPauseHeroMotion(mq.matches);
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
        <div className="br-social-rail" aria-label="Social links">
          <a href={SOCIAL_LINKS.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <IconInstagram />
          </a>
          <a href={SOCIAL_LINKS.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
            <IconFacebook />
          </a>
          <a href={SOCIAL_LINKS.tiktok} aria-label="TikTok" target="_blank" rel="noopener noreferrer">
            <IconTikTok />
          </a>
          <span aria-hidden />
        </div>

        <div className="br-hero-grid">
          <motion.div className="br-hero-copy" variants={fadeUp} transition={{ duration: 0.65, ease: 'easeOut' }}>
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
            <div className="br-hero-social-inline" aria-label="Social links">
              <a href={SOCIAL_LINKS.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <IconInstagram size={22} />
              </a>
              <span className="br-hero-social-inline-divider" aria-hidden />
              <a href={SOCIAL_LINKS.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <IconFacebook size={22} />
              </a>
              <span className="br-hero-social-inline-divider" aria-hidden />
              <a href={SOCIAL_LINKS.tiktok} aria-label="TikTok" target="_blank" rel="noopener noreferrer">
                <IconTikTok size={22} />
              </a>
            </div>
          </motion.div>
          <div className="br-hero-mobile-accent" aria-hidden>
            <img
              src="/imgHome/girl%20exported.png"
              alt=""
              className="br-hero-mobile-accent__img"
              width={400}
              height={500}
              loading="eager"
              decoding="async"
            />
          </div>
          <motion.div
            className="br-hero-visual"
            variants={fadeUp}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          >
            <motion.div
              className="br-hero-photo-frame"
              animate={reduceMotion || pauseHeroMotion ? false : { y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="br-hero-ring br-hero-ring--1" aria-hidden />
              <div className="br-hero-ring br-hero-ring--2" aria-hidden />
              <img
                src="/imgHome/girl%20exported.png"
                alt="Beauty Rocks salon style — polished hair and makeup"
                className="br-hero-photo"
                width={560}
                height={700}
                loading="eager"
                decoding="async"
              />
            </motion.div>
          </motion.div>
        </div>
        <div className="br-hero-scroll-hint" aria-hidden>
          <span className="br-scroll-dot" />
        </div>
    </motion.section>
  );
}
