import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, parseJson } from '../../utils/api';
import { getUserDisplayName } from '../../utils/userDisplay';

export default function ProfileEditModal({
  user,
  open,
  onClose,
  onSave,
  saving,
  onNotice,
}) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const name = getUserDisplayName(user);
    setUsername(name === 'Account' ? '' : name);
    setPhone(user?.phone || '');
    setCurrentPassword('');
    setNewPassword('');
  }, [user, open]);

  if (!open) return null;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    try {
      const res = await apiFetch('/api/user/password', {
        method: 'PATCH',
        body: { currentPassword, newPassword },
      });
      const json = await parseJson(res);
      if (!res.ok) throw new Error(json.message || 'Password change failed');
      onNotice?.('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      onNotice?.(err.message || 'Could not change password', true);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Deactivate your account? Upcoming appointments will be cancelled. This cannot be undone from the app.',
      )
    ) {
      return;
    }
    setDeleteBusy(true);
    try {
      const res = await apiFetch('/api/user/account', { method: 'DELETE' });
      const json = await parseJson(res);
      if (!res.ok) throw new Error(json.message || 'Could not deactivate account');
      await signOut();
      onClose();
      navigate('/', { replace: true });
    } catch (err) {
      onNotice?.(err.message || 'Could not deactivate account', true);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="pf-modal" role="dialog" aria-modal="true" aria-labelledby="pf-edit-title">
      <button type="button" className="pf-modal__scrim" aria-label="Close" onClick={onClose} />
      <div className="pf-modal__panel pf-modal__panel--wide">
        <header className="pf-modal__head">
          <h2 id="pf-edit-title" className="pf-modal__title">
            Account settings
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
          <p className="pf-modal__section-label">Profile</p>
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
                'Save profile'
              )}
            </button>
          </div>
        </form>

        <form className="pf-modal__form pf-modal__form--sep" onSubmit={handlePasswordChange}>
            <p className="pf-modal__section-label">Password</p>
            <label className="pf-field">
              <span className="pf-field__lbl">Current password</span>
              <input
                className="pf-field__in"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <label className="pf-field">
              <span className="pf-field__lbl">New password</span>
              <input
                className="pf-field__in"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            <button type="submit" className="pf-btn pf-btn--outline" disabled={passwordSaving}>
              {passwordSaving ? 'Updating…' : 'Change password'}
            </button>
          </form>

        <div className="pf-modal__danger">
          <p className="pf-modal__section-label">Danger zone</p>
          <p className="pf-modal__hint">
            Deactivating removes access and cancels upcoming appointments.
          </p>
          <button
            type="button"
            className="pf-btn pf-btn--danger"
            onClick={handleDeleteAccount}
            disabled={deleteBusy}
          >
            {deleteBusy ? 'Deactivating…' : 'Deactivate account'}
          </button>
        </div>
      </div>
    </div>
  );
}
