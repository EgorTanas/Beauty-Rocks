import { motion, useReducedMotion } from 'framer-motion';
import { Edit2, Eye, EyeOff, Trash2, User } from 'lucide-react';
import { adminItem } from './adminMotionVariants';

export default function AdminTeamCard({ member, onEdit, onToggle, onDelete }) {
  const reduce = useReducedMotion();
  const cls = `adm-dash-card adm-dash-card--team ${member.isActive ? '' : 'adm-dash-card--muted'}`;

  const body = (
    <TeamCardBody member={member} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
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

function TeamCardBody({ member, onEdit, onToggle, onDelete }) {
  const tags = (member.specialties || []).slice(0, 3);

  return (
    <>
      <div className="adm-dash-card__row">
        {member.avatar ? (
          <img src={member.avatar} alt="" className="adm-dash-card__thumb adm-dash-card__thumb--round" />
        ) : (
          <span
            className="adm-dash-card__thumb adm-dash-card__thumb--empty adm-dash-card__thumb--round"
            aria-hidden
          >
            <User size={18} />
          </span>
        )}

        <div className="adm-dash-card__body">
          <div className="adm-dash-card__headline">
            <h3 className="adm-dash-card__title">{member.name}</h3>
          </div>
          {member.role ? <p className="adm-dash-card__role">{member.role}</p> : null}
          {tags.length > 0 ? (
            <div className="adm-dash-card__tags">
              {tags.map((tag) => (
                <span key={tag} className="adm-badge adm-badge--other">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="adm-dash-card__bar">
        <button
          type="button"
          className={`adm-toggle-btn adm-toggle-btn--compact ${member.isActive ? 'adm-toggle-btn--on' : 'adm-toggle-btn--off'}`}
          onClick={() => onToggle(member._id)}
        >
          {member.isActive ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
          <span className="adm-toggle-btn__label">{member.isActive ? 'Active' : 'Hidden'}</span>
        </button>
        <div className="adm-dash-card__actions">
          <button
            type="button"
            className="adm-icon-btn adm-icon-btn--edit"
            onClick={() => onEdit(member)}
            aria-label="Edit team member"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            className="adm-icon-btn adm-icon-btn--delete"
            onClick={() => onDelete(member._id)}
            aria-label="Delete team member"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
