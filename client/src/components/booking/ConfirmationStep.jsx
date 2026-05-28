import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, CheckCircle2, Clock, Loader2, Sparkles, UserRound, X } from 'lucide-react';
import ReusableButton from '../common/ReusableButton';
import { formatBookingDate } from '@/data/bookingData';
import { formatProfileTime } from '../../utils/profileBookingUtils';

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="booking-summary__row">
      <span className="booking-summary__icon" aria-hidden>
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <span className="booking-summary__label">{label}</span>
      <span className="booking-summary__value">{value}</span>
    </div>
  );
}

function formatTimeDisplay(time) {
  if (!time) return '—';
  if (time.includes('AM') || time.includes('PM')) return time;
  return formatProfileTime(time);
}

export default function ConfirmationStep({
  service,
  specialist,
  date,
  time,
  onConfirm,
  bookingBusy = false,
  bookingError = '',
  onSuccess,
}) {
  const [successOpen, setSuccessOpen] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [appointmentData, setAppointmentData] = useState(null);

  const handleConfirm = async () => {
    setConfirmError('');
    const result = await onConfirm?.();
    if (result?.ok) {
      setAppointmentData(result.data ?? null);
      setSuccessOpen(true);
    } else if (result?.message) {
      setConfirmError(result.message);
    }
  };

  const closeSuccess = () => {
    setSuccessOpen(false);
    onSuccess?.(appointmentData);
  };

  const displayError = bookingError || confirmError;

  return (
    <>
      <motion.div
        className="booking-step booking-step--confirm"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="booking-step__head">
          <p className="booking-step__eyebrow">Step 4</p>
          <h2 className="booking-step__title">Review &amp; confirm</h2>
          <p className="booking-step__lead">
            A final glance at your visit. Confirm to reserve your appointment at Beauty Rocks.
          </p>
        </header>

        <div className="booking-summary glass-panel">
          <div className="booking-summary__hero">
            {service?.image ? (
              <img src={service.image} alt="" className="booking-summary__thumb" />
            ) : null}
            <div className="booking-summary__hero-copy">
              <p className="booking-summary__service-name">{service?.title}</p>
              <p className="booking-summary__service-meta">
                {service?.duration} · {service?.price}
              </p>
            </div>
          </div>

          <div className="booking-summary__main">
            <div className="booking-summary__details">
              <div className="booking-summary__rows">
                <SummaryRow icon={UserRound} label="Specialist" value={specialist?.name} />
                <SummaryRow icon={CalendarCheck} label="Date" value={formatBookingDate(date)} />
                <SummaryRow icon={Clock} label="Time" value={formatTimeDisplay(time)} />
                <SummaryRow icon={Sparkles} label="Duration" value={service?.duration} />
              </div>
            </div>

            <div className="booking-summary__aside">
              <div className="booking-summary__total">
                <span>Estimated total</span>
                <strong>{service?.price}</strong>
              </div>

              {displayError ? (
                <p className="booking-summary__error" role="alert">
                  {displayError}
                </p>
              ) : null}

              <ReusableButton
                type="button"
                variant="solid"
                large
                block
                className="booking-summary__confirm"
                onClick={handleConfirm}
                disabled={bookingBusy}
              >
                {bookingBusy ? (
                  <>
                    <Loader2 size={18} className="pf-spin" aria-hidden />
                    Booking…
                  </>
                ) : (
                  'Confirm booking'
                )}
              </ReusableButton>

              <p className="booking-summary__note">
                No payment is processed here. You can manage or cancel from your profile.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {successOpen ? (
          <motion.div
            className="booking-success-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-success-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="booking-success-modal glass-panel"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                className="booking-success-modal__close"
                onClick={closeSuccess}
                aria-label="Close confirmation"
              >
                <X size={18} strokeWidth={2} />
              </button>

              <span className="booking-success-modal__icon" aria-hidden>
                <CheckCircle2 size={40} strokeWidth={1.5} />
              </span>
              <h3 id="booking-success-title" className="booking-success-modal__title">
                You&apos;re booked
              </h3>
              <p className="booking-success-modal__text">
                Your {service?.title} with {specialist?.name} is reserved for{' '}
                <strong>{formatBookingDate(date)}</strong> at{' '}
                <strong>{formatTimeDisplay(time)}</strong>.
              </p>
              <p className="booking-success-modal__sub">
                View or cancel anytime from your profile.
              </p>
              <ReusableButton type="button" variant="solid" block onClick={closeSuccess}>
                View profile
              </ReusableButton>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}