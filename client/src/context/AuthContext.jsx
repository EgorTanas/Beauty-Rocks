import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  bootstrapSession,
  logoutSession,
  persistUser,
  readStoredUser,
} from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const synced = await bootstrapSession();
      if (!cancelled) {
        setUser(synced);
        setReady(true);
      }
    })();

    const onAuthChange = () => setUser(readStoredUser());
    window.addEventListener('br-auth-change', onAuthChange);
    window.addEventListener('storage', onAuthChange);

    return () => {
      cancelled = true;
      window.removeEventListener('br-auth-change', onAuthChange);
      window.removeEventListener('storage', onAuthChange);
    };
  }, []);

  const setSessionUser = useCallback((next) => {
    if (next) {
      persistUser(next);
      setUser(next);
    } else {
      setUser(null);
    }
  }, []);

  const signOut = useCallback(async () => {
    await logoutSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, setSessionUser, signOut }),
    [user, ready, setSessionUser, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
