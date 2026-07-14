import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { persistUser } from '@/lib/api';
import '@/style/Auth.css';

function getCallbackState(searchParams) {
  const error = searchParams.get('error');
  if (error) {
    return {
      status: 'Google login failed. Redirecting…',
      redirectTo: `/login?error=${error}`,
      user: null,
    };
  }

  const rawUser = searchParams.get('user');
  if (!rawUser) {
    return {
      status: 'Something went wrong. Redirecting…',
      redirectTo: '/login',
      user: null,
    };
  }

  try {
    return {
      status: 'Signing you in…',
      redirectTo: '/home',
      user: JSON.parse(decodeURIComponent(rawUser)),
    };
  } catch {
    return {
      status: 'Failed to process login. Redirecting…',
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
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  useEffect(() => {
    if (callbackState.user) {
      persistUser(callbackState.user);
      const redirectTo = sessionStorage.getItem('authRedirectFrom') || '/home';
      sessionStorage.removeItem('authRedirectFrom');
      navigate(redirectTo, { replace: true });
      return undefined;
    }

    const redirectTimer = setTimeout(
      () => navigate(callbackState.redirectTo, { replace: true }),
      1500,
    );
    return () => clearTimeout(redirectTimer);
  }, [callbackState, navigate]);

  return (
    <div className="auth-oauth-callback">
      <div className="auth-oauth-callback__card">
        <Loader2 size={36} className="pf-spin auth-oauth-callback__spin" aria-hidden />
        <p className="auth-oauth-callback__text">{callbackState.status}</p>
      </div>
    </div>
  );
}
