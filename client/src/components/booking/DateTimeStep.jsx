import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import {
  BOOKING_TIME_SLOTS,
  buildCalendarMonth,
  formatBookingDate,
} from './bookingData';

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DateTimeStep({ selectedDate, selectedTime, onDateSelect, onTimeSelect }) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const calendar = useMemo(
    () => buildCalendarMonth(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const shiftMonth = (delta) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const isSameDay = (a, b) =>
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <motion.div
      className="booking-step booking-step--datetime"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="booking-step__head">
        <p className="booking-step__eyebrow">Step 3</p>
        <h2 className="booking-step__title">Pick date &amp; time</h2>
        <p className="booking-step__lead">
          Studio hours are shown below for illustration. Sundays are reserved for the team — choose any open day and slot.
        </p>
      </header>

      <div className="booking-datetime">
        <div className="booking-calendar glass-panel">
          <div className="booking-calendar__nav">
            <button
              type="button"
              className="booking-calendar__nav-btn"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <p className="booking-calendar__month">{calendar.monthLabel}</p>
            <button
              type="button"
              className="booking-calendar__nav-btn"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>

          <div className="booking-calendar__weekdays" aria-hidden>
            {WEEKDAY_HEADERS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="booking-calendar__grid" role="grid" aria-label="Select appointment date">
            {calendar.cells.map((cell) => {
              if (cell.empty) {
                return <span key={cell.key} className="booking-calendar__cell booking-calendar__cell--empty" />;
              }

              const selected = isSameDay(selectedDate, cell.date);
              return (
                <button
                  key={cell.key}
                  type="button"
                  role="gridcell"
                  className={[
                    'booking-calendar__cell',
                    cell.unavailable ? 'booking-calendar__cell--disabled' : '',
                    selected ? 'booking-calendar__cell--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={cell.unavailable}
                  onClick={(e) => {
                    onDateSelect(cell.date);
                    e.currentTarget.blur();
                  }}
                  aria-label={cell.label}
                  aria-selected={selected}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {selectedDate ? (
            <p className="booking-calendar__picked">
              <Clock3 size={14} strokeWidth={1.75} aria-hidden />
              {formatBookingDate(selectedDate)}
            </p>
          ) : null}
        </div>

        <div className="booking-times glass-panel">
          <h3 className="booking-times__title">Available times</h3>
          <p className="booking-times__hint">
            {selectedDate
              ? 'Select a preferred hour for your visit.'
              : 'Choose a date first to view time slots.'}
          </p>
          <div className="booking-times__grid">
            {BOOKING_TIME_SLOTS.map((slot) => {
              const selected = selectedTime === slot;
              const disabled = !selectedDate;
              return (
                <button
                  key={slot}
                  type="button"
                  className={[
                    'booking-time-slot',
                    selected ? 'booking-time-slot--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={disabled}
                  onClick={(e) => {
                    onTimeSelect(slot);
                    e.currentTarget.blur();
                  }}
                  aria-pressed={selected}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
