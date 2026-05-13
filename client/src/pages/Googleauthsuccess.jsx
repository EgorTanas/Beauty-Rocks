import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function getCallbackState(searchParams) {
  const error = searchParams.get('error');
  if (error) {
    return {
      status: 'Google login failed. Redirecting...',
      redirectTo: '/login?error=' + error,
      user: null,
    };
  }

  const rawUser = searchParams.get('user');
  if (!rawUser) {
    return {
      status: 'Something went wrong. Redirecting...',
      redirectTo: '/login',
      user: null,
    };
  }

  try {
    return {
      status: 'Processing your login...',
      redirectTo: '/home',
      user: JSON.parse(decodeURIComponent(rawUser)),
    };
  } catch {
    return {
      status: 'Failed to process login data. Redirecting...',
      redirectTo: '/login',
      user: null,
    };
  }
}

export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const callbackState = useMemo(() => getCallbackState(searchParams), [searchParams]);

  useEffect(() => {
    if (callbackState.user) {
      localStorage.setItem('user', JSON.stringify(callbackState.user));
      // Replace current history entry so back-button doesn't return here
      navigate('/home', { replace: true });
      return undefined;
    }

    const redirectTimer = setTimeout(() => navigate(callbackState.redirectTo), 1500);
    return () => clearTimeout(redirectTimer);
  }, [callbackState, navigate]);

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
      <p>{callbackState.status}</p>
    </div>
  );
}
