import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';


export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing your login...');

  useEffect(() => {
    const error = searchParams.get('error');

    if (error) {
      setStatus('Google login failed. Redirecting...');
      setTimeout(() => navigate('/login?error=' + error), 1500);
      return;
    }

    const rawUser = searchParams.get('user');

    if (!rawUser) {
      setStatus('Something went wrong. Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(rawUser));
      localStorage.setItem('user', JSON.stringify(user));

      // Replace current history entry so back-button doesn't return here
      navigate('/dashboard', { replace: true });
    } catch {
      setStatus('Failed to process login data. Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '16px',
      fontFamily: 'sans-serif',
      color: '#555',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #d4497a',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p>{status}</p>
    </div>
  );
}