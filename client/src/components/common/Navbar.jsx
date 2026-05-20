import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Settings, X } from 'lucide-react';
import { getUserDisplayName } from '../../utils/userDisplay';
import UserAvatar from '../UserAvatar';

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [user, setUser] = useState(() => readStoredUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktopNav, setIsDesktopNav] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1025px)').matches,
  );

  useEffect(() => {
    const syncUser = () => setUser(readStoredUser());
    window.addEventListener('storage', syncUser);
    window.addEventListener('br-auth-change', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('br-auth-change', syncUser);
    };
  }, []);

  useEffect(() => {
    setUser(readStoredUser());
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1025px)');
    const sync = () => setIsDesktopNav(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    closeMenu();
    navigate('/', { replace: true });
  };

  const isAdmin = user?.role === 'admin';
  const homeActive = pathname === '/' || pathname === '/home';
  const navClass = ({ isActive }) =>
    `site-nav-link${isActive ? ' site-nav-link--active' : ''}`;

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      <nav className="site-nav" aria-label="Primary">
        <Link to="/" className="site-logo" onClick={closeMenu}>
          <span className="site-logo-mark" aria-hidden>BR</span>
          <span className="site-logo-text">Beauty Rocks</span>
        </Link>

        <div
          id="mobile-nav-panel"
          className={`site-nav-links ${menuOpen ? 'site-nav-links--open' : ''}`}
        >
          <NavLink
            to="/"
            end
            className={() => `site-nav-link${homeActive ? ' site-nav-link--active' : ''}`}
            onClick={closeMenu}
          >
            Home
          </NavLink>
          <NavLink to="/services" className={navClass} onClick={closeMenu}>
            Services
          </NavLink>
          <NavLink to="/team" className={navClass} onClick={closeMenu}>
            Team
          </NavLink>
          <NavLink to="/booking" className={navClass} onClick={closeMenu}>
            Booking
          </NavLink>

          {isAdmin && !isDesktopNav ? (
            <NavLink
              to="/admin/services"
              className={({ isActive }) =>
                `site-nav-admin-mobile${isActive ? ' site-nav-admin-mobile--active' : ''}`
              }
              onClick={closeMenu}
            >
              <Settings size={15} strokeWidth={1.75} aria-hidden />
              Admin Panel
            </NavLink>
          ) : null}
        </div>

        <div className="site-nav-actions">
          {isAdmin && isDesktopNav ? (
            <Link
              to="/admin/services"
              className="site-btn-admin"
              title="Admin Panel"
              aria-label="Admin Panel"
            >
              <Settings size={15} strokeWidth={1.75} aria-hidden />
              <span>Admin Panel</span>
            </Link>
          ) : null}

          {user ? (
            <div className="site-nav-user">
              <Link to="/profile" className="site-user-pill" onClick={closeMenu}>
                <UserAvatar user={user} />
                <span className="site-user-name">{getUserDisplayName(user)}</span>
              </Link>
              <button
                type="button"
                className="site-btn-ghost site-btn-ghost--signout"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="site-btn-primary site-btn-primary--nav">
              Sign In
            </Link>
          )}

          <button
            type="button"
            className="site-menu-toggle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      {menuOpen ? <div className="site-nav-scrim" aria-hidden onClick={closeMenu} /> : null}
    </header>
  );
}
