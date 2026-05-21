import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Camera } from 'lucide-react';
import UserAvatar from '../UserAvatar';
import { getUserDisplayName } from '../../utils/userDisplay';
import { fadeUp } from '../common/motionVariants';

function formatMemberShort(createdAt) {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const heroEase = [0.22, 1, 0.36, 1];

const heroStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const statPop = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: heroEase },
  },
};

export default function ProfileHero({
  user,
  stats,
  loyaltyLabel,
  onAvatarChange,
  avatarUploading,
}) {
  const reduceMotion = useReducedMotion();
  const name = getUserDisplayName(user);
  const fileInputRef = useRef(null);

  const statItems = [
    { n: stats.visits, l: 'Visits' },
    { n: stats.spentLabel, l: 'Spent', accent: true },
    { n: stats.upcoming, l: 'Next' },
    { n: stats.saved, l: 'Saved' },
  ];

  const motionProps = reduceMotion
    ? {}
    : {
        initial: 'hidden',
        animate: 'visible',
        variants: heroStagger,
      };

  return (
    <motion.header className="pf-hero" aria-label="Profile overview" {...motionProps}>
      <motion.div className="pf-hero__row" variants={reduceMotion ? undefined : fadeUp}>
        <motion.button
          type="button"
          className={`pf-hero__avatar${avatarUploading ? ' pf-hero__avatar--busy' : ''}`}
          onClick={() => !avatarUploading && fileInputRef.current?.click()}
          aria-label="Change profile photo"
          variants={reduceMotion ? undefined : fadeUp}
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.25 }}
        >
          <UserAvatar user={user} className="pf-hero__avatar-img" />
          <span className="pf-hero__camera">
            <Camera size={12} aria-hidden />
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onAvatarChange) onAvatarChange(file);
              e.target.value = '';
            }}
          />
        </motion.button>

        <motion.div className="pf-hero__info" variants={reduceMotion ? undefined : fadeUp}>
          <h1 className="pf-hero__name">{name}</h1>
          <p className="pf-hero__meta">
            <span className="pf-hero__badge">{loyaltyLabel}</span>
            <span className="pf-hero__date">{formatMemberShort(user?.createdAt)}</span>
          </p>
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : fadeUp}>
          <Link to="/booking" className="pf-hero__book" aria-label="Book appointment">
            Book
            <ArrowUpRight size={15} strokeWidth={2} aria-hidden />
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="pf-hero__stats"
        role="list"
        variants={reduceMotion ? undefined : heroStagger}
      >
        {statItems.map(({ n, l, accent }) => (
          <motion.div
            key={l}
            className="pf-hero__stat"
            role="listitem"
            variants={reduceMotion ? undefined : statPop}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <span className={`pf-hero__stat-n${accent ? ' pf-hero__stat-n--accent' : ''}`}>{n}</span>
            <span className="pf-hero__stat-l">{l}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.header>
  );
}
