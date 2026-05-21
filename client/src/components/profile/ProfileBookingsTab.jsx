import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Loader2 } from 'lucide-react';
import ProfileStatusBadge from './ProfileStatusBadge';

export default function ProfileBookingsTab({ bookings, loading, onCancel }) {
  return (
    <section
      className="pf-sheet"
      role="tabpanel"
      id="pf-panel-bookings"
      aria-labelledby="pf-tab-bookings"
    >
      <header className="pf-sheet__head">
        <h2 className="pf-sheet__title">Your visits</h2>
        <p className="pf-sheet__sub">Upcoming and past appointments at Beauty Rocks.</p>
      </header>

      {loading ? (
        <div className="pf-loading pf-loading--inline">
          <Loader2 size={26} className="pf-spin" />
          <p>Loading visits…</p>
        </div>
      ) : null}

      {!loading && bookings.length === 0 ? (
        <div className="pf-zero">
          <p className="pf-zero__title">No appointments yet</p>
          <p className="pf-zero__text">When you book, your visits will appear here.</p>
          <Link to="/booking" className="pf-btn pf-btn--wine">
            Book your first visit
          </Link>
        </div>
      ) : null}

      {!loading && bookings.length > 0 ? (
        <ul className="pf-visits">
          {bookings.map((b) => {
            const canCancel =
              onCancel &&
              (b.status.toLowerCase() === 'pending' || b.status.toLowerCase() === 'confirmed');
            return (
              <li key={b.id}>
                <article className="pf-visit-row">
                  <div className="pf-visit-row__main">
                    <div className="pf-visit-row__top">
                      <h3 className="pf-visit-row__title">{b.serviceName}</h3>
                      <ProfileStatusBadge status={b.status} />
                    </div>
                    <p className="pf-visit-row__pro">{b.specialistName}</p>
                    <div className="pf-visit-row__when">
                      <span>
                        <CalendarDays size={14} aria-hidden />
                        {b.dateLabel}
                      </span>
                      <span>
                        <Clock size={14} aria-hidden />
                        {b.timeLabel}
                      </span>
                    </div>
                  </div>
                  {canCancel ? (
                    <button
                      type="button"
                      className="pf-btn pf-btn--ghost"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Cancel your appointment for ${b.serviceName}?`,
                          )
                        ) {
                          onCancel(b.id);
                        }
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
