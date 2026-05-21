import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getUserDisplayName } from '../../utils/userDisplay';

export default function ProfileAccountTab({ user, onSave, saving }) {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setUsername(getUserDisplayName(user) === 'Account' ? '' : getUserDisplayName(user));
    setPhone(user?.phone || '');
  }, [user]);

  return (
    <section
      className="pf-sheet"
      role="tabpanel"
      id="pf-panel-account"
      aria-labelledby="pf-tab-account"
    >
      <header className="pf-sheet__head">
        <h2 className="pf-sheet__title">Personal details</h2>
        <p className="pf-sheet__sub">Used for booking confirmations and studio contact.</p>
      </header>

      <form
        className="pf-form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ username: username.trim(), phone: phone.trim() });
        }}
      >
        <label className="pf-field pf-field--wide">
          <span className="pf-field__lbl">Full name</span>
          <input
            className="pf-field__in"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="name"
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
            aria-readonly="true"
          />
        </label>

        <label className="pf-field">
          <span className="pf-field__lbl">
            Phone <em className="pf-field__em">optional</em>
          </span>
          <input
            className="pf-field__in"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="+373 …"
          />
        </label>

        <div className="pf-form-grid__action">
          <button type="submit" className="pf-btn pf-btn--wine" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={17} className="pf-spin" aria-hidden />
                Saving…
              </>
            ) : (
              'Update details'
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
