import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import ProfileStatusBadge from './ProfileStatusBadge';
import { formatHeroDate } from '../../utils/profileDashboardUtils';
function formatMemberSince(createdAt) {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const stackStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
};

const panelReveal = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function ProfileDashboard({
  user,
  loyalty,
  nextAppointment,
  bookingsLoading,
  onCancel,
  onEdit,
}) {
  const reduceMotion = useReducedMotion();
  const roleLabel = user?.role === 'admin' ? 'Administrator' : 'Client';
  const progress = Math.min(100, Math.max(0, loyalty?.progress ?? 0));
  const nextTier = loyalty?.nextTier || 'Silver';

  const motionSection = reduceMotion
    ? {}
    : {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, amount: 0.15 },
        variants: stackStagger,
      };

  const panelMotion = reduceMotion ? {} : { variants: panelReveal };

  return (
    <motion.section className="pf-stack" aria-label="Profile dashboard" {...motionSection}>
      {bookingsLoading ? (
        <motion.article className="pf-panel pf-panel--featured" {...panelMotion}>
          <h2 className="pf-panel__label">Next appointment</h2>
          <p className="pf-panel__text">Loading appointments…</p>
        </motion.article>
      ) : nextAppointment ? (
        <motion.article className="pf-panel pf-panel--featured" {...panelMotion}>
          <div className="pf-panel__head">
            <h2 className="pf-panel__label">Next appointment</h2>
            <time className="pf-panel__date" dateTime={nextAppointment.date}>
              {formatHeroDate(nextAppointment.date)}
            </time>
          </div>
          <h3 className="pf-panel__title">{nextAppointment.serviceName}</h3>
          <p className="pf-panel__text">
            with {nextAppointment.specialistName}
            {nextAppointment.specialistRole ? ` · ${nextAppointment.specialistRole}` : ''}
          </p>
          <ul className="pf-panel__meta">
            <li>
              <Clock size={13} aria-hidden />
              {nextAppointment.timeLabel}
              {nextAppointment.endTimeLabel ? ` – ${nextAppointment.endTimeLabel}` : ''}
            </li>
            <li>
              <MapPin size={13} aria-hidden />
              Beauty Rocks Studio
            </li>
            {nextAppointment.servicePrice ? (
              <li className="pf-panel__price">{nextAppointment.servicePrice}</li>
            ) : null}
          </ul>
          <div className="pf-panel__foot">
            <ProfileStatusBadge status={nextAppointment.status} />
            {(nextAppointment.status === 'pending' || nextAppointment.status === 'confirmed') &&
            onCancel ? (
              <button
                type="button"
                className="pf-btn pf-btn--outline pf-btn--sm"
                onClick={() => {
                  if (
                    window.confirm(
                      `Cancel your appointment for ${nextAppointment.serviceName}?`,
                    )
                  ) {
                    onCancel(nextAppointment.id);
                  }
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </motion.article>
      ) : (
        <motion.article className="pf-panel pf-panel--featured" {...panelMotion}>
          <h2 className="pf-panel__label">Next appointment</h2>
          <p className="pf-panel__text">
            No upcoming visits. Book your next session at the studio.
          </p>
          <Link to="/booking" className="pf-btn pf-btn--outline">
            Book appointment
          </Link>
        </motion.article>
      )}

      <motion.div className="pf-duo" variants={reduceMotion ? undefined : stackStagger}>
        <motion.article className="pf-panel" {...panelMotion}>
          <h2 className="pf-panel__label">Loyalty</h2>
          <p className="pf-panel__value">
            {progress}% to {nextTier}
          </p>
          <div
            className="pf-progress pf-progress--animated"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span className="pf-progress__fill" style={{ width: `${progress}%` }} />
          </div>
          {loyalty?.nextTier ? (
            <p className="pf-panel__hint">{loyalty.pointsToNext} pts until {loyalty.nextTier}</p>
          ) : null}
        </motion.article>

        <motion.article className="pf-panel" {...panelMotion}>
          <h2 className="pf-panel__label">Account</h2>
          <dl className="pf-account-mini">
            <div>
              <dt>Role</dt>
              <dd>{roleLabel}</dd>
            </div>
            <div>
              <dt>Since</dt>
              <dd>{formatMemberSince(user?.createdAt)}</dd>
            </div>
            {user?.email ? (
              <div className="pf-account-mini__full">
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
            ) : null}
          </dl>
          {onEdit ? (
            <button type="button" className="pf-panel__link" onClick={onEdit}>
              Edit profile
            </button>
          ) : null}
        </motion.article>
      </motion.div>
    </motion.section>
  );
}
