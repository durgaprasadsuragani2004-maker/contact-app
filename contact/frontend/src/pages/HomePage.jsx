import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  QrCode,
  Smartphone,
  Sparkles,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Building2,
  User,
  Zap,
  CheckCircle,
  Share2,
  Download
} from 'lucide-react';

export default function HomePage() {
  const { user, login } = useAuth();

  const handleDemoLogin = async (email) => {
    await login(email, 'Password123!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', padding: '1rem 0 3rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto', paddingTop: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: '600',
            color: '#A5B4FC',
            marginBottom: '1.5rem'
          }}
        >
          <Sparkles size={14} color="#818CF8" />
          The Next Generation of Digital Business Cards & Contacts
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: '800',
            lineHeight: '1.15',
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem'
          }}
        >
          One Dynamic QR Code.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--primary-400), var(--accent-cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Instant Contact Saving.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 2.25rem',
            lineHeight: '1.6'
          }}
        >
          Create a complete digital profile for yourself or your company. Generate a smart QR code,
          share it anywhere, and let anyone scan to view your latest info and save it to their phone in 1 tap.
        </p>

        {/* Primary CTA Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              <Zap size={18} />
              Open Your Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                <Sparkles size={18} />
                Create Your Free Digital Card
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Quick Instant Demo Access Cards */}
        {!user && (
          <div
            className="glass-panel"
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              padding: '1.25rem',
              background: 'rgba(19, 27, 46, 0.6)'
            }}
          >
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '0.85rem' }}>
              ⚡ Instant 1-Click Demo Logins (Pre-seeded with Rich Data)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
              <button
                onClick={() => handleDemoLogin('rahul@example.com')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <User size={16} color="var(--primary-400)" />
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Individual Profile</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rahul Sharma (Solutions Architect)</div>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('contact@apexcloud.com')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <Building2 size={16} color="#10B981" />
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Company Profile</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Apex Cloud Solutions Inc.</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4-Step Interactive Workflow */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>How It Works</h2>
          <p>Seamless, modern networking designed for individuals and enterprises.</p>
        </div>

        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <UserPlus size={24} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. Register Your Profile</h4>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
              Choose Individual or Company. Add your phone numbers, designations, photos/logos, location, bio, and social links.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <QrCode size={24} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. Generate Dynamic QR</h4>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
              Receive your high-resolution QR code pointing to a stable URL. Print on business cards, stickers, or digital displays.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Smartphone size={24} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>3. Scan & Save (.vcf)</h4>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
              Anyone scanning opens your live mobile card with 0 app installs and saves your contact straight into iPhone or Android contacts.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Matrix / Highlights */}
      <section className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '1rem' }}>
              Never Reprint Business Cards When Your Info Changes
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              When you change your job title, phone number, company name, or office address in your dashboard,
              your existing QR codes immediately reflect the new data in real time.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                <CheckCircle size={18} color="#10B981" />
                <span>RFC 6350 compliant vCard (v3.0/4.0) generator</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                <CheckCircle size={18} color="#10B981" />
                <span>Zero login required for visitors scanning your QR code</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                <CheckCircle size={18} color="#10B981" />
                <span>Embedded photo/logo in contact files</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                <CheckCircle size={18} color="#10B981" />
                <span>Direct Google Maps location navigation</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '2rem',
                background: '#FFFFFF',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
              }}
            >
              <QrCode size={180} color="#0B0F19" />
              <p style={{ color: '#0B0F19', fontWeight: '700', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                Scan to Save Contact
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
