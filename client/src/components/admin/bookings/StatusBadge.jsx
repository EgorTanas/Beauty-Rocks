const STATUS_CLASS = {
  pending: 'adm-bk-badge--pending adm-bk-badge--pulse',
  confirmed: 'adm-bk-badge--confirmed',
  completed: 'adm-bk-badge--completed',
  cancelled: 'adm-bk-badge--cancelled',
};

const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function StatusBadge({ status, className = '' }) {
  const key = (status || 'pending').toLowerCase();
  return (
    <span
      className={['adm-bk-badge', STATUS_CLASS[key] || 'adm-bk-badge--pending', className]
        .filter(Boolean)
        .join(' ')}
    >
      {STATUS_LABEL[key] || key}
    </span>
  );
}
