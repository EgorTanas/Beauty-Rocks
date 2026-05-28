import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Users } from 'lucide-react';
import TeamPreviewCard from '../common/TeamPreviewCard';
import { sectionReveal } from '../common/motionVariants';
import { mapApiMember } from '../team/teamUtils';
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/$/, '');

const DEFAULT_COPY = {
  badge: 'The studio',
  title: 'Meet the artists',
  lead: 'Precision hands, editorial eyes, and calm energy — the people who make Beauty Rocks feel like home.',
  linkText: 'Meet the full team',
};

export default function TeamSection() {
  const reduceMotion = useReducedMotion();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const teamRes = await fetch(`${API}/api/team?homepage=true`);
        if (!teamRes.ok) throw new Error('Failed');
        const json = await teamRes.json();
        const list = Array.isArray(json.data) ? json.data.map(mapApiMember) : [];
        if (!cancelled) setMembers(list);
      } catch {
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

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
            <span>{DEFAULT_COPY.badge}</span>
          </p>
          <h2 className="br-section-title">{DEFAULT_COPY.title}</h2>
          <p className="br-team-preview-lead">{DEFAULT_COPY.lead}</p>
        </header>

        {loading ? (
          <div className="br-team-preview-grid" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="br-team-preview-card br-skeleton-box" style={{ minHeight: 280 }} />
            ))}
          </div>
        ) : members.length > 0 ? (
          <div className="br-team-preview-grid">
            {members.map((member, index) => (
              <TeamPreviewCard
                key={member.id || member.name}
                name={member.name}
                role={member.role}
                initials={member.initials}
                image={member.image}
                index={index}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        ) : (
          <p className="br-services-empty" style={{ textAlign: 'center' }}>
            No team members selected for the homepage yet. Choose them in Admin → Team.
          </p>
        )}

        <div className="br-section-cta">
          <Link to="/team" className="br-link-services">
            {DEFAULT_COPY.linkText}
            <ChevronRight size={18} strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
