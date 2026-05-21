import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import BookingHero from '../components/booking/BookingHero';
import BookingStepper from '../components/booking/BookingStepper';
import ServiceSelectionStep from '../components/booking/ServiceSelectionStep';
import SpecialistSelectionStep from '../components/booking/SpecialistSelectionStep';
import DateTimeStep from '../components/booking/DateTimeStep';
import ConfirmationStep from '../components/booking/ConfirmationStep';
import { isSpecialistCompatibleWithService } from '../components/booking/bookingData';
import '../style/booking.css';

const TOTAL_STEPS = 4;

export default function Booking() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [specialist, setSpecialist] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);

  const canProceed =
    (step === 1 && service) ||
    (step === 2 && specialist) ||
    (step === 3 && date && time) ||
    step === 4;

  const goNext = () => {
    if (step < TOTAL_STEPS && canProceed) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleDateSelect = (nextDate) => {
    setDate(nextDate);
    setTime(null);
  };

  const handleServiceSelect = (nextService) => {
    setService(nextService);
    setSpecialist((prev) =>
      prev && isSpecialistCompatibleWithService(prev, nextService) ? prev : null,
    );
  };

  const showStickyCta = step < 4;

  return (
    <div className="br-page booking-page">
      <Navbar />

      <main className="booking-main">
        <BookingHero />

        <section className="booking-flow" aria-label="Appointment booking">
          <div className="booking-container booking-container--flow">
            <div className="booking-shell">
              <div className="booking-card glass-panel">
                <BookingStepper currentStep={step} />

                <div className="booking-card__body">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <ServiceSelectionStep
                        key="service"
                        selectedId={service?.id}
                        onSelect={handleServiceSelect}
                      />
                    )}
                    {step === 2 && (
                      <SpecialistSelectionStep
                        key={`specialist-${service?.id ?? 'none'}`}
                        service={service}
                        selectedId={specialist?.id}
                        onSelect={setSpecialist}
                      />
                    )}
                    {step === 3 && (
                      <DateTimeStep
                        key="datetime"
                        selectedDate={date}
                        selectedTime={time}
                        onDateSelect={handleDateSelect}
                        onTimeSelect={setTime}
                      />
                    )}
                    {step === 4 && (
                      <ConfirmationStep
                        key="confirm"
                        service={service}
                        specialist={specialist}
                        date={date}
                        time={time}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop / tablet inline footer */}
                {step < 4 ? (
                  <footer className="booking-card__footer booking-card__footer--inline">
                    <button
                      type="button"
                      className="booking-nav-btn booking-nav-btn--back"
                      onClick={goBack}
                      disabled={step === 1}
                    >
                      <ChevronLeft size={18} strokeWidth={2} aria-hidden />
                      Back
                    </button>
                    <button
                      type="button"
                      className="booking-nav-btn booking-nav-btn--next br-btn br-btn--solid"
                      onClick={goNext}
                      disabled={!canProceed}
                    >
                      Continue
                      <ChevronRight size={18} strokeWidth={2} aria-hidden />
                    </button>
                  </footer>
                ) : (
                  <footer className="booking-card__footer booking-card__footer--inline booking-card__footer--solo">
                    <button
                      type="button"
                      className="booking-nav-btn booking-nav-btn--back"
                      onClick={goBack}
                    >
                      <ChevronLeft size={18} strokeWidth={2} aria-hidden />
                      Edit details
                    </button>
                  </footer>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile sticky CTA — app-style checkout bar */}
      {showStickyCta ? (
        <div className="booking-sticky-bar" role="group" aria-label="Booking navigation">
          <div className="booking-sticky-bar__inner">
            {step > 1 ? (
              <button
                type="button"
                className="booking-sticky-bar__back"
                onClick={goBack}
                aria-label="Go back"
              >
                <ChevronLeft size={20} strokeWidth={2} aria-hidden />
              </button>
            ) : null}
            <button
              type="button"
              className="booking-sticky-bar__cta"
              onClick={goNext}
              disabled={!canProceed}
            >
              Continue
              <ChevronRight size={18} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        <div className="booking-sticky-bar booking-sticky-bar--confirm" role="group" aria-label="Booking navigation">
          <div className="booking-sticky-bar__inner">
            <button
              type="button"
              className="booking-sticky-bar__cta booking-sticky-bar__cta--secondary"
              onClick={goBack}
            >
              <ChevronLeft size={18} strokeWidth={2} aria-hidden />
              Edit details
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
