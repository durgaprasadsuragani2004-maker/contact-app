import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Settings, Lock, Eye, EyeOff, ShieldCheck, User, LogOut, CheckCircle2, Palette, Layers, Sparkles } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const THEME_PRESETS = [
  { name: 'Indigo Aura', color: '#4F46E5' },
  { name: 'Cyber Cyan', color: '#06B6D4' },
  { name: 'Emerald Luxe', color: '#10B981' },
  { name: 'Royal Purple', color: '#8B5CF6' },
  { name: 'Rose Red', color: '#F43F5E' },
  { name: 'Amber Gold', color: '#F59E0B' },
  { name: 'Deep Slate', color: '#334155' }
];

export default function SettingsPage() {
  const { user, profile, updateProfileData, logout, showToast, loading } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  if (loading || !user || !profile) {
    return <LoadingSpinner fullScreen={true} text="Loading account settings..." />;
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('Please complete all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await api.updatePassword({ currentPassword, newPassword });
      if (res.success) {
        setPassSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Password updated successfully!', 'success');
      }
    } catch (err) {
      setPassError(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleToggleVisibility = async (e) => {
    const isPublic = e.target.checked ? 1 : 0;
    await updateProfileData({ ...profile, is_public: isPublic });
  };

  const handleModeChange = async (mode) => {
    await updateProfileData({ ...profile, activeMode: mode });
  };

  const handleCardStyleChange = async (style) => {
    const curr = profile.theme || {};
    await updateProfileData({ ...profile, theme: { ...curr, cardStyle: style } });
  };

  const handleColorChange = async (color) => {
    const curr = profile.theme || {};
    await updateProfileData({
      ...profile,
      theme_color: color,
      theme: { ...curr, primaryColor: color }
    });
  };

  return (
    <div style={{ maxWidth: '680px', margin: '1rem auto 4rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', padding: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <Settings size={26} color="var(--primary-400)" />
        <h2 style={{ fontSize: '1.75rem' }}>Account & Security Settings</h2>
      </div>

      {/* Account Info Box */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} color="var(--primary-400)" />
          Account Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Account Email</span>
            <strong style={{ color: '#F8FAFC' }}>{user.email}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Account Type</span>
            <strong style={{ color: '#F8FAFC', textTransform: 'capitalize' }}>{user.account_type}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Member Since</span>
            <span style={{ color: '#F8FAFC' }}>
              {new Date(user.created_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Privacy & Visibility Settings */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={18} color="#10B981" />
          Public Profile Visibility
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Control whether visitors scanning your QR code or opening your link can access your card.
        </p>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={profile.is_public === 1 || profile.is_public === undefined}
            onChange={handleToggleVisibility}
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary-500)' }}
          />
          <div>
            <span style={{ fontWeight: '600', color: '#F8FAFC', fontSize: '0.92rem' }}>
              Enable Public QR & Card Access
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
              Unchecking this makes your profile private (visitors will see a privacy notice).
            </span>
          </div>
        </label>
      </div>

      {/* Multi-Mode & Theme Appearance (Feature 5) */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--primary-400)" />
          Profile Presentation Mode
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Select your active profile mode. This immediately controls which social & work links are visible on your card.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
          {[
            { id: 'all', label: 'All Modes', icon: '🌐' },
            { id: 'work', label: 'Work Mode', icon: '💼' },
            { id: 'personal', label: 'Personal Mode', icon: '👤' }
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModeChange(m.id)}
              className={`btn btn-sm ${(profile.activeMode || 'all') === m.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'center', gap: '0.4rem', padding: '0.65rem' }}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Palette size={18} color="#8B5CF6" />
          Card Visual Theme
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Choose your digital card styling preset.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { id: 'modern', label: 'Modern Gradient' },
            { id: 'glassmorphism', label: 'Glassmorphism' },
            { id: 'minimal', label: 'Minimalist Slate' }
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleCardStyleChange(s.id)}
              className={`btn btn-sm ${(profile.theme?.cardStyle || 'modern') === s.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'center', padding: '0.65rem' }}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Theme Color:</span>
          {THEME_PRESETS.map((p) => (
            <button
              key={p.color}
              type="button"
              title={p.name}
              onClick={() => handleColorChange(p.color)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: p.color,
                border: (profile.theme?.primaryColor || profile.theme_color) === p.color ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>

      {/* Password Change Form */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} color="#F59E0B" />
          Update Password
        </h3>

        {passError && (
          <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', color: '#FB7185', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {passError}
          </div>
        )}

        {passSuccess && (
          <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#6EE7B7', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} /> Password changed successfully!
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label"><span>Current Password</span></label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label"><span>New Password</span></label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label"><span>Confirm New Password</span></label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPass}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.5rem' }}
          >
            {isChangingPass ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Logout button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={logout} className="btn btn-danger">
          <LogOut size={16} />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}
