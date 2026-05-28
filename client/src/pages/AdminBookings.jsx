import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronLeft, Loader2 } from 'lucide-react';
import '../style/AdminServices.css';
import '../style/AdminDashboard.css';
import '../style/AdminBookings.css';
import BookingStats from '../components/admin/bookings/BookingStats';
import BookingFilters from '../components/admin/bookings/BookingFilters';
import BookingTable from '../components/admin/bookings/BookingTable';
import BookingCard from '../components/admin/bookings/BookingCard';
import BookingDetailsModal from '../components/admin/bookings/BookingDetailsModal';
import EmptyBookingsState from '../components/admin/bookings/EmptyBookingsState';
import { MOCK_ADMIN_BOOKINGS } from '../components/admin/bookings/bookingAdminData';
import { AdminHeaderActions, AdminNav } from '../components/admin/AdminNav';
import { AdminHeader } from '../components/admin/AdminMotion';
import { adminListSwap, adminStagger } from '../components/admin/adminMotionVariants';
import {
  computeBookingStats,
  extractSpecialistsFromBookings,
  filterBookingsClient,
  isApiPatchableStatus,
  mapApiAppointment,
} from '../components/admin/bookings/bookingAdminUtils';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ADMIN_APPOINTMENTS = `${API}/api/admin/appointments`;
const ADMIN_TEAM = `${API}/api/admin/team`;

const fetchOpts = (method = 'GET', body) => ({
  method,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  ...(body !== undefined && { body: JSON.stringify(body) }),
});

export default function AdminBookings() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [usedMock, setUsedMock] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialistFilter, setSpecialistFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [teamOptions, setTeamOptions] = useState([]);

  const [selected, setSelected] = useState(null);

  const loadTeam = useCallback(async () => {
    try {
      const res = await fetch(ADMIN_TEAM, fetchOpts());
      if (!res.ok) return;
      const json = await res.json();
      const list = (json.data || []).map((m) => ({ id: m._id, name: m.name }));
      setTeamOptions(list);
    } catch {
      /* optional */
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: '200', page: '1' });
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (specialistFilter && specialistFilter !== 'all') params.set('worker', specialistFilter);
      if (dateFilter) params.set('date', dateFilter);

      const res = await fetch(`${ADMIN_APPOINTMENTS}?${params}`, fetchOpts());

      if (res.status === 401 || res.status === 403) {
        navigate('/login');
        return;
      }

      if (!res.ok) throw new Error('Failed to load bookings');

      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data.map(mapApiAppointment) : [];
      setBookings(list);
      setUsedMock(false);
    } catch (err) {
      const list = MOCK_ADMIN_BOOKINGS.map(mapApiAppointment);
      setBookings(list);
      setUsedMock(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, specialistFilter, dateFilter, navigate]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    const id = location.state?.bookingId;
    if (!id || bookings.length === 0) return;
    const match = bookings.find((b) => b.id === id);
    if (match) setSelected(match);
    navigate('/admin/bookings', { replace: true, state: {} });
  }, [bookings, location.state?.bookingId, navigate]);

  const specialists = useMemo(() => {
    const fromBookings = extractSpecialistsFromBookings(bookings);
    const map = new Map();
    teamOptions.forEach((t) => map.set(t.id, t));
    fromBookings.forEach((t) => map.set(t.id, t));
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings, teamOptions]);

  const filtered = useMemo(
    () =>
      filterBookingsClient(bookings, {
        search,
        status: 'all',
        specialistId: 'all',
        date: '',
      }),
    [bookings, search],
  );

  const stats = useMemo(() => computeBookingStats(bookings), [bookings]);

  const updateBookingInList = (updated) => {
    const mapped = mapApiAppointment(updated);
    setBookings((prev) => prev.map((b) => (b.id === mapped.id ? mapped : b)));
    setSelected(mapped);
  };

  const applyLocalStatus = (id, nextStatus) => {
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, status: nextStatus } : b)));
    setSelected((s) => (s?.id === id ? { ...s, status: nextStatus } : s));
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this booking permanently? This cannot be undone.')) return;

    setStatusError(null);

    if (usedMock || String(id).startsWith('mock-')) {
      setBookings((list) => list.filter((b) => b.id !== id));
      setSelected(null);
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`${ADMIN_APPOINTMENTS}/${id}`, fetchOpts('DELETE'));

      if (res.status === 401 || res.status === 403) {
        navigate('/login');
        return;
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusError(json.message || 'Delete failed');
        return;
      }

      setBookings((list) => list.filter((b) => b.id !== id));
      setSelected(null);
    } catch (err) {
      setStatusError(err.message || 'Could not delete booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    const normalized = String(nextStatus).trim().toLowerCase();
    setStatusError(null);

    if (usedMock || String(id).startsWith('mock-')) {
      applyLocalStatus(id, normalized);
      return;
    }

    if (!isApiPatchableStatus(normalized)) {
      applyLocalStatus(id, normalized);
      setStatusError(
        '“Completed” is saved in this view only until the API supports it. Use Confirm or Cancel to sync with the server.',
      );
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(
        `${ADMIN_APPOINTMENTS}/${id}/status`,
        fetchOpts('PATCH', { status: normalized }),
      );

      if (res.status === 401 || res.status === 403) {
        navigate('/login');
        return;
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json.message || 'Status update failed';
        if (normalized === 'completed' && /status must be one of/i.test(msg)) {
          applyLocalStatus(id, 'completed');
          setStatusError(
            'The server does not accept “completed” yet. Shown locally until backend is updated.',
          );
          return;
        }
        setStatusError(msg);
        return;
      }

      if (json.data) {
        updateBookingInList(json.data);
      } else {
        applyLocalStatus(id, normalized);
      }
    } catch (err) {
      setStatusError(err.message || 'Could not update status. Check that the server is running.');
    } finally {
      setActionLoading(false);
    }
  };

  const hasFilters = !!(search || statusFilter !== 'all' || specialistFilter !== 'all' || dateFilter);

  return (
    <div className="adm-page adm-dash adm-bookings-page">
      <AdminHeader className="adm-dash-header adm-dash-header--sub">
        <button type="button" className="adm-dash-back" onClick={() => navigate('/admin')} aria-label="Back to dashboard">
          <ChevronLeft size={18} />
          Overview
        </button>
        <div className="adm-dash-header__copy">
          <p className="adm-dash-header__eyebrow">
            <CalendarDays size={14} aria-hidden />
            Salon dashboard
          </p>
          <h1 className="adm-dash-header__title">Bookings</h1>
          <p className="adm-dash-header__subtitle">
            Review appointments, confirm visits, and keep the studio schedule flowing.
          </p>
        </div>
        <AdminHeaderActions>
          <AdminNav />
        </AdminHeaderActions>
      </AdminHeader>

      {usedMock ? (
        <p className="adm-bk-mock-banner" role="status">
          Demo data — connect the server to load live appointments from the database.
        </p>
      ) : null}

      {error ? (
        <div className="adm-bk-alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="adm-bk-loading" aria-live="polite">
          <Loader2 size={28} className="adm-spinner" />
          <p>Loading bookings…</p>
        </div>
      ) : (
        <>
      <BookingStats stats={stats} />

      <BookingFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        specialistId={specialistFilter}
        onSpecialistChange={setSpecialistFilter}
        specialists={specialists}
        date={dateFilter}
        onDateChange={setDateFilter}
        resultCount={filtered.length}
      />

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            exit="exit"
            variants={adminListSwap}
          >
            <EmptyBookingsState hasFilters={hasFilters} />
          </motion.div>
        ) : (
          <motion.div
            key={`list-${statusFilter}-${specialistFilter}-${dateFilter}-${search}`}
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            exit="exit"
            variants={adminListSwap}
          >
            <div className="adm-bk-desktop">
              <BookingTable bookings={filtered} onSelect={setSelected} />
            </div>
            <motion.div
              className="adm-bk-mobile"
              variants={reduceMotion ? undefined : adminStagger}
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
            >
              {filtered.map((b, i) => (
                <BookingCard key={b.id} booking={b} index={i} onSelect={setSelected} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {selected ? (
          <BookingDetailsModal
            key={selected.id}
            booking={selected}
            onClose={() => {
              setSelected(null);
              setStatusError(null);
            }}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteBooking}
            actionLoading={actionLoading}
            statusError={statusError}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
