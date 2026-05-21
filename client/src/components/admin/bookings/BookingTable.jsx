import { motion, useReducedMotion } from 'framer-motion';
import { adminTableRow } from '../adminMotionVariants';
import StatusBadge from './StatusBadge';

export default function BookingTable({ bookings, onSelect }) {
  const reduce = useReducedMotion();
  const Row = reduce ? 'tr' : motion.tr;

  return (
    <div className="adm-bk-table-wrap">
      <table className="adm-bk-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Service</th>
            <th>Specialist</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => (
            <Row
              key={b.id}
              onClick={() => onSelect(b)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => e.key === 'Enter' && onSelect(b)}
              className="adm-bk-table__row"
              {...(reduce ? {} : { variants: adminTableRow, custom: i, initial: 'hidden', animate: 'visible' })}
            >
              <td>
                <span className="adm-bk-table__client">{b.clientName}</span>
                {b.clientEmail ? (
                  <span className="adm-bk-table__sub">{b.clientEmail}</span>
                ) : null}
              </td>
              <td>{b.serviceName}</td>
              <td>{b.specialistName}</td>
              <td>{b.dateLabel}</td>
              <td>{b.timeLabel}</td>
              <td>
                <StatusBadge status={b.status} />
              </td>
            </Row>
          ))}
        </tbody>
      </table>
    </div>
  );
}
