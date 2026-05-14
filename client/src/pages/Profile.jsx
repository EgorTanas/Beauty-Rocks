import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

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

  return (
    <div className="br-page">
      <SiteHeader />
      <main className="site-inner" style={{ paddingTop: '120px', minHeight: '60vh' }}>
        <div className="br-container">
          <div className="site-inner-card">
            <h1 style={{ marginBottom: '20px' }}>Your Profile</h1>
            <p style={{ marginBottom: '30px', color: 'var(--br-muted)' }}>
              Welcome, {user.username || user.name || 'User'}! You can manage your account details and modifications here.
            </p>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }} onSubmit={(e) => e.preventDefault()}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--br-beige)' }}>Name</label>
                <input 
                  type="text" 
                  defaultValue={user.username || user.name || ''} 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--br-beige)' }}>Email</label>
                <input 
                  type="email" 
                  defaultValue={user.email || ''} 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
                />
              </div>
            </form>
            <div className="site-inner-actions">
              <button className="br-btn br-btn--solid">Save Changes</button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
