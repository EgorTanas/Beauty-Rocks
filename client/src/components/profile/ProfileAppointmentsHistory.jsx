import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import ProfileStatusBadge from './ProfileStatusBadge';
import { getUpcomingBookings } from '../../utils/profileDashboardUtils';
import { catalogItem, catalogStagger } from '../common/motionVariants';

function partitionBookings(bookings) {
  const upcoming = getUpcomingBookings(bookings);
  const upcomingIds = new Set(upcoming.map((b) => b.id));
  const past = bookings
    .filter((b) => !upcomingIds.has(b.id))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return { upcoming: upcoming.slice(1), past };
}

export default function ProfileAppointmentsHistory({
  bookings,
  loading,
  onCancel,
}) {
  const reduceMotion = useReducedMotion();
  const { upcoming, past } = partitionBookings(bookings);

  const sectionMotion = reduceMotion
    ? {}
    : {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, amount: 0.1 },
        variants: catalogStagger,
      };

  if (loading) {
    return (
      <section className="pf-history" aria-label="Appointment history">
        <article className="pf-panel">
          <h2 className="pf-panel__label">Your visits</h2>
          <p className="pf-panel__text">Loading appointments…</p>
        </article>
      </section>
    );
  }

  if (bookings.length === 0) {
    return (
      <section className="pf-history" aria-label="Appointment history">
        <article className="pf-panel">
          <h2 className="pf-panel__label">Your visits</h2>
          <p className="pf-panel__text">No appointments yet.</p>
          <Link to="/booking" className="pf-btn pf-btn--outline">
            Book your first visit
          </Link>
        </article>
      </section>
    );
  }

  const renderList = (list, title) => {
    if (!list.length) return null;
    return (
      <div className="pf-history__group">
        <h3 className="pf-history__subtitle">{title}</h3>
        <ul className="pf-history__list">
          {list.map((apt) => (
            <motion.li
              key={apt.id}
              className="pf-history__item"
              variants={reduceMotion ? undefined : catalogItem}
            >
              <div className="pf-history__item-head">
                <span className="pf-history__service">{apt.serviceName}</span>
                <ProfileStatusBadge status={apt.status} />
              </div>
              <p className="pf-history__meta">
                {apt.dateLabel} · {apt.timeLabel}
                {apt.specialistName ? ` · ${apt.specialistName}` : ''}
              </p>
              {apt.servicePrice ? (
                <p className="pf-history__price">{apt.servicePrice}</p>
              ) : null}
              {(apt.status === 'pending' || apt.status === 'confirmed') && onCancel ? (
                <button
                  type="button"
                  className="pf-btn pf-btn--outline pf-btn--sm pf-history__cancel"
                  onClick={() => {
                    if (window.confirm(`Cancel ${apt.serviceName} on ${apt.dateLabel}?`)) {
                      onCancel(apt.id);
                    }
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </motion.li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <motion.section className="pf-history" aria-label="Appointment history" {...sectionMotion}>
      <article className="pf-panel" variants={reduceMotion ? undefined : catalogItem}>
        <h2 className="pf-panel__label">Your visits</h2>
        {renderList(upcoming, 'More upcoming')}
        {renderList(past, 'Past')}
      </article>
    </motion.section>
  );
}
