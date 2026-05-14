import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Award,
  ChevronRight,
  Heart,
  MapPin,
  Palette,
  Scissors,
  Sparkles,
  Users,
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import '../style/Home.css';

const SERVICES = [
  {
    title: 'Gel manicure',
    desc: 'Chip-resistant shine and refined finish — weeks of wear.',
    price: 'From $45',
    Icon: Sparkles,
  },
  {
    title: 'Acrylic nails',
    desc: 'Extensions shaped to you — coffin, almond, or stiletto.',
    price: 'From $65',
    Icon: Palette,
  },
  {
    title: 'Hair styling',
    desc: 'Cuts, blowouts, and polished looks for any occasion.',
    price: 'From $55',
    Icon: Scissors,
  },
  {
    title: 'Balayage & color',
    desc: 'Dimension and tone tailored to your skin and style.',
    price: 'From $120',
    Icon: Sparkles,
  },
  {
    title: 'Pedicure spa',
    desc: 'Soak, exfoliation, massage, and flawless polish.',
    price: 'From $50',
    Icon: Heart,
  },
  {
    title: 'Bridal package',
    desc: 'Hair, nails, and touch-ups for you and your party.',
    price: 'From $250',
    Icon: Award,
  },
];

const GALLERY = [
  { label: 'Signature glow', tag: 'Makeup', image: '/imgHome/girl.png', position: '50% 38%' },
  { label: 'Violet color story', tag: 'Hair color', image: '/imgHome/image.png', position: '48% 36%' },
  { label: 'Studio rituals', tag: 'Salon', image: '/img/instruments-cropped.png', position: '50% 45%' },
  { label: 'Precision finish', tag: 'Nails', image: '/imgHome/girl%20exported.png', position: '55% 35%' },
  { label: 'Editorial polish', tag: 'Creative', image: '/img/image-1.png', position: '50% 42%' },
  { label: 'After-dark styling', tag: 'Styling', image: '/imgHome/image.png', position: '52% 48%' },
];

const TEAM_PREVIEW = [
  { name: 'Maya Chen', role: 'Lead colorist', initials: 'MC' },
  { name: 'Jordan Lee', role: 'Nail director', initials: 'JL' },
  { name: 'Sofia Reyes', role: 'Bridal specialist', initials: 'SR' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const sectionReveal = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
};

function IconInstagram({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconTikTok({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M14 3v11.2a4.2 4.2 0 1 1-4.2-4.2" />
      <path d="M14 5.5c1.5 2.3 3.1 3.4 5 3.5" />
    </svg>
  );
}

export default function Home() {
  const { hash } = useLocation();
  const reduceMotion = useReducedMotion();
  const [pauseHeroMotion, setPauseHeroMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const apply = () => setPauseHeroMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hash]);

  return (
    <div className="br-page">
      <SiteHeader />

      <main>
        <motion.section
          className="br-hero"
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
            <a href="https://instagram.com" aria-label="Instagram">
              <IconInstagram />
            </a>
            <a href="https://facebook.com" aria-label="Facebook">
              <IconFacebook />
            </a>
            <a href="https://tiktok.com" aria-label="TikTok">
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
                <a href="https://instagram.com" aria-label="Instagram">
                  <IconInstagram size={22} />
                </a>
                <span className="br-hero-social-inline-divider" aria-hidden />
                <a href="https://facebook.com" aria-label="Facebook">
                  <IconFacebook size={22} />
                </a>
                <span className="br-hero-social-inline-divider" aria-hidden />
                <a href="https://tiktok.com" aria-label="TikTok">
                  <IconTikTok size={22} />
                </a>
              </div>
            </motion.div>
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
              {SERVICES.map(({ title, desc, price, Icon }, index) => (
                <motion.article
                  key={title}
                  className="br-card br-card--luxury"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  whileHover={reduceMotion ? undefined : { y: -8, transition: { duration: 0.22 } }}
                >
                  <div className="br-card-top">
                    <span className="br-card-icon" aria-hidden>
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <h3 className="br-card-title">{title}</h3>
                  </div>
                  <p className="br-card-desc">{desc}</p>
                  <p className="br-card-price">{price}</p>
                </motion.article>
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
                  src="/imgHome/girl.png"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <img
                  className="br-about-collage__img br-about-collage__img--b"
                  src="/imgHome/image.png"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <img
                  className="br-about-collage__img br-about-collage__img--c"
                  src="/img/image-1.png"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <div className="br-about-collage__glow" />
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="team"
          className="br-section br-section--team-preview"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-12%' }}
          variants={sectionReveal}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="br-container">
            <header className="br-section-head br-section-head--team">
              <p className="br-badge br-badge--center">
                <Users size={14} strokeWidth={1.6} className="br-badge-icon" aria-hidden />
                <span>The studio</span>
              </p>
              <h2 className="br-section-title">Meet the artists</h2>
              <p className="br-team-preview-lead">
                Precision hands, editorial eyes, and calm energy — the people who make Beauty Rocks feel like home.
              </p>
            </header>
            <div className="br-team-preview-grid">
              {TEAM_PREVIEW.map((member, index) => (
                <motion.article
                  key={member.name}
                  className="br-team-preview-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  whileHover={reduceMotion ? undefined : { y: -6, transition: { duration: 0.22 } }}
                >
                  <span className="br-team-preview-avatar" aria-hidden>
                    {member.initials}
                  </span>
                  <h3 className="br-team-preview-name">{member.name}</h3>
                  <p className="br-team-preview-role">{member.role}</p>
                </motion.article>
              ))}
            </div>
            <div className="br-section-cta">
              <Link to="/team" className="br-link-services">
                Meet the full team
                <ChevronRight size={18} strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>
        </motion.section>

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
                <motion.figure
                  key={item.label}
                  className="br-gallery-cell"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={reduceMotion ? undefined : { scale: 1.015 }}
                >
                  <img
                    className="br-gallery-img"
                    src={item.image}
                    alt={`${item.label} at Beauty Rocks`}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: item.position }}
                    whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <figcaption className="br-gallery-cap">
                    <span className="br-gallery-tag">{item.tag}</span>
                    <span className="br-gallery-title">{item.label}</span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
            <div className="br-section-cta">
              <button type="button" className="br-btn br-btn--outline-dark">
                View full gallery
              </button>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="contact"
          className="br-section br-section--contact br-section--contact-luxury"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-12%' }}
          variants={sectionReveal}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="br-container">
            <div className="br-contact-luxury">
              <div className="br-contact-luxury-main">
                <p className="br-badge br-badge--contact">
                  <MapPin size={14} strokeWidth={1.6} className="br-badge-icon" aria-hidden />
                  <span>Visit the studio</span>
                </p>
                <p className="br-contact-eyebrow">Get in touch</p>
                <h2 className="br-contact-display">
                  Los Angeles,
                  <br />
                  reimagined.
                </h2>
                <p className="br-contact-slogan">
                  A quiet suite for nails, hair, and color — book online and we&apos;ll shape the visit around you.
                </p>
                <Link to="/booking" className="br-btn br-btn--solid br-btn--start-appt">
                  Start your appointment
                  <ChevronRight size={20} strokeWidth={2} className="br-btn-icon" aria-hidden />
                </Link>
              </div>
              <aside className="br-contact-luxury-aside" aria-label="Studio details">
                <div className="br-contact-meta">
                  <h3 className="br-contact-meta-title">Location</h3>
                  <p className="br-contact-meta-text">456 Beauty Lane</p>
                  <p className="br-contact-meta-text">Los Angeles, CA 90001</p>
                </div>
                <div className="br-contact-meta">
                  <h3 className="br-contact-meta-title">Hours</h3>
                  <p className="br-contact-meta-text">Mon – Sat · 10am – 8pm</p>
                  <p className="br-contact-meta-text">Sunday · 11am – 6pm</p>
                </div>
                <div className="br-contact-meta">
                  <h3 className="br-contact-meta-title">Reach us</h3>
                  <p className="br-contact-meta-text">
                    <a href="tel:+13235556245">+1 (323) 555-6245</a>
                  </p>
                  <p className="br-contact-meta-text">
                    <a href="mailto:hello@beautyrocks.studio">hello@beautyrocks.studio</a>
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </motion.section>

      </main>

      <SiteFooter />
    </div>
  );
}
