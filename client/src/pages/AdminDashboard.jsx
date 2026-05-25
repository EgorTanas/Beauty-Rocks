import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  Clock,
  Loader2,
  Plus,
  Scissors,
  UserPlus,
  Users,
} from 'lucide-react';
import '../style/AdminServices.css';
import '../style/AdminDashboard.css';
import '../style/AdminDashboardOverview.css';
import { AdminHeaderActions, AdminNav } from '../components/admin/AdminNav';
import { AdminHeader } from '../components/admin/AdminMotion';
import { adminItem, adminStagger } from '../components/admin/adminMotionVariants';
import StatusBadge from '../components/admin/bookings/StatusBadge';
import {
  buildAttentionItems,
  buildOverviewStats,
  getTodayBookings,
  mapApiAppointment,
  sortBookingsRecent,
} from '../components/admin/dashboard/adminDashboardUtils';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/$/, '');

const fetchOpts = () => ({
  method: 'GET',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
});

const STAT_CARDS = [
  { key: 'todayAppointments', label: 'Today', icon: CalendarDays },
  { key: 'pendingAppointments', label: 'Pending', icon: Clock },
  { key: 'totalServices', label: 'Services', icon: Scissors },
  { key: 'teamMembers', label: 'Team', icon: Users },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [bkRes, svcRes, teamRes] = await Promise.all([
        fetch(`${API}/api/admin/appointments?limit=80&page=1`, fetchOpts()),
        fetch(`${API}/api/admin/services`, fetchOpts()),
        fetch(`${API}/api/admin/team`, fetchOpts()),
      ]);

      if (bkRes.status === 401 || bkRes.status === 403) {
        navigate('/login');
        return;
      }

      const failures = [];
      if (bkRes.ok) {
        const json = await bkRes.json();
        setBookings((json.data || []).map(mapApiAppointment));
      } else failures.push('bookings');

      if (svcRes.ok) {
        const json = await svcRes.json();
        setServices(json.data || []);
      } else failures.push('services');

      if (teamRes.ok) {
        const json = await teamRes.json();
        setTeam(json.data || []);
      } else failures.push('team');

      if (failures.length === 3) throw new Error('Could not load dashboard');
      if (failures.length > 0) {
        setError(`Partial load (${failures.join(', ')}). Showing available data.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const stats = useMemo(
    () => buildOverviewStats({ bookings, services, team }),
    [bookings, services, team],
  );

  const todayBookings = useMemo(() => getTodayBookings(bookings), [bookings]);
  const recentBookings = useMemo(() => sortBookingsRecent(bookings, 5), [bookings]);
  const attention = useMemo(
    () => buildAttentionItems({ bookings, services, team }),
    [bookings, services, team],
  );

  const displayToday = todayBookings.length > 0 ? todayBookings : recentBookings.slice(0, 5);
  const todayPanelTitle = todayBookings.length > 0 ? "Today's appointments" : 'Recent bookings';

  const StatWrap = reduceMotion ? 'div' : motion.div;
  const statsProps = reduceMotion
    ? { className: 'adm-overview-stats' }
    : { className: 'adm-overview-stats', variants: adminStagger, initial: 'hidden', animate: 'visible' };

  return (
    <div className="adm-page adm-dash adm-overview-page">
      <AdminHeader className="adm-dash-header adm-dash-header--sub">
        <button
          type="button"
          className="adm-dash-back"
          onClick={() => navigate('/home')}
          aria-label="View public site"
        >
          <ChevronLeft size={18} />
          Site
        </button>
        <div className="adm-dash-header__copy">
          <p className="adm-dash-header__eyebrow">Salon dashboard</p>
          <h1 className="adm-dash-header__title">Overview</h1>
          <p className="adm-dash-header__subtitle">
            Today at the studio — appointments, pending confirmations, and quick actions.
          </p>
        </div>
        <AdminHeaderActions>
          <AdminNav />
        </AdminHeaderActions>
      </AdminHeader>

      {error ? (
        <div className="adm-bk-alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadOverview}>
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="adm-loading" aria-live="polite">
          <Loader2 size={28} className="adm-spinner" />
          <p>Loading dashboard…</p>
        </div>
      ) : (
        <>
          <StatWrap {...statsProps}>
            {STAT_CARDS.map(({ key, label, icon: Icon }) => {
              const Card = reduceMotion ? 'article' : motion.article;
              return (
                <Card
                  key={key}
                  className="adm-overview-stat"
                  {...(reduceMotion ? {} : { variants: adminItem })}
                >
                  <span className="adm-overview-stat__icon" aria-hidden>
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="adm-overview-stat__value">{stats[key] ?? 0}</p>
                    <p className="adm-overview-stat__label">{label}</p>
                  </div>
                </Card>
              );
            })}
          </StatWrap>

          <div className="adm-overview-actions">
            <p className="adm-overview-actions__label">Quick actions</p>
            <div className="adm-overview-actions__row">
              <Link
                to="/admin/services"
                state={{ openCreate: true }}
                className="adm-overview-action adm-overview-action--primary"
              >
                <Plus size={16} aria-hidden />
                Add service
              </Link>
              <Link
                to="/admin/team"
                state={{ openCreate: true }}
                className="adm-overview-action adm-overview-action--primary"
              >
                <UserPlus size={16} aria-hidden />
                Add team member
              </Link>
            </div>
          </div>

          {attention.length > 0 ? (
            <aside className="adm-overview-attention" aria-label="Needs attention">
              <p className="adm-overview-attention__title">
                <AlertCircle size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                Needs attention
              </p>
              <ul className="adm-overview-attention__list">
                {attention.map((item) => (
                  <li key={item.id}>
                    <Link to={item.href}>{item.message}</Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          <section className="adm-overview-panel">
            <div className="adm-overview-panel__head">
              <h2>{todayPanelTitle}</h2>
              <Link to="/admin/bookings" className="adm-overview-panel__link">
                View all
              </Link>
            </div>
            {displayToday.length === 0 ? (
              <p className="adm-overview-empty">No appointments yet.</p>
            ) : (
              <ul className="adm-overview-booking-list">
                {displayToday.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      className="adm-overview-booking-item"
                      onClick={() =>
                        navigate('/admin/bookings', { state: { bookingId: b.id } })
                      }
                    >
                      <div className="adm-overview-booking-item__top">
                        <p className="adm-overview-booking-item__name">{b.clientName}</p>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="adm-overview-booking-item__meta">
                        {b.serviceName} · {b.dateLabel} · {b.timeLabel}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
