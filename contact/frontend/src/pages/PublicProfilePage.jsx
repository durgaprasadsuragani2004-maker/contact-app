import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import PublicCard from '../components/public/PublicCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AlertCircle, QrCode, Sparkles, ShieldOff, ArrowLeft } from 'lucide-react';

export default function PublicProfilePage() {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPublicProfile() {
      if (!token) {
        setError('No profile token provided in URL.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await api.getPublicProfile(token);
        if (data.success) {
          setProfile(data.profile);
        } else {
          setError(data.message || 'Profile not found.');
        }
      } catch (err) {
        setError(err.message || 'Could not load digital profile. The QR code may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    }

    loadPublicProfile();
  }, [token]);

  // Dynamically update document title and social OG / Twitter meta tags
  useEffect(() => {
    if (!profile) return;

    const meta = profile.metadata || {};
    const displayName = profile.account_type === 'company'
      ? (profile.official_company_name || profile.company_name || 'Organization')
      : (profile.full_name || 'Contact');
    const jobTitle = profile.account_type === 'company'
      ? (profile.industry || '')
      : (profile.designation || profile.job_title || '');

    const title = meta.title || `${displayName}${jobTitle ? ` - ${jobTitle}` : ''} | QRLync`;
    const description = meta.bio || meta.ogDescription || profile.bio || `Digital business card and verified contact profile of ${displayName}.`;
    const image = meta.avatarUrl || meta.ogImage || profile.profile_photo || profile.company_logo || '';
    const currentUrl = window.location.href;

    document.title = title;

    const setMetaTag = (attrName, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', meta.ogTitle || title);
    setMetaTag('property', 'og:description', description);
    if (image) setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', 'profile');

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', meta.ogTitle || title);
    setMetaTag('name', 'twitter:description', description);
    if (image) setMetaTag('name', 'twitter:image', image);

    return () => {
      document.title = 'QRLync | Digital Contact & Company Profile System';
    };
  }, [profile]);

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading Digital Contact Card..." />;
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: '480px', margin: '4rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '2.5rem 1.5rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: '#FB7185'
            }}
          >
            <ShieldOff size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem' }}>Profile Unavailable</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            {error || 'The requested digital contact card does not exist or has been made private.'}
          </p>

          <Link to="/" className="btn btn-primary btn-sm">
            <ArrowLeft size={16} />
            Go to QRLync Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-card-wrapper">
      {/* Standalone Digital Contact Card */}
      <PublicCard profile={profile} token={token} />

      {/* Clean Bottom Footer for QR Scanners */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link
          to="/register"
          className="glass-panel hover-bright"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            color: '#F8FAFC',
            textDecoration: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <QrCode size={15} color="var(--primary-400)" />
          <span>Create your own free <strong>QR Digital Card</strong></span>
          <Sparkles size={13} color="#F59E0B" />
        </Link>
      </div>
    </div>
  );
}
