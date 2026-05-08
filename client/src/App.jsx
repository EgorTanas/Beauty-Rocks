import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';

function App() {
  // Poți seta URL-ul de bază al API-ului într-o constantă
  const API_BASE_URL = 'http://localhost:5000';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/login" element={<Auth apiBaseUrl={API_BASE_URL} />} />
        <Route path="/register" element={<Auth apiBaseUrl={API_BASE_URL} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;