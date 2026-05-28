import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Users } from 'lucide-react';
import { fadeUp } from '../common/motionVariants';
import { TEAM_PREVIEW } from '@/data/homeData';

const HERO_STATS = [
  { value: '8+', label: 'Years craft' },
  { value: '15K', label: 'Happy clients' },
  { value: '12', label: 'Specialists' },
];

export default function TeamHero() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="team-hero"
      aria-labelledby="team-hero-title"
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.1 }}
    >
      <div className="team-hero__bg" aria-hidden>
        <div className="team-hero__blob team-hero__blob--a" />
        <div className="team-hero__blob team-hero__blob--b" />
        <span className="team-hero__ring team-hero__ring--1" />
        <span className="team-hero__ring team-hero__ring--2" />
      </div>

      <span className="team-hero__spark team-hero__spark--tr" aria-hidden>
        <Sparkles size={32} strokeWidth={1.25} />
      </span>

      <div className="team-container team-hero__grid">
        <motion.div
          className="team-hero__copy"
          variants={fadeUp}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <p className="br-badge">
            <Users size={14} strokeWidth={1.6} className="br-badge-icon" aria-hidden />
            <span>The studio</span>
          </p>
          <h1 id="team-hero-title" className="team-hero__title">
            <span className="team-hero__line">Meet the</span>
            <span className="team-hero__line team-hero__line--accent">artists</span>
          </h1>
          <span className="team-hero__separator" aria-hidden />
          <p className="team-hero__lead">
            Precision hands, editorial eyes, and calm energy — the people who make Beauty Rocks feel like home.
          </p>
          <ul className="team-hero__stats">
            {HERO_STATS.map((stat, i) => (
              <motion.li
                key={stat.label}
                className="team-hero__stat"
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              >
                <span className="team-hero__stat-value">{stat.value}</span>
                <span className="team-hero__stat-label">{stat.label}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="team-hero__visual"
          variants={fadeUp}
          transition={{ duration: 0.75, ease: 'easeOut', delay: 0.12 }}
        >
          <div className="team-hero__collage" aria-hidden>
            <span className="team-hero__collage-glow" />
            <motion.figure
              className="team-hero__frame team-hero__frame--back"
              animate={reduceMotion ? false : { y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src={TEAM_PREVIEW[1]?.image} alt="" width={280} height={350} loading="eager" />
            </motion.figure>
            <motion.figure
              className="team-hero__frame team-hero__frame--mid"
              animate={reduceMotion ? false : { y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            >
              <img src={TEAM_PREVIEW[2]?.image} alt="" width={280} height={350} loading="eager" />
            </motion.figure>
            <motion.figure
              className="team-hero__frame team-hero__frame--front"
              animate={reduceMotion ? false : { y: [0, -12, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            >
              <img
                src={TEAM_PREVIEW[0]?.image}
                alt="Beauty Rocks team — lead stylist"
                width={320}
                height={400}
                loading="eager"
              />
            </motion.figure>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
