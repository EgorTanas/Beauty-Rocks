import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProfileHero from '../components/profile/ProfileHero';
import ProfileDashboard from '../components/profile/ProfileDashboard';
import ProfileSavedSection from '../components/profile/ProfileSavedSection';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import {
  getFavoriteServices,
  removeFavoriteService,
  subscribeFavorites,
} from '../utils/favoriteServices';
import { mapProfileAppointment } from '../utils/profileBookingUtils';
import {
  computeTotalSpent,
  formatMoney,
  getLoyalty,
  getNextAppointment,
} from '../utils/profileDashboardUtils';
import '../style/Profile.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fetchOpts = (method = 'GET', body) => ({
  method,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

function persistUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event('br-auth-change'));
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [aptStats, setAptStats] = useState(null);

  const [favorites, setFavorites] = useState(() => getFavoriteServices());
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const totalVisits = aptStats?.total ?? (bookingsLoaded ? bookings.length : 0);
  const loyalty = useMemo(() => getLoyalty(totalVisits), [totalVisits]);
  const nextAppointment = useMemo(() => getNextAppointment(bookings), [bookings]);
  const totalSpent = useMemo(() => computeTotalSpent(bookings), [bookings]);

  const heroStats = useMemo(
    () => ({
      visits: bookingsLoaded || aptStats ? String(totalVisits) : '—',
      spentLabel: bookingsLoaded ? formatMoney(totalSpent) : '—',
      upcoming: aptStats ? String(aptStats.upcoming ?? 0) : '—',
      saved: String(favorites.length),
    }),
    [aptStats, bookingsLoaded, favorites.length, totalSpent, totalVisits],
  );

  const loadProfile = useCallback(async () => {
    setLoadingUser(true);
    try {
      const res = await fetch(`${API}/api/user/profile`, fetchOpts());
      if (res.status === 401) {
        navigate('/login', { replace: true, state: { from: '/profile' } });
        return;
      }
      if (!res.ok) throw new Error('Could not load profile');
      const json = await res.json();
      const profile = json.data || json.user;
      if (profile) {
        setUser(profile);
        persistUser(profile);
      }
    } catch {
      try {
        const raw = localStorage.getItem('user');
        if (raw) setUser(JSON.parse(raw));
        else navigate('/login', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    } finally {
      setLoadingUser(false);
    }
  }, [navigate]);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch(`${API}/api/user/appointments?limit=50&page=1`, fetchOpts());
      if (res.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      if (!res.ok) throw new Error('Could not load bookings');
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data.map(mapProfileAppointment) : [];
      setBookings(list);
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
      setBookingsLoaded(true);
    }
  }, [navigate]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/user/appointments/stats`, fetchOpts());
      if (!res.ok) return;
      const json = await res.json();
      if (json.data) setAptStats(json.data);
    } catch {
      /* optional */
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!bookingsLoaded && !bookingsLoading) loadBookings();
  }, [bookingsLoaded, bookingsLoading, loadBookings]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    return subscribeFavorites(setFavorites);
  }, []);

  useEffect(() => {
    document.body.classList.add('pf-body');
    return () => document.body.classList.remove('pf-body');
  }, []);

  const handleSave = async ({ username, phone }) => {
    setSaving(true);
    setSaveMessage('');
    setSaveError('');
    try {
      const res = await fetch(`${API}/api/user/profile`, fetchOpts('PATCH', { username, phone }));
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Save failed');
      const updated = json.data || { ...user, username, phone };
      setUser(updated);
      persistUser(updated);
      setSaveMessage('Profile updated.');
      setEditOpen(false);
    } catch (err) {
      setSaveError(err.message || 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (file) => {
    setAvatarUploading(true);
    setSaveMessage('');
    setSaveError('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch(`${API}/api/user/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Avatar upload failed');
      const updated = { ...user, avatar: json.data?.avatar || json.avatar };
      setUser(updated);
      persistUser(updated);
      setSaveMessage('Photo updated.');
    } catch (err) {
      setSaveError(err.message || 'Could not update photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setSaveMessage('');
    setSaveError('');
    try {
      const res = await fetch(`${API}/api/appointments/${bookingId}/cancel`, fetchOpts('PATCH'));
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Cancellation failed');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)),
      );
      setAptStats((prev) =>
        prev
          ? {
              ...prev,
              upcoming: Math.max(0, (prev.upcoming || 1) - 1),
            }
          : prev,
      );
      setSaveMessage('Appointment cancelled.');
    } catch (err) {
      setSaveError(err.message || 'Could not cancel booking');
    }
  };

  const globalNotice = saveMessage || saveError;
  const noticeType = saveError ? 'err' : 'ok';

  if (loadingUser && !user) {
    return (
      <div className="br-page pf-page">
        <Navbar />
        <main className="pf-main">
          <div className="pf-loading">
            <Loader2 size={32} className="pf-spin" />
            <p>Loading your profile…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="br-page pf-page">
      <Navbar />
      <main className="pf-main">
        {globalNotice ? (
          <p className={`pf-toast pf-toast--${noticeType}`} role="status">
            {globalNotice}
          </p>
        ) : null}

        <div className="pf-shell">
          <ProfileHero
            user={user}
            stats={heroStats}
            loyaltyLabel={loyalty.label}
            onAvatarChange={handleAvatarChange}
            avatarUploading={avatarUploading}
          />

          <ProfileDashboard
            user={user}
            loyalty={loyalty}
            nextAppointment={nextAppointment}
            bookingsLoading={bookingsLoading}
            onCancel={handleCancelBooking}
            onEdit={() => setEditOpen(true)}
          />

          <ProfileSavedSection favorites={favorites} onRemove={removeFavoriteService} />
        </div>
      </main>
      <Footer />

      <ProfileEditModal
        user={user}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
