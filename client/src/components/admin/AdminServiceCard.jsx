import { motion, useReducedMotion } from 'framer-motion';
import { Edit2, Eye, EyeOff, Image as ImageIcon, Trash2 } from 'lucide-react';
import { adminItem } from './adminMotionVariants';
import {
  categoryBadgeClass,
  formatCategoryLabel,
  formatServiceMeta,
} from './adminCardUtils';

export default function AdminServiceCard({ service, onEdit, onToggle, onDelete }) {
  const reduce = useReducedMotion();
  const cls = `adm-dash-card adm-dash-card--service ${service.isActive ? '' : 'adm-dash-card--muted'}`;

  const body = (
    <CardBody service={service} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
  );

  if (reduce) {
    return <article className={cls}>{body}</article>;
  }

  return (
    <motion.article className={cls} variants={adminItem}>
      {body}
    </motion.article>
  );
}

function CardBody({ service, onEdit, onToggle, onDelete }) {
  return (
    <>
      <div className="adm-dash-card__row">
        {service.image ? (
          <img src={service.image} alt="" className="adm-dash-card__thumb" />
        ) : (
          <span className="adm-dash-card__thumb adm-dash-card__thumb--empty" aria-hidden>
            <ImageIcon size={18} />
          </span>
        )}

        <div className="adm-dash-card__body">
          <div className="adm-dash-card__headline">
            <h3 className="adm-dash-card__title">{service.name}</h3>
            <span className={categoryBadgeClass(service.category)}>
              {formatCategoryLabel(service.category)}
            </span>
          </div>
          <p className="adm-dash-card__meta">{formatServiceMeta(service.price, service.duration)}</p>
        </div>
      </div>

      <div className="adm-dash-card__bar">
        <button
          type="button"
          className={`adm-toggle-btn adm-toggle-btn--compact ${service.isActive ? 'adm-toggle-btn--on' : 'adm-toggle-btn--off'}`}
          onClick={() => onToggle(service._id)}
        >
          {service.isActive ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
          <span className="adm-toggle-btn__label">{service.isActive ? 'Active' : 'Hidden'}</span>
        </button>
        <div className="adm-dash-card__actions">
          <button
            type="button"
            className="adm-icon-btn adm-icon-btn--edit"
            onClick={() => onEdit(service)}
            aria-label="Edit service"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            className="adm-icon-btn adm-icon-btn--delete"
            onClick={() => onDelete(service._id)}
            aria-label="Delete service"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
