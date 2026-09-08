import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qrlync_token'));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  // Fetch current user and profile
  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('qrlync_token');
    if (!savedToken) {
      setUser(null);
      setProfile(null);
      setQrCode(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
        setProfile(res.profile);
        setQrCode(res.qrCode);
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err.message);
      localStorage.removeItem('qrlync_token');
      setUser(null);
      setProfile(null);
      setQrCode(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login handler
  const login = async (email, password) => {
    try {
      const data = await api.login({ email, password });
      if (data.success) {
        localStorage.setItem('qrlync_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setProfile(data.profile);
        setQrCode(data.qrCode);
        showToast('Welcome back! Successfully logged in.', 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Please verify your credentials.', 'error');
      return { success: false, error: err.message };
    }
  };

  // Register handler
  const register = async (payload) => {
    try {
      const data = await api.register(payload);
      if (data.success) {
        localStorage.setItem('qrlync_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setProfile(data.profile);
        setQrCode(data.qrCode);
        showToast('Registration successful! Your digital card is ready.', 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message || 'Registration failed. Please check form data.', 'error');
      return { success: false, error: err.message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('qrlync_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setQrCode(null);
    showToast('Logged out successfully.', 'info');
  };

  // Update profile
  const updateProfileData = async (fields) => {
    try {
      const res = await api.updateProfile(fields);
      if (res.success) {
        setProfile(res.profile);
        showToast('Profile updated successfully!', 'success');
        return { success: true, profile: res.profile };
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
      return { success: false, error: err.message };
    }
  };

  // Regenerate QR
  const regenerateQRCode = async () => {
    try {
      const res = await api.regenerateQR();
      if (res.success) {
        setQrCode(res.qrCode);
        showToast('QR Code and link regenerated successfully!', 'success');
        return { success: true, qrCode: res.qrCode };
      }
    } catch (err) {
      showToast(err.message || 'Failed to regenerate QR code.', 'error');
      return { success: false, error: err.message };
    }
  };

  // Update QR Code styling
  const updateQrCodeStyle = async (styling) => {
    try {
      const res = await api.updateQrStyle(styling);
      if (res.success) {
        setQrCode(res.qrCode);
        showToast('QR Code styling updated successfully!', 'success');
        return { success: true, qrCode: res.qrCode };
      }
    } catch (err) {
      showToast(err.message || 'Failed to update QR Code style.', 'error');
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        qrCode,
        token,
        loading,
        toast,
        showToast,
        hideToast,
        login,
        register,
        logout,
        refreshUser,
        updateProfileData,
        regenerateQRCode,
        updateQrCodeStyle,
        setProfile,
        setQrCode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
