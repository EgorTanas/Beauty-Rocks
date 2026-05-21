import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, Scissors, Users } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, match: (path) => path === '/admin' || path === '/admin/dashboard' },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays, match: (path) => path.startsWith('/admin/bookings') },
  { to: '/admin/services', label: 'Services', icon: Scissors, match: (path) => path.startsWith('/admin/services') },
  { to: '/admin/team', label: 'Team', icon: Users, match: (path) => path.startsWith('/admin/team') },
];

export function AdminNav({ className = '' }) {
  const { pathname } = useLocation();

  return (
    <nav className={`adm-dash-header__nav ${className}`.trim()} aria-label="Admin sections">
      {NAV_ITEMS.map(({ to, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={to}
            to={to}
            className={`adm-dash-link-btn${active ? ' adm-dash-link-btn--active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={16} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminHeaderActions({ children }) {
  return <div className="adm-dash-header__actions">{children}</div>;
}
