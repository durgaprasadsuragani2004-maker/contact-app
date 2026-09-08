import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfileEditPage from './pages/ProfileEditPage';
import PublicProfilePage from './pages/PublicProfilePage';
import QRPrintPage from './pages/QRPrintPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Verifying authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();
  const isStandalonePublicCard = location.pathname.startsWith('/profile/') && !location.pathname.startsWith('/profile/edit') && !location.pathname.startsWith('/profile/print');

  return (
    <div className="app-container">
      {/* Hide Navbar & Footer on standalone public card scan if preferred, or keep minimal header */}
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public Profile View (Accessed by scanning QR Code) */}
          <Route path="/profile/:token" element={<PublicProfilePage />} />

          {/* Protected Profile & Management Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/qr"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/profile/print"
            element={
              <ProtectedRoute>
                <QRPrintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isStandalonePublicCard && <Footer />}
      <Toast />
    </div>
  );
}
