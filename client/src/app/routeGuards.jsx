import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="br-page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Loader2 size={32} className="pf-spin" aria-hidden />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}

export function GuestRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to="/home" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const location = useLocation();
  const { user, ready } = useAuth();

  if (!ready) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
}
