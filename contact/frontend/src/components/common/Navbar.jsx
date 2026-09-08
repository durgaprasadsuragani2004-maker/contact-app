import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QrCode, User, Building2, LogOut, LayoutDashboard, Edit3, ExternalLink, Settings, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, profile, qrCode, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicPage = location.pathname.startsWith('/profile/');

  return (
    <header
      className="navbar no-print"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-glass)'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary-600), var(--accent-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px var(--primary-glow)'
            }}
          >
            <QrCode size={22} color="#FFFFFF" />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #FFFFFF 30%, var(--primary-300) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.03em'
              }}
            >
              QRLync
            </span>
            <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', marginTop: '-4px', fontWeight: '600', letterSpacing: '0.05em' }}>
              DIGITAL IDENTITY
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`btn btn-sm ${location.pathname === '/dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <LayoutDashboard size={16} />
                <span className="hide-mobile">Dashboard</span>
              </Link>

              <Link
                to="/profile/edit"
                className={`btn btn-sm ${location.pathname === '/profile/edit' ? 'btn-secondary' : 'btn-secondary'}`}
                style={{ borderColor: location.pathname === '/profile/edit' ? 'var(--primary-500)' : undefined }}
              >
                <Edit3 size={16} />
                <span className="hide-mobile">Edit Profile</span>
              </Link>

              {qrCode?.token && (
                <Link
                  to={`/profile/${qrCode.token}`}
                  target="_blank"
                  className="btn btn-outline btn-sm"
                  title="View Public Profile Card"
                >
                  <ExternalLink size={16} />
                  <span className="hide-mobile">Public Card</span>
                </Link>
              )}

              <Link
                to="/settings"
                className="btn btn-secondary btn-sm"
                title="Account Settings"
                style={{ padding: '0.5rem' }}
              >
                <Settings size={17} />
              </Link>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  paddingLeft: '0.5rem',
                  borderLeft: '1px solid var(--border-glass)'
                }}
              >
                <span className={`badge ${user.account_type === 'company' ? 'badge-company' : 'badge-individual'}`}>
                  {user.account_type === 'company' ? <Building2 size={12} /> : <User size={12} />}
                  <span className="hide-mobile">{user.account_type}</span>
                </span>

                <button
                  onClick={logout}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.45rem 0.75rem' }}
                  title="Sign out"
                >
                  <LogOut size={15} />
                  <span className="hide-mobile">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <Sparkles size={15} />
                Create Free QR Card
              </Link>
            </>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none; }
        }
      `}</style>
    </header>
  );
}
