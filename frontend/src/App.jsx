import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Log user out globally
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  return (
    <Router>
      <Routes>
        {/* Landing Page as default entry point */}
        <Route
          path="/"
          element={<LandingPage token={token} />}
        />
        <Route
          path="/login"
          element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!token ? <Register setToken={setToken} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={token ? <Dashboard token={token} handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
