import { motion, useReducedMotion } from 'framer-motion';
import { adminItem } from '../adminMotionVariants';
import StatusBadge from './StatusBadge';

export default function BookingCard({ booking, onSelect, index = 0 }) {
  const reduce = useReducedMotion();

  const content = (
    <>
      <div className="adm-bk-card__top">
        <StatusBadge status={booking.status} />
        <span className="adm-bk-card__date">{booking.dateLabel}</span>
      </div>
      <h3 className="adm-bk-card__client">{booking.clientName}</h3>
      <p className="adm-bk-card__service">{booking.serviceName}</p>
      <dl className="adm-bk-card__meta">
        <div>
          <dt>Specialist</dt>
          <dd>{booking.specialistName}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{booking.timeLabel}</dd>
        </div>
      </dl>
    </>
  );

  if (reduce) {
    return (
      <button type="button" className="adm-bk-card" onClick={() => onSelect(booking)}>
        {content}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      className="adm-bk-card"
      onClick={() => onSelect(booking)}
      variants={adminItem}
      custom={index}
      whileTap={{ scale: 0.995 }}
    >
      {content}
    </motion.button>
  );
}
