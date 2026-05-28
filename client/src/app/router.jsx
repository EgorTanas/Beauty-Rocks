import { Routes, Route, Navigate } from 'react-router-dom';
import { API_BASE } from '@/lib/api';
import { AdminRoute, GuestRoute, ProtectedRoute } from '@/app/routeGuards';

import Home from '@/pages/Home';
import Services from '@/pages/Services';
import Team from '@/pages/Team';
import Auth from '@/pages/Auth';
import GoogleAuthSuccess from '@/pages/GoogleAuthSuccess';
import Booking from '@/pages/Booking';
import Profile from '@/pages/Profile';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminServices from '@/pages/AdminServices';
import AdminTeam from '@/pages/AdminTeam';
import AdminBookings from '@/pages/AdminBookings';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/team" element={<Team />} />

      {/* Auth (guest-only except reset password) */}
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
      <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

      {/* Authenticated client area */}
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

      {/* Admin panel */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
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

      {/* Legacy redirects */}
      <Route path="/dashboard" element={<Navigate to="/home" replace />} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/homepage" element={<Navigate to="/admin" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
