import { motion, useReducedMotion } from 'framer-motion';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  Sparkles,
  Trash2,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import { adminModalOverlay, adminModalPanel } from '../adminMotionVariants';
import StatusBadge from './StatusBadge';
import { formatDisplayDate, formatDisplayTime } from './bookingAdminUtils';

export default function BookingDetailsModal({
  booking,
  onClose,
  onStatusChange,
  onDelete,
  actionLoading,
  statusError,
}) {
  const reduce = useReducedMotion();

  const canConfirm = booking?.status === 'pending';
  const canComplete = booking?.status === 'confirmed';
  const canCancel = booking?.status === 'pending' || booking?.status === 'confirmed';
  const canDelete =
    booking?.status === 'cancelled' || booking?.status === 'completed';
  const notes = booking?.notes?.trim();

  const overlayProps = reduce
    ? { className: 'adm-overlay adm-dash-modal-overlay' }
    : {
        className: 'adm-overlay adm-dash-modal-overlay',
        variants: adminModalOverlay,
        initial: 'hidden',
        animate: 'visible',
        exit: 'exit',
      };

  const panelProps = reduce
    ? { className: 'adm-modal adm-bk-modal adm-dash-modal' }
    : {
        className: 'adm-modal adm-bk-modal adm-dash-modal',
        variants: adminModalPanel,
        initial: 'hidden',
        animate: 'visible',
        exit: 'exit',
      };

  const Overlay = reduce ? 'div' : motion.div;
  const Panel = reduce ? 'div' : motion.div;

  const body = (
    <>
      <header className="adm-bk-modal__header">
        <div className="adm-bk-modal__header-main">
          <p className="adm-bk-modal__eyebrow">Booking details</p>
          <h2 id="adm-bk-modal-title">{booking.clientName}</h2>
          {booking.clientEmail ? (
            <p className="adm-bk-modal__email">
              <Mail size={14} aria-hidden />
              {booking.clientEmail}
            </p>
          ) : null}
        </div>
        <div className="adm-bk-modal__header-aside">
          <StatusBadge status={booking.status} />
          <span className="adm-bk-modal__id">#{String(booking.id).slice(-6)}</span>
          <button type="button" className="adm-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
      </header>

      <div className="adm-bk-modal__body">
        {statusError ? (
          <p className="adm-bk-modal__error" role="alert">
            {statusError}
          </p>
        ) : null}

        <div className="adm-bk-modal__highlight">
          <p className="adm-bk-modal__service-title">{booking.serviceName}</p>
          <p className="adm-bk-modal__service-meta">
            {booking.dateLabel} · {booking.timeLabel}
            {booking.endTime ? ` – ${formatDisplayTime(booking.endTime)}` : ''}
          </p>
          {booking.servicePrice ? (
            <p className="adm-bk-modal__service-price">{booking.servicePrice}</p>
          ) : null}
        </div>

        <div className="adm-bk-modal__grid">
          <section className="adm-bk-modal__panel">
            <h3>Appointment</h3>
            <ul className="adm-bk-detail-list">
              <li>
                <CalendarCheck size={16} aria-hidden />
                <span>{booking.dateLabel}</span>
              </li>
              <li>
                <Clock size={16} aria-hidden />
                <span>
                  {booking.timeLabel}
                  {booking.serviceDuration ? ` · ${booking.serviceDuration}` : ''}
                </span>
              </li>
              <li>
                <Sparkles size={16} aria-hidden />
                <span>{booking.serviceName}</span>
              </li>
            </ul>
          </section>

          <section className="adm-bk-modal__panel">
            <h3>Specialist</h3>
            <div className="adm-bk-specialist">
              <span className="adm-bk-specialist__avatar" aria-hidden>
                <UserRound size={20} />
              </span>
              <div>
                <p className="adm-bk-specialist__name">{booking.specialistName}</p>
                <p className="adm-bk-specialist__role">{booking.specialistRole || 'Team member'}</p>
              </div>
            </div>
          </section>
        </div>

        <section className="adm-bk-modal__panel adm-bk-modal__panel--full">
          <h3>Client notes</h3>
          <p className="adm-bk-notes">{notes || 'No notes provided for this visit.'}</p>
        </section>

        <div className="adm-bk-modal__summary-bar">
          <div>
            <span className="adm-bk-modal__summary-label">Booked on</span>
            <strong>{formatDisplayDate(booking.createdAt)}</strong>
          </div>
          <div className="adm-bk-modal__summary-total">
            <span className="adm-bk-modal__summary-label">Estimated total</span>
            <strong>{booking.servicePrice || '—'}</strong>
          </div>
        </div>
      </div>

      <footer className="adm-bk-modal__footer">
        {canConfirm ? (
          <button
            type="button"
            className="adm-btn adm-dash-btn--gold adm-bk-modal__action"
            disabled={actionLoading}
            onClick={() => onStatusChange(booking.id, 'confirmed')}
          >
            {actionLoading ? <Loader2 size={16} className="adm-spinner" /> : <CheckCircle2 size={16} />}
            Confirm booking
          </button>
        ) : null}
        {canComplete ? (
          <button
            type="button"
            className="adm-btn adm-dash-btn--gold adm-bk-modal__action"
            disabled={actionLoading}
            onClick={() => onStatusChange(booking.id, 'completed')}
          >
            {actionLoading ? <Loader2 size={16} className="adm-spinner" /> : <Sparkles size={16} />}
            Mark completed (local)
          </button>
        ) : null}
        {canCancel ? (
          <button
            type="button"
            className="adm-btn adm-btn--danger adm-bk-modal__action"
            disabled={actionLoading}
            onClick={() => onStatusChange(booking.id, 'cancelled')}
          >
            {actionLoading ? <Loader2 size={16} className="adm-spinner" /> : <XCircle size={16} />}
            Cancel booking
          </button>
        ) : null}
        {canDelete && onDelete ? (
          <button
            type="button"
            className="adm-btn adm-btn--danger adm-bk-modal__action"
            disabled={actionLoading}
            onClick={() => onDelete(booking.id)}
          >
            {actionLoading ? <Loader2 size={16} className="adm-spinner" /> : <Trash2 size={16} />}
            Delete permanently
          </button>
        ) : null}
        <button type="button" className="adm-btn adm-btn--ghost adm-bk-modal__action" onClick={onClose}>
          Close
        </button>
      </footer>
    </>
  );

  if (reduce) {
    return (
      <div
        className="adm-overlay adm-dash-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-bk-modal-title"
        onClick={onClose}
      >
        <div className="adm-modal adm-bk-modal adm-dash-modal" onClick={(e) => e.stopPropagation()}>
          {body}
        </div>
      </div>
    );
  }

  return (
    <Overlay
      role="dialog"
      aria-modal="true"
      aria-labelledby="adm-bk-modal-title"
      onClick={onClose}
      {...overlayProps}
    >
      <Panel onClick={(e) => e.stopPropagation()} {...panelProps}>
        {body}
      </Panel>
    </Overlay>
  );
}
