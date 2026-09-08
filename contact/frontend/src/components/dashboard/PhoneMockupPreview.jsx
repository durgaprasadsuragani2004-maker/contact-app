import React from 'react';
import PublicCard from '../public/PublicCard';
import { Smartphone, Wifi, Battery, Signal } from 'lucide-react';

export default function PhoneMockupPreview({ profile, token }) {
  if (!profile) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
        <Smartphone size={16} color="var(--primary-400)" />
        <span style={{ fontWeight: '600', color: '#F8FAFC' }}>Live Smartphone Preview</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Updates automatically)</span>
      </div>

      {/* Smartphone Chassis Frame */}
      <div
        style={{
          width: '360px',
          maxWidth: '100%',
          height: '710px',
          background: '#090D16',
          borderRadius: '46px',
          border: '10px solid #1E293B',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 20px rgba(99, 102, 241, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Device Speaker & Camera Notch (Dynamic Island) */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '110px',
            height: '24px',
            background: '#000000',
            borderRadius: '16px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1E293B' }} />
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#1E293B' }} />
        </div>

        {/* Device Status Bar */}
        <div
          style={{
            height: '42px',
            padding: '10px 18px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.72rem',
            color: '#FFFFFF',
            fontWeight: '600',
            zIndex: 5,
            background: 'transparent'
          }}
        >
          <span>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={13} />
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0.5rem 0.6rem 2rem'
          }}
        >
          <PublicCard profile={profile} token={token} isPreview={true} />
        </div>

        {/* iOS Home Indicator Bar */}
        <div
          style={{
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent'
          }}
        >
          <div style={{ width: '120px', height: '4px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '2px' }} />
        </div>
      </div>
    </div>
  );
}
