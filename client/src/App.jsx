import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import GoogleAuthSuccess from "./pages/Googleauthsuccess";
import Home from './pages/Home';
import Services from './pages/Services';
import Team from './pages/Team';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminServices from './pages/AdminServices';
import AdminTeam from './pages/AdminTeam';
import AdminBookings from './pages/AdminBookings';
import { API_BASE } from './utils/api';

const ProtectedRoute = ({ children }) => {
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
};

const GuestRoute = ({ children }) => {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to="/home" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
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
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/team" element={<Team />} />

      <Route
        path="/login"
        element={
          <GuestRoute>
            <Auth apiBaseUrl={API_BASE} />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Auth apiBaseUrl={API_BASE} />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <Auth apiBaseUrl={API_BASE} />
          </GuestRoute>
        }
      />

      <Route path="/reset-password" element={<Auth apiBaseUrl={API_BASE} />} />

      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/dashboard" element={<Navigate to="/home" replace />} />

      <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
      <Route
        path="/admin/services"
        element={
          <AdminRoute>
            <AdminServices />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/team"
        element={
          <AdminRoute>
            <AdminTeam />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <AdminRoute>
            <AdminBookings />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
