import { motion, useReducedMotion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { adminReveal } from '../adminMotionVariants';
import { BOOKING_STATUSES } from './bookingAdminUtils';

export default function BookingFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  specialistId,
  onSpecialistChange,
  specialists,
  date,
  onDateChange,
  resultCount,
}) {
  const reduce = useReducedMotion();
  const Wrapper = reduce ? 'div' : motion.div;

  return (
    <Wrapper
      className="adm-bk-filters"
      aria-label="Filter bookings"
      {...(reduce ? {} : { initial: 'hidden', animate: 'visible', variants: adminReveal, transition: { delay: 0.15 } })}
    >
      <div className="adm-bk-filters__search">
        <Search size={18} strokeWidth={1.75} aria-hidden />
        <input
          type="search"
          className="adm-bk-input"
          placeholder="Search client, service, specialist…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search bookings"
        />
      </div>

      <div className="adm-bk-filters__row">
        <label className="adm-bk-filter-field">
          <span className="adm-bk-filter-label">
            <SlidersHorizontal size={14} aria-hidden /> Status
          </span>
          <select
            className="adm-bk-select"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="adm-bk-filter-field">
          <span className="adm-bk-filter-label">Specialist</span>
          <select
            className="adm-bk-select"
            value={specialistId}
            onChange={(e) => onSpecialistChange(e.target.value)}
          >
            <option value="all">All specialists</option>
            {specialists.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.name}
              </option>
            ))}
          </select>
        </label>

        <label className="adm-bk-filter-field">
          <span className="adm-bk-filter-label">Date</span>
          <input
            type="date"
            className="adm-bk-input adm-bk-input--date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </label>
      </div>

      {resultCount !== null ? (
        <p className="adm-bk-filters__count">
          Showing <strong>{resultCount}</strong> booking{resultCount === 1 ? '' : 's'}
        </p>
      ) : null}
    </Wrapper>
  );
}
