import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
function App() {
  const API_BASE_URL = 'http://localhost:5000';
  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth apiBaseUrl={API_BASE_URL} />} />
        <Route path="/register" element={<Auth apiBaseUrl={API_BASE_URL} />} />
        <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
        {}
        {}
      </Routes>
    </BrowserRouter>
  );
}
export default App;