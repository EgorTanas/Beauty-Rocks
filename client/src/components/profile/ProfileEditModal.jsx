import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getUserDisplayName } from '../../utils/userDisplay';

export default function ProfileEditModal({ user, open, onClose, onSave, saving }) {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!open) return;
    setUsername(getUserDisplayName(user) === 'Account' ? '' : getUserDisplayName(user));
    setPhone(user?.phone || '');
  }, [user, open]);

  if (!open) return null;

  return (
    <div className="pf-modal" role="dialog" aria-modal="true" aria-labelledby="pf-edit-title">
      <button type="button" className="pf-modal__scrim" aria-label="Close" onClick={onClose} />
      <div className="pf-modal__panel">
        <header className="pf-modal__head">
          <h2 id="pf-edit-title" className="pf-modal__title">
            Edit profile
          </h2>
          <button type="button" className="pf-modal__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <form
          className="pf-modal__form"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ username: username.trim(), phone: phone.trim() });
          }}
        >
          <label className="pf-field">
            <span className="pf-field__lbl">Full name</span>
            <input
              className="pf-field__in"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
            />
          </label>

          <label className="pf-field">
            <span className="pf-field__lbl">Email</span>
            <input
              className="pf-field__in pf-field__in--lock"
              type="email"
              value={user?.email || ''}
              readOnly
            />
          </label>

          <label className="pf-field">
            <span className="pf-field__lbl">Phone</span>
            <input
              className="pf-field__in"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+373 …"
            />
          </label>

          <div className="pf-modal__actions">
            <button type="button" className="pf-btn pf-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="pf-btn pf-btn--rose" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="pf-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
