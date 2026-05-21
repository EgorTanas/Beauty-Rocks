import { CalendarX } from 'lucide-react';

export default function EmptyBookingsState({ hasFilters }) {
  return (
    <div className="adm-bk-empty">
      <span className="adm-bk-empty__icon" aria-hidden>
        <CalendarX size={40} strokeWidth={1.25} />
      </span>
      <h3 className="adm-bk-empty__title">No bookings found</h3>
      <p className="adm-bk-empty__text">
        {hasFilters
          ? 'Try adjusting your filters or search to see more appointments.'
          : 'When clients book through the salon, appointments will appear here.'}
      </p>
    </div>
  );
}
