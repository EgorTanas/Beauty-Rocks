const STATUS_CLASS = {
  pending: 'adm-bk-badge--pending',
  confirmed: 'adm-bk-badge--confirmed',
  completed: 'adm-bk-badge--completed',
  cancelled: 'adm-bk-badge--cancelled',
};

export default function StatusBadge({ status }) {
  const key = status || 'pending';
  return (
    <span className={['adm-bk-badge', STATUS_CLASS[key] || ''].filter(Boolean).join(' ')}>
      {key}
    </span>
  );
}
