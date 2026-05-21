import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Trash2, ArrowUpRight } from 'lucide-react';
import UserAvatar from '../UserAvatar';
import { getUserDisplayName } from '../../utils/userDisplay';

function formatMemberSince(createdAt) {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function ProfileHeader({
  user,
  bookingsCount,
  favoritesCount,
  onAvatarChange,
  onAvatarRemove,
  avatarUploading,
}) {
  const name = getUserDisplayName(user);
  const isAdmin = user?.role === 'admin';
  const fileInputRef = useRef(null);

  const openPicker = () => {
    if (!avatarUploading && fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <aside className="pf-rail" aria-label="Your profile">
      <p className="pf-rail__kicker">My studio space</p>

      <button
        type="button"
        className={`pf-rail__avatar-btn${avatarUploading ? ' pf-rail__avatar-btn--busy' : ''}`}
        onClick={openPicker}
        aria-label="Change profile photo"
      >
        <UserAvatar user={user} className="pf-rail__avatar" />
        <span className="pf-rail__avatar-hint">
          <Camera size={18} aria-hidden />
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && onAvatarChange) onAvatarChange(file);
            e.target.value = '';
          }}
        />
      </button>

      <h1 className="pf-rail__name">{name}</h1>
      {user?.email ? <p className="pf-rail__email">{user.email}</p> : null}

      <p className="pf-rail__role">
        {isAdmin ? 'Administrator' : 'Client'}
        <span className="pf-rail__dot" aria-hidden />
        Since {formatMemberSince(user?.createdAt)}
      </p>

      {user?.avatar && onAvatarRemove ? (
        <button
          type="button"
          className="pf-rail__photo-remove"
          onClick={onAvatarRemove}
          disabled={avatarUploading}
        >
          <Trash2 size={13} aria-hidden />
          Remove photo
        </button>
      ) : null}

      <div className="pf-rail__metrics">
        <div className="pf-metric">
          <span className="pf-metric__n">{bookingsCount}</span>
          <span className="pf-metric__l">Visits</span>
        </div>
        <div className="pf-metric">
          <span className="pf-metric__n">{favoritesCount}</span>
          <span className="pf-metric__l">Saved</span>
        </div>
      </div>

      <Link to="/booking" className="pf-rail__book">
        Book a visit
        <ArrowUpRight size={16} aria-hidden />
      </Link>
    </aside>
  );
}
