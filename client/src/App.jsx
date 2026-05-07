import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from "react";
import Auth from './pages/Auth';

function App() {
  useEffect(() => {
    fetch("http://localhost:5000")
      .then(res => res.json())
      .then(data => console.log(data));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;