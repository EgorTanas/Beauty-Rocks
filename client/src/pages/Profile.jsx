import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { getUserDisplayName } from '../utils/userDisplay';
import UserAvatar from '../components/UserAvatar';
import '../style/Home.css';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) {
        navigate('/login', { replace: true });
        return;
      }
      setUser(JSON.parse(raw));
    } catch {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  if (!user) return null;

  const displayName = getUserDisplayName(user);

  return (
    <div className="br-page">
      <SiteHeader />
      <main className="site-inner profile-page">
        <div className="br-container">
          <section className="profile-card">
            <header className="profile-card-head">
              <UserAvatar user={user} className="profile-avatar" />
              <div>
                <p className="profile-eyebrow">Your account</p>
                <h1 className="profile-title">{displayName}</h1>
                {user.email ? <p className="profile-email">{user.email}</p> : null}
              </div>
            </header>

            <p className="profile-lead">
              Manage your details and keep your booking information up to date.
            </p>

            <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-name">
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  className="profile-input"
                  defaultValue={displayName}
                  autoComplete="name"
                />
              </div>
              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-email">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="profile-input"
                  defaultValue={user.email || ''}
                  autoComplete="email"
                  readOnly
                />
              </div>
            </form>

            <div className="site-inner-actions">
              <button type="button" className="br-btn br-btn--solid">
                Save changes
              </button>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
