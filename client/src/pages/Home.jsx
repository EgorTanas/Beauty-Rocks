import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles } from 'lucide-react';
import '../style/Home.css';

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => readStoredUser());

  useEffect(() => {
    const u = readStoredUser();
    if (!u) {
      navigate('/login', { replace: true });
      return;
    }
    setUser(u);
  }, [navigate]);

  const displayName = useMemo(() => {
    if (!user) return '';
    return user.username || user.name || user.email?.split('@')[0] || 'Guest';
  }, [user]);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-brand">
          <img src="/img/instruments-cropped.png" alt="" className="home-brand-mark" width={40} height={40} />
          <span className="home-brand-text">Beauty Rocks</span>
        </div>
        <button type="button" className="home-sign-out" onClick={handleSignOut}>
          <LogOut size={18} strokeWidth={1.75} />
          Sign out
        </button>
      </header>

      <main className="home-main">
        <div className="home-hero-card">
          <div className="home-hero-icon" aria-hidden>
            <Sparkles size={28} strokeWidth={1.5} />
          </div>
          <p className="home-kicker">You&apos;re in</p>
          <h1 className="home-title">Welcome, {displayName}</h1>
          <p className="home-lead">
            Your Beauty Rocks space is ready. Bookings, profile, and salon perks will live here as the app grows.
          </p>
        </div>
      </main>
    </div>
  );
}
