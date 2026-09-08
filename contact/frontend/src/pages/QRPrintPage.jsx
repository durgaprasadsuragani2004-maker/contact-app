import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import {
  Printer,
  ArrowLeft,
  Building2,
  User,
  Palette,
  Download,
  Save,
  Check,
  RefreshCw,
  Sparkles,
  Sliders
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLOR_PRESETS = [
  { name: 'Classic Black', color: '#000000' },
  { name: 'Indigo Aura', color: '#4F46E5' },
  { name: 'Cyber Cyan', color: '#06B6D4' },
  { name: 'Emerald Luxe', color: '#10B981' },
  { name: 'Royal Purple', color: '#8B5CF6' },
  { name: 'Rose Red', color: '#F43F5E' },
  { name: 'Amber Glow', color: '#F59E0B' },
  { name: 'Deep Slate', color: '#1E293B' }
];

const BG_PRESETS = [
  { name: 'Pure White', color: '#FFFFFF' },
  { name: 'Soft Gray', color: '#F8FAFC' },
  { name: 'Light Cream', color: '#FFFBEB' },
  { name: 'Ice Blue', color: '#F0F9FF' },
  { name: 'Pale Mint', color: '#F0FDF4' }
];

export default function QRPrintPage() {
  const { user, profile, qrCode, updateQrCodeStyle, loading, showToast } = useAuth();

  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#FFFFFF');
  const [format, setFormat] = useState('png');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (qrCode) {
      if (qrCode.darkColor) setDarkColor(qrCode.darkColor);
      if (qrCode.lightColor) setLightColor(qrCode.lightColor);
      if (qrCode.format) setFormat(qrCode.format);
    }
  }, [qrCode]);

  if (loading || !profile || !qrCode) {
    return <LoadingSpinner fullScreen={true} text="Preparing print layout & customizer..." />;
  }

  const isCompany = profile.account_type === 'company';
  const displayName = isCompany
    ? (profile.official_company_name || profile.company_name || 'Organization')
    : (profile.full_name || 'Contact');

  const publicUrl = `${window.location.origin}/profile/${qrCode.token}`;
  const themeColor = profile.theme_color || profile.theme?.primaryColor || '#4F46E5';

  const handlePrint = () => {
    window.print();
  };

  const handleSaveStyle = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    const res = await updateQrCodeStyle({ darkColor, lightColor, format });
    setIsSaving(false);
    if (res?.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('preview-custom-qr');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `QRLync_${displayName.replace(/[^a-zA-Z0-9_-]/g, '_')}_QR.svg`;
    downloadLink.click();
    URL.revokeObjectURL(url);
    showToast('Vector QR Code (SVG) downloaded successfully!', 'success');
  };

  const handleDownloadPNG = () => {
    const svgElement = document.getElementById('preview-custom-qr');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1024;
    canvas.height = 1024;

    img.onload = () => {
      ctx.fillStyle = lightColor || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 64, 64, 896, 896);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QRLync_${displayName.replace(/[^a-zA-Z0-9_-]/g, '_')}_QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      showToast('High-Resolution QR Code (PNG) downloaded!', 'success');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div style={{ maxWidth: '920px', margin: '1rem auto 4rem', padding: '0 1rem' }}>
      {/* Top Action Header (Hidden in Print) */}
      <div
        className="glass-panel no-print"
        style={{
          padding: '1.25rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/dashboard" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h3 style={{ fontSize: '1.2rem' }}>QR Code Studio & Print Layout</h3>
        </div>

        <button onClick={handlePrint} className="btn btn-primary btn-sm">
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>

      {/* Feature 3: Customized QR Code Generation & Export Studio (Hidden in Print) */}
      <div
        className="glass-panel no-print"
        style={{
          padding: '1.75rem',
          marginBottom: '2rem',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Palette size={20} color="var(--primary-400)" />
          <h3 style={{ fontSize: '1.25rem' }}>Custom QR Styling & High-Resolution Export</h3>
          <span className="badge badge-verified" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
            <Sparkles size={12} /> Real-Time Preview
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem', alignItems: 'center' }}>
          {/* Controls Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Dark/Foreground Color */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F8FAFC', display: 'block', marginBottom: '0.4rem' }}>
                Foreground Pattern Color
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    title={p.name}
                    onClick={() => setDarkColor(p.color)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: p.color,
                      border: darkColor === p.color ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)',
                      boxShadow: darkColor === p.color ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.15s'
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                  title="Custom Color"
                />
                <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                  {darkColor}
                </span>
              </div>
            </div>

            {/* Light/Background Color */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F8FAFC', display: 'block', marginBottom: '0.4rem' }}>
                Background Canvas Color
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                {BG_PRESETS.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    title={p.name}
                    onClick={() => setLightColor(p.color)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: p.color,
                      border: lightColor === p.color ? '2px solid var(--primary-400)' : '1px solid rgba(255,255,255,0.2)',
                      boxShadow: lightColor === p.color ? '0 0 8px var(--primary-glow)' : 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                  title="Custom Background"
                />
                <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                  {lightColor}
                </span>
              </div>
            </div>

            {/* Default Format Toggle */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F8FAFC', display: 'block', marginBottom: '0.4rem' }}>
                Preferred Export Format
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`btn btn-sm ${format === 'png' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  PNG (Raster High-Res)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('svg')}
                  className={`btn btn-sm ${format === 'svg' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  SVG (Vector Infinite-Res)
                </button>
              </div>
            </div>

            {/* Save & Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleSaveStyle}
                disabled={isSaving}
                className="btn btn-primary btn-sm"
              >
                {savedSuccess ? <Check size={15} /> : <Save size={15} />}
                <span>{isSaving ? 'Saving...' : savedSuccess ? 'Style Saved!' : 'Save Style Preferences'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPNG}
                className="btn btn-secondary btn-sm"
              >
                <Download size={14} /> Download PNG
              </button>

              <button
                type="button"
                onClick={handleDownloadSVG}
                className="btn btn-secondary btn-sm"
              >
                <Download size={14} /> Download SVG
              </button>
            </div>
          </div>

          {/* Live Preview Box */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', padding: '1.75rem', borderRadius: '18px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Vector Preview
            </span>
            <div
              style={{
                background: lightColor,
                padding: '1.25rem',
                borderRadius: '16px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                display: 'inline-flex'
              }}
            >
              <QRCodeSVG
                id="preview-custom-qr"
                value={publicUrl}
                size={180}
                level="H"
                fgColor={darkColor}
                bgColor={lightColor}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.85rem' }}>
              High error correction (Level H) • Print-ready
            </span>
          </div>
        </div>
      </div>

      {/* Printable Sheet */}
      <div
        style={{
          background: '#FFFFFF',
          color: '#0F172A',
          padding: '3rem 2rem',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3rem'
        }}
      >
        {/* Print Option 1: Horizontal Business Card (Standard Ratio) */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <p className="no-print" style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Template 1: Modern Digital Business Card (Front & Back Layout)
          </p>

          <div
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: '2rem',
              justifyContent: 'center'
            }}
          >
            {/* Front of Card */}
            <div
              style={{
                width: '360px',
                height: '210px',
                background: '#0B0F19',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: `2px solid ${themeColor}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                textAlign: 'left'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isCompany ? 'Corporate Card' : (profile.company_name || 'Digital Contact')}
                </span>
                <h3 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginTop: '0.2rem' }}>{displayName}</h3>
                {profile.designation && (
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{profile.designation}</p>
                )}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {profile.phone && <div>📞 {profile.phone}</div>}
                {profile.email && <div>✉️ {profile.email}</div>}
                {profile.website && <div>🌐 {profile.website.replace(/^https?:\/\//, '')}</div>}
              </div>
            </div>

            {/* Back of Card with Styled QR */}
            <div
              style={{
                width: '360px',
                height: '210px',
                background: '#FFFFFF',
                color: '#0B0F19',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '2px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}
            >
              <div style={{ textAlign: 'left', maxWidth: '170px' }}>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: themeColor }}>Scan to Connect</div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px', lineHeight: '1.4' }}>
                  Scan with your smartphone camera to view profile and save vCard.
                </p>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.75rem', fontWeight: '600' }}>
                  Powered by QRLync
                </div>
              </div>

              <div style={{ padding: '0.5rem', background: lightColor, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <QRCodeSVG
                  value={publicUrl}
                  size={120}
                  level="H"
                  fgColor={darkColor}
                  bgColor={lightColor}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Print Option 2: Event Badge / Table Standee */}
        <div style={{ textAlign: 'center', width: '100%', borderTop: '2px dashed #E2E8F0', paddingTop: '2.5rem' }}>
          <p className="no-print" style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Template 2: Conference & Table Standee Badge
          </p>

          <div
            style={{
              width: '320px',
              margin: '0 auto',
              background: '#F8FAFC',
              border: `3px solid ${themeColor}`,
              borderRadius: '20px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'inline-block', padding: '0.3rem 0.85rem', background: themeColor, color: '#FFFFFF', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1rem' }}>
              {isCompany ? 'Company Standee' : 'Event Badge'}
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#0F172A', marginBottom: '0.25rem' }}>{displayName}</h3>
            {profile.designation && <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.25rem' }}>{profile.designation}</p>}

            <div style={{ background: lightColor, padding: '1rem', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
              <QRCodeSVG
                value={publicUrl}
                size={160}
                level="H"
                fgColor={darkColor}
                bgColor={lightColor}
              />
            </div>

            <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>
              SCAN TO VIEW PROFILE & SAVE CONTACT
            </p>
            <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
              {publicUrl.replace(/^https?:\/\//, '')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
