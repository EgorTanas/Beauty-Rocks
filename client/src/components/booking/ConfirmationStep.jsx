import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, CheckCircle2, Clock, Sparkles, UserRound, X } from 'lucide-react';
import ReusableButton from '../common/ReusableButton';
import { formatBookingDate } from './bookingData';

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

export default function ConfirmationStep({
  service,
  specialist,
  date,
  time,
  onConfirm,
}) {
  const [successOpen, setSuccessOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm?.();
    setSuccessOpen(true);
  };

  const closeSuccess = () => setSuccessOpen(false);

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
            A final glance at your curated visit. Confirm to reserve — this demo completes instantly on your device.
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
                <SummaryRow icon={Clock} label="Time" value={time} />
                <SummaryRow icon={Sparkles} label="Duration" value={service?.duration} />
              </div>
            </div>

            <div className="booking-summary__aside">
              <div className="booking-summary__total">
                <span>Estimated total</span>
                <strong>{service?.price}</strong>
              </div>

              <ReusableButton
                type="button"
                variant="solid"
                large
                block
                className="booking-summary__confirm"
                onClick={handleConfirm}
              >
                Confirm booking
              </ReusableButton>

              <p className="booking-summary__note">
                No payment is processed here. Your confirmation is saved only in this session for demonstration.
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
                <strong>{formatBookingDate(date)}</strong> at <strong>{time}</strong>.
              </p>
              <p className="booking-success-modal__sub">
                A studio concierge would send a confirmation email in production. Enjoy your Beauty Rocks experience.
              </p>
              <ReusableButton type="button" variant="solid" block onClick={closeSuccess}>
                Done
              </ReusableButton>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
