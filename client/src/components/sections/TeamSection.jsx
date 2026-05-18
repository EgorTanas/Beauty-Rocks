import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Users } from 'lucide-react';
import TeamPreviewCard from '../common/TeamPreviewCard';
import { sectionReveal } from '../common/motionVariants';
import { TEAM_PREVIEW } from './homeData';

export default function TeamSection() {
  const reduceMotion = useReducedMotion();
  return (
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
              <TeamPreviewCard key={member.name} {...member} index={index} reduceMotion={reduceMotion} />
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
  );
}
