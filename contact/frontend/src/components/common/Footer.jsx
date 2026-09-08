import React from 'react';
import { QrCode, Heart, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="footer no-print"
      style={{
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(11, 15, 25, 0.95)',
        padding: '2.5rem 1.25rem 2rem',
        marginTop: 'auto'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <QrCode size={20} color="var(--primary-400)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '1.1rem', color: '#F8FAFC' }}>
            QRLync Digital Profile Ecosystem
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Smartphone size={15} color="#10B981" /> 1-Tap iOS & Android vCard Save
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={15} color="#06B6D4" /> Secure MongoDB Atlas Storage
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={15} color="#F59E0B" /> Dynamic Live Updates
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} QRLync. Engineered for high-impact professional networking and digital corporate branding.
        </p>
      </div>
    </footer>
  );
}
