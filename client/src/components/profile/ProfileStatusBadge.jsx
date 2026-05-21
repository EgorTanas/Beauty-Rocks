const MAP = {
  pending: ['pf-pill', 'pf-pill--wait'],
  confirmed: ['pf-pill', 'pf-pill--ok'],
  completed: ['pf-pill', 'pf-pill--done'],
  cancelled: ['pf-pill', 'pf-pill--off'],
};

const LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Done',
  cancelled: 'Cancelled',
};

export default function ProfileStatusBadge({ status }) {
  const key = (status || 'pending').toLowerCase();
  const [base, mod] = MAP[key] || MAP.pending;
  return <span className={`${base} ${mod}`}>{LABELS[key] || key}</span>;
}
