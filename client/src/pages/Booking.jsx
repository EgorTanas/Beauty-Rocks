import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { apiServiceToBooking } from '../components/booking/bookingData';
import { consumeBookingPrefill } from '../utils/bookingPrefill';
import {
  createAppointment,
  fetchAvailableSlots,
  fetchBookingTeam,

} from '../utils/bookingApi';
import { apiFetch, parseJson } from '../utils/api';
import { mapProfileAppointment } from '../utils/profileBookingUtils';
import '../style/booking.css';

const TOTAL_STEPS = 4;

export default function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  // Catalog porneste gol — se populează DOAR din DB
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [team, setTeam] = useState([]);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [service, setService] = useState(null);
  const [specialist, setSpecialist] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [slotsFallback, setSlotsFallback] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const prefillApplied = useRef(false);

  // Încarcă serviciile DOAR din DB, fără fallback la date hardcodate
  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      setCatalogLoading(true);
      try {
        const res = await apiFetch('/api/services');
        if (!res.ok) throw new Error('Failed');
        const json = await parseJson(res);
        const apiList = Array.isArray(json?.data) ? json.data.map(apiServiceToBooking) : [];
        if (!cancelled) setCatalog(apiList);
      } catch {
        if (!cancelled) setCatalog([]);
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    };

    loadCatalog();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!service?.id) {
      setTeam([]);
      setTeamLoaded(true);
      return undefined;
    }

    let cancelled = false;
    setTeamLoaded(false);
    fetchBookingTeam(service.id)
      .then((list) => {
        if (!cancelled) setTeam(list);
      })
      .finally(() => {
        if (!cancelled) setTeamLoaded(true);
      });
    return () => { cancelled = true; };
  }, [service?.id]);

  useEffect(() => {
    if (prefillApplied.current || catalog.length === 0) return;

    const prefill = consumeBookingPrefill();
    if (!prefill) return;

    const match =
      catalog.find((s) => String(s.id) === String(prefill.id)) ||
      catalog.find(
        (s) =>
          s.title?.toLowerCase() === prefill.title?.toLowerCase() &&
          s.categoryId === prefill.categoryId,
      );

    setService(match || prefill);
    setSpecialist(null);
    setStep(1);
    prefillApplied.current = true;
  }, [catalog]);

  const specialists = team;

  useEffect(() => {
    setTime(null);
    setSlots([]);
    setSlotsError('');
    setSlotsFallback(false);

    if (!service || !specialist || !date) return;

    let cancelled = false;
    setSlotsLoading(true);

    fetchAvailableSlots({
      teamMemberId: specialist.id,
      serviceId: service.id,
      date,
    })
      .then(({ slots: nextSlots, error, useFallback }) => {
        if (cancelled) return;
        setSlots(nextSlots);
        setSlotsError(error || '');
        setSlotsFallback(useFallback);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => { cancelled = true; };
  }, [service, specialist, date]);

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
    setSpecialist(null);
    setDate(null);
    setTime(null);
  };

  const handleSpecialistSelect = (nextSpecialist) => {
    setSpecialist(nextSpecialist);
    setDate(null);
    setTime(null);
  };

  const handleConfirmBooking = useCallback(async () => {
    setBookingBusy(true);
    setBookingError('');
    try {
      const result = await createAppointment({
        serviceId: service?.id,
        teamMemberId: specialist?.id,
        date,
        startTime: time,
      });
      if (!result.ok) {
        setBookingError(result.message);
        return { ok: false, message: result.message };
      }
      return { ok: true, data: result.data };
    } catch (err) {
      const message = err.message || 'Booking failed';
      setBookingError(message);
      return { ok: false, message };
    } finally {
      setBookingBusy(false);
    }
  }, [service, specialist, date, time]);

  // Navigăm la profile și trimitem booking-ul nou prin state
  const handleBookingSuccess = useCallback((appointmentData) => {
    const newBooking = appointmentData ? mapProfileAppointment(appointmentData) : null;
    navigate('/profile', {
      replace: false,
      state: { newBooking, refreshBookings: true },
    });
  }, [navigate]);

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
                        services={catalog}
                        loading={catalogLoading}
                        selectedId={service?.id}
                        onSelect={handleServiceSelect}
                      />
                    )}
                    {step === 2 && (
                      <SpecialistSelectionStep
                        key={`specialist-${service?.id ?? 'none'}`}
                        service={service}
                        specialists={specialists}
                        teamLoaded={teamLoaded}
                        selectedId={specialist?.id}
                        onSelect={handleSpecialistSelect}
                      />
                    )}
                    {step === 3 && (
                      <DateTimeStep
                        key="datetime"
                        selectedDate={date}
                        selectedTime={time}
                        onDateSelect={handleDateSelect}
                        onTimeSelect={setTime}
                        slots={slots}
                        slotsLoading={slotsLoading}
                        slotsError={slotsError}
                        slotsFallback={slotsFallback}
                      />
                    )}
                    {step === 4 && (
                      <ConfirmationStep
                        key="confirm"
                        service={service}
                        specialist={specialist}
                        date={date}
                        time={time}
                        onConfirm={handleConfirmBooking}
                        bookingBusy={bookingBusy}
                        bookingError={bookingError}
                        onSuccess={handleBookingSuccess}
                      />
                    )}
                  </AnimatePresence>
                </div>

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
        <div
          className="booking-sticky-bar booking-sticky-bar--confirm"
          role="group"
          aria-label="Booking navigation"
        >
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