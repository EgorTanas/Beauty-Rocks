import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import Home from './pages/Home';
import Services from './pages/Services';
import Team from './pages/Team';
import Booking from './pages/Booking';
import Profile from './pages/Profile';


const API_BASE_URL = 'http://localhost:5000';

const getUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const user = getUser();
 
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
  const user = getUser();
  if (user) return <Navigate to="/home" replace />;
  return children;
};


function App() {
  
  return (
    <BrowserRouter>
      <Routes>
         {/**Rute publice */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/team" element={<Team />} />

        <Route path="/login"
          element={<GuestRoute><Auth apiBaseUrl={API_BASE_URL} /></GuestRoute>}
        />
        <Route path="/register"
          element={<GuestRoute><Auth apiBaseUrl={API_BASE_URL} /></GuestRoute>}
        />
        <Route path="/forgot-password"
          element={<GuestRoute><Auth apiBaseUrl={API_BASE_URL} /></GuestRoute>}
        />

        <Route path="/reset-password"
          element={<Auth apiBaseUrl={API_BASE_URL} />}
        />

        <Route path="/booking"
          element={<ProtectedRoute><Booking /></ProtectedRoute>}
        />
        <Route path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        
        <Route path="/dashboard" element={<Navigate to="/home" replace />} />
        <Route path="*"          element={<Navigate to="/"    replace />} />
        
      
         <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;