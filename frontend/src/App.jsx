import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthPages from './pages/AuthPages';
import CitizenPortal from './pages/CitizenPortal';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);

  // Initialize user from localstorage on load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Safe clear if json parse fails
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    // Listener for auto-logout from API client
    const handleAuthChange = () => {
      setToken('');
      setUser(null);
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  // Protected Route Wrapper Component
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/auth" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        {/* Public Citizen Portal */}
        <Route path="/" element={<CitizenPortal />} />

        {/* Auth Route */}
        <Route 
          path="/auth" 
          element={
            token ? <Navigate to="/admin" replace /> : <AuthPages onAuthSuccess={handleAuthSuccess} />
          } 
        />

        {/* Protected Dashboard Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
