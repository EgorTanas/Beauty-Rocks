import { CalendarDays, Heart, UserRound } from 'lucide-react';

const TABS = [
  { id: 'account', label: 'Details', icon: UserRound },
  { id: 'bookings', label: 'Visits', icon: CalendarDays },
  { id: 'favorites', label: 'Saved', icon: Heart },
];

export default function ProfileNav({ active, onChange }) {
  return (
    <nav className="pf-nav" aria-label="Profile sections">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            id={`pf-tab-${id}`}
            aria-selected={isActive}
            aria-controls={`pf-panel-${id}`}
            className={`pf-nav__item${isActive ? ' pf-nav__item--on' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon size={16} strokeWidth={1.75} aria-hidden />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
