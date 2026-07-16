import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CalendarDays, Clock3, Sparkles } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { fetchAvailableSlots, fetchRescheduleRequest, submitRescheduleRequest } from '../utils/bookingApi';
import { toISODateString } from '../utils/api';
import '../style/reschedule.css';

const formatDateLabel = (value) =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));

const toInputDate = (value) => toISODateString(new Date(value));

export default function Reschedule() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      const result = await fetchRescheduleRequest(token);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message || 'Invalid or expired reschedule link.');
        setLoading(false);
        return;
      }

      const data = result.data;
      setAppointment(data);
      const initialDate = data?.date ? toInputDate(data.date) : '';
      setDate(initialDate);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!appointment?.teamMember?._id || !appointment?.service?._id || !date) {
      setSlots([]);
      return undefined;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError('');
    setSelectedTime('');

    fetchAvailableSlots({
      teamMemberId: appointment.teamMember._id,
      serviceId: appointment.service._id,
      date,
    })
      .then(({ slots: nextSlots, error: nextError }) => {
        if (cancelled) return;
        setSlots(nextSlots || []);
        setSlotsError(nextError || '');
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [appointment?.service?._id, appointment?.teamMember?._id, date]);

  const currentLabel = useMemo(() => {
    if (!appointment?.date) return '';
    return `${formatDateLabel(appointment.date)} at ${appointment.startTime || '—'}`;
  }, [appointment]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!date || !selectedTime) return;
    setSubmitting(true);
    setError('');
    setMessage('');

    const result = await submitRescheduleRequest(token, {
      date,
      startTime: selectedTime,
    });

    if (!result.ok) {
      setError(result.message || 'Could not reschedule appointment.');
      setSubmitting(false);
      return;
    }

    setMessage('Appointment successfully rescheduled.');
    setAppointment(result.data || appointment);
    setSubmitting(false);
  };

  return (
    <div className="br-page reschedule-page">
      <Navbar />
      <main className="reschedule-main">
        <section className="reschedule-hero">
          <div className="reschedule-hero__badge">
            <Sparkles size={16} />
            Reschedule appointment
          </div>
          <h1>Choose a new time that works for you.</h1>
          <p>
            We reserved a secure link for your appointment. Pick a new slot from the live
            availability list below and we will update everything instantly.
          </p>
        </section>

        <section className="reschedule-shell">
          <div className="reschedule-card glass-panel">
            {loading ? (
              <div className="reschedule-state">
                <Loader2 className="spin" size={22} />
                Loading your reschedule details...
              </div>
            ) : error && !appointment ? (
              <div className="reschedule-state reschedule-state--error">
                <h2>Link unavailable</h2>
                <p>{error}</p>
                <button type="button" className="reschedule-link" onClick={() => navigate('/')}>
                  Go to home
                </button>
              </div>
            ) : (
              <form className="reschedule-form" onSubmit={handleSubmit}>
                <div className="reschedule-summary">
                  <div className="reschedule-summary__title">Current appointment</div>
                  <div className="reschedule-summary__grid">
                    <div>
                      <span>Service</span>
                      <strong>{appointment?.service?.name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span>Specialist</span>
                      <strong>{appointment?.teamMember?.name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span>Date & time</span>
                      <strong>{currentLabel || 'N/A'}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>Reschedule requested</strong>
                    </div>
                  </div>
                </div>

                <div className="reschedule-fields">
                  <label className="reschedule-field">
                    <span>
                      <CalendarDays size={16} /> New date
                    </span>
                    <input
                      type="date"
                      value={date}
                      min={toInputDate(new Date())}
                      onChange={(event) => setDate(event.target.value)}
                    />
                  </label>

                  <div className="reschedule-field">
                    <span>
                      <Clock3 size={16} /> Available times
                    </span>
                    <div className="reschedule-slots">
                      {slotsLoading ? (
                        <div className="reschedule-inline-state">
                          <Loader2 className="spin" size={16} />
                          Loading available slots...
                        </div>
                      ) : slotsError ? (
                        <div className="reschedule-inline-state reschedule-inline-state--error">
                          {slotsError}
                        </div>
                      ) : slots.length ? (
                        slots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className={`reschedule-slot ${selectedTime === slot ? 'is-active' : ''}`}
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </button>
                        ))
                      ) : (
                        <div className="reschedule-inline-state">No available slots for this date.</div>
                      )}
                    </div>
                  </div>
                </div>

                {message ? <div className="reschedule-success">{message}</div> : null}
                {error ? <div className="reschedule-error">{error}</div> : null}

                <div className="reschedule-actions">
                  <button
                    type="submit"
                    className="reschedule-submit"
                    disabled={submitting || !date || !selectedTime}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="spin" size={18} /> Updating appointment...
                      </>
                    ) : (
                      'Confirm new time'
                    )}
                  </button>
                  <button
                    type="button"
                    className="reschedule-secondary"
                    onClick={() => navigate('/booking')}
                  >
                    Book a different appointment
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
