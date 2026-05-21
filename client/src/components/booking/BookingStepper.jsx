import { Check } from 'lucide-react';
import { BOOKING_STEPS } from './bookingData';

export default function BookingStepper({ currentStep }) {
  const activeMeta = BOOKING_STEPS.find((s) => s.id === currentStep) ?? BOOKING_STEPS[0];
  const progressPct = (currentStep / BOOKING_STEPS.length) * 100;

  return (
    <nav className="booking-stepper" aria-label="Booking progress">
      {/* Mobile: guided app-style progress */}
      <div className="booking-stepper__mobile">
        <p className="booking-stepper__mobile-count">
          Step {currentStep} of {BOOKING_STEPS.length}
        </p>
        <p className="booking-stepper__mobile-label">{activeMeta.label}</p>
        <div
          className="booking-stepper__mobile-bar"
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={BOOKING_STEPS.length}
          aria-label={`Booking progress, step ${currentStep} of ${BOOKING_STEPS.length}`}
        >
          <span className="booking-stepper__mobile-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <ul className="booking-stepper__dots" aria-hidden>
          {BOOKING_STEPS.map((step) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <li
                key={step.id}
                className={[
                  'booking-stepper__dot',
                  done ? 'booking-stepper__dot--done' : '',
                  active ? 'booking-stepper__dot--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            );
          })}
        </ul>
      </div>

      {/* Desktop: horizontal stepper */}
      <ol className="booking-stepper__desktop">
        {BOOKING_STEPS.map((step, index) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          const upcoming = currentStep < step.id;

          return (
            <li
              key={step.id}
              className={[
                'booking-stepper__item',
                done ? 'booking-stepper__item--done' : '',
                active ? 'booking-stepper__item--active' : '',
                upcoming ? 'booking-stepper__item--upcoming' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="booking-stepper__track" aria-hidden>
                {index > 0 ? <span className="booking-stepper__line" /> : null}
              </div>
              <span className="booking-stepper__marker" aria-hidden={!done && !active}>
                {done ? <Check size={14} strokeWidth={2.5} /> : <span>{step.id}</span>}
              </span>
              <span className="booking-stepper__label">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
