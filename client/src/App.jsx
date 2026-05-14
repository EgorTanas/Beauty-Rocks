import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import Home from './pages/Home';
import Services from './pages/Services';
import Team from './pages/Team';
import Booking from './pages/Booking';
import Profile from './pages/Profile';

function App() {
  const API_BASE_URL = 'http://localhost:5000';
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/team" element={<Team />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Auth apiBaseUrl={API_BASE_URL} />} />
        <Route path="/register" element={<Auth apiBaseUrl={API_BASE_URL} />} />
        <Route path="/dashboard" element={<Navigate to="/home" replace />} />
        <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;