import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { Download, Share2, Copy, Printer, RefreshCw, Check, ExternalLink, ShieldAlert } from 'lucide-react';
import Modal from '../common/Modal';

export default function QRCodeCard({ profile, qrCode }) {
  const { regenerateQRCode, showToast } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!qrCode) return null;

  const publicUrl = `${window.location.origin}/profile/${qrCode.token}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      showToast('Profile link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      showToast('Failed to copy link automatically.', 'error');
    }
  };

  const handleShare = async () => {
    const title = profile?.account_type === 'company'
      ? (profile?.official_company_name || profile?.company_name || 'Company Profile')
      : (profile?.full_name || 'Digital Profile');

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} | Digital Contact Card`,
          text: `Scan or open to connect with ${title}:`,
          url: publicUrl
        });
      } catch (e) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadPNG = () => {
    const svgElement = document.getElementById('qr-canvas-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1024;
    canvas.height = 1024;

    img.onload = () => {
      ctx.fillStyle = qrLight || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 64, 64, 896, 896);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QRLync_${(profile?.full_name || profile?.company_name || 'card').replace(/\s+/g, '_')}_QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      showToast('High-resolution QR Code (PNG) downloaded!', 'success');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('qr-canvas-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `QRLync_${(profile?.full_name || profile?.company_name || 'card').replace(/\s+/g, '_')}_QR.svg`;
    downloadLink.click();
    URL.revokeObjectURL(url);
    showToast('Vector QR Code (SVG) downloaded!', 'success');
  };

  const confirmRegeneration = async () => {
    setIsRegenerating(true);
    await regenerateQRCode();
    setIsRegenerating(false);
    setShowRegenModal(false);
  };

  const qrDark = qrCode.darkColor || profile?.theme_color || '#0B0F19';
  const qrLight = qrCode.lightColor || '#FFFFFF';

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ marginBottom: '1.25rem', width: '100%' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Your Unique Profile QR Code</h3>
        <p style={{ fontSize: '0.84rem', marginTop: '3px' }}>
          Anyone who scans this will instantly access your live digital profile and download your contact.
        </p>
      </div>

      {/* QR Code Container with sleek white canvas */}
      <div
        style={{
          background: qrLight,
          padding: '1.25rem',
          borderRadius: '20px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
          display: 'inline-flex',
          position: 'relative',
          marginBottom: '1.25rem'
        }}
      >
        <QRCodeSVG
          id="qr-canvas-svg"
          value={publicUrl}
          size={200}
          level="H"
          includeMargin={false}
          fgColor={qrDark}
          bgColor={qrLight}
        />
      </div>

      {/* Public URL Box */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-glass)',
          borderRadius: '12px',
          padding: '0.5rem 0.75rem',
          marginBottom: '1.25rem',
          gap: '0.5rem'
        }}
      >
        <input
          type="text"
          readOnly
          value={publicUrl}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            width: '100%',
            outline: 'none',
            textOverflow: 'ellipsis'
          }}
        />
        <button
          onClick={handleCopyLink}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.35rem 0.65rem', flexShrink: 0 }}
          title="Copy profile link"
        >
          {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Action Buttons Grid */}
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', marginBottom: '1rem' }}>
        <button onClick={handleDownloadPNG} className="btn btn-primary btn-sm">
          <Download size={15} />
          Download PNG
        </button>

        <button onClick={handleDownloadSVG} className="btn btn-secondary btn-sm">
          <Download size={15} />
          Download SVG
        </button>

        <button onClick={handleShare} className="btn btn-secondary btn-sm">
          <Share2 size={15} />
          Share Profile
        </button>

        <Link to="/profile/print" className="btn btn-secondary btn-sm">
          <Printer size={15} />
          Print Card / Badge
        </Link>
      </div>

      {/* Footer link to view & regenerate */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '0.85rem' }}>
        <Link
          to={`/profile/${qrCode.token}`}
          target="_blank"
          style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-400)' }}
        >
          <ExternalLink size={13} />
          Open Live Card in New Tab
        </Link>

        <button
          onClick={() => setShowRegenModal(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          className="hover-bright"
        >
          <RefreshCw size={12} />
          Regenerate QR Link
        </button>
      </div>

      {/* Regenerate Modal */}
      <Modal
        isOpen={showRegenModal}
        onClose={() => setShowRegenModal(false)}
        title="Regenerate Profile QR Code?"
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.25)', marginBottom: '1.25rem' }}>
            <ShieldAlert size={24} color="#FB7185" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: '#FECDD3' }}>
              <strong>Caution:</strong> Generating a new QR token will permanently invalidate previously printed physical QR codes or shared URLs.
            </p>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Only regenerate if your old link was leaked or you require a fresh link identifier.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setShowRegenModal(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              onClick={confirmRegeneration}
              disabled={isRegenerating}
              className="btn btn-danger btn-sm"
            >
              {isRegenerating ? 'Regenerating...' : 'Yes, Regenerate QR'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
