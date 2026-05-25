import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Users } from 'lucide-react';
import TeamMemberCard from './TeamMemberCard';
import { FALLBACK_TEAM, mapApiMember } from './teamUtils';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/$/, '');

export default function TeamGrid() {
  const reduceMotion = useReducedMotion();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API}/api/team`);
        if (!res.ok) throw new Error('Failed to load team');
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data.map(mapApiMember) : [];
        if (!cancelled) {
          if (list.length > 0) {
            setMembers(list);
            setUsedFallback(false);
          } else {
            setMembers(FALLBACK_TEAM);
            setUsedFallback(true);
          }
        }
      } catch {
        if (!cancelled) {
          setMembers(FALLBACK_TEAM);
          setUsedFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const skeletonCount = 6;

  return (
    <section className="team-grid-section" aria-label="Team members">
      <div className="team-container">
        <header className="team-grid__head">
          <h2 className="team-grid__title">Our artists</h2>
          <p className="team-grid__subtitle">
            Stylists, nail artists, and specialists ready for your next visit.
          </p>
        </header>

        {loading ? (
          <div className="team-grid team-grid--loading" aria-busy="true" aria-label="Loading team">
            {Array.from({ length: skeletonCount }, (_, i) => (
              <div key={i} className="team-card team-card--skeleton" aria-hidden />
            ))}
          </div>
        ) : (
          <>
            {usedFallback ? (
              <p className="team-grid__note">
                <Users size={14} strokeWidth={1.6} aria-hidden />
                Showing studio highlights — full profiles sync when the server is connected.
              </p>
            ) : null}
            <motion.div
              className={`team-grid team-grid--n-${Math.min(members.length, 6)}`}
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.06 }}
            >
              {members.map((member, index) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  reduceMotion={reduceMotion}
                />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
