import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  User,
  ShieldCheck,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Send,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Youtube,
  Facebook,
  Briefcase,
  Clock,
  Layers,
  Info,
  Calendar,
  Users,
  Target,
  UserPlus,
  Compass,
  X,
  MessageSquare,
  Share2
} from 'lucide-react';
import AddContactButton from './AddContactButton';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';

export default function PublicCard({ profile, token, isPreview = false }) {
  const [copiedField, setCopiedField] = useState(null);
  const [downloadingPersonId, setDownloadingPersonId] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  if (!profile) return null;

  const isCompany = profile.account_type === 'company';
  const themeColor = profile.theme?.primaryColor || profile.theme_color || '#4F46E5';
  const cardStyle = profile.theme?.cardStyle || 'modern';
  const fontFamily = profile.theme?.fontFamily || 'Inter';
  const activeMode = profile.activeMode || 'all';

  const displayName = isCompany
    ? (profile.official_company_name || profile.company_name || 'Organization')
    : (profile.full_name || 'Contact');

  const photoUrl = isCompany
    ? (profile.company_logo || profile.profile_photo)
    : (profile.profile_photo || profile.company_logo);

  const getInitials = (name) => {
    if (!name) return 'QL';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Social Share Handlers
  const cardShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${profile.token || token || profile.username || ''}`
    : '';

  const shareText = `Check out ${displayName}'s digital business card on QRLync:`;

  const handleCopyShareLink = () => {
    if (!cardShareUrl) return;
    navigator.clipboard.writeText(cardShareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + cardShareUrl)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cardShareUrl)}`;
    window.open(liUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(cardShareUrl)}`;
    window.open(twUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTriggerShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} | QRLync Digital Card`,
          text: shareText,
          url: cardShareUrl
        });
        return;
      } catch (err) {
        // Fall back to modal if cancelled or unsupported
      }
    }
    setShowShareModal(true);
  };

  // Build Full Formatted Address
  const addressParts = [
    profile.address_line_1,
    profile.address_line_2,
    profile.address,
    profile.landmark,
    profile.city,
    profile.state,
    profile.pincode,
    profile.country
  ].filter(Boolean);

  const fullAddressString = addressParts.join(', ');

  // Build Get Directions URL
  let directionsUrl = null;
  if (profile.latitude && profile.longitude) {
    directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${profile.latitude},${profile.longitude}`;
  } else if (fullAddressString) {
    directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddressString)}`;
  }

  // Find WhatsApp link if provided
  let whatsappLink = null;
  if (Array.isArray(profile.social_links)) {
    const wa = profile.social_links.find(l => l.platform === 'whatsapp');
    if (wa && wa.url) whatsappLink = wa.url;
  }
  if (!whatsappLink && profile.phone) {
    const cleanDigits = profile.phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length >= 10) whatsappLink = `https://wa.me/${cleanDigits}`;
  }

  // Handle Representative individual vCard download
  const handleDownloadPersonVCard = (person) => {
    setDownloadingPersonId(person.id);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });

    const link = document.createElement('a');
    link.href = `/api/contact/${token}/person/${person.id}`;
    link.setAttribute('download', `${(person.name || 'contact').replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloadingPersonId(null), 3000);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setLeadError('');

    if (!leadForm.name || !leadForm.name.trim()) {
      setLeadError('Please provide your full name.');
      return;
    }
    if (!leadForm.email?.trim() && !leadForm.phone?.trim()) {
      setLeadError('Please provide either an email or phone number.');
      return;
    }

    setLeadSubmitting(true);
    try {
      const identifier = profile.username || token;
      const res = await api.captureLead(identifier, leadForm);
      if (res.success) {
        setLeadSuccess(true);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          setShowLeadModal(false);
          setLeadSuccess(false);
          setLeadForm({ name: '', email: '', phone: '', note: '' });
        }, 3000);
      } else {
        setLeadError(res.message || 'Failed to exchange contact.');
      }
    } catch (err) {
      setLeadError(err.message || 'Failed to exchange contact details.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  const getCardStyleObj = () => {
    const base = { fontFamily: fontFamily || 'Inter' };
    if (cardStyle === 'glassmorphism') {
      return {
        ...base,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: `0 24px 60px rgba(0, 0, 0, 0.6), 0 0 25px ${themeColor}22`
      };
    }
    if (cardStyle === 'minimal') {
      return {
        ...base,
        background: '#090D14',
        border: '1px solid #1E293B',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
        borderRadius: '16px'
      };
    }
    return {
      ...base,
      borderTop: `4px solid ${themeColor}`,
      boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 20px ${themeColor}18`
    };
  };

  return (
    <div className="public-card" style={getCardStyleObj()}>
      {/* Banner / Cover Header */}
      <div
        className="public-banner"
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, #0B0F19 100%)`,
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 3, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {activeMode !== 'all' && (
            <span
              className="badge"
              style={{
                backdropFilter: 'blur(8px)',
                background: 'rgba(99, 102, 241, 0.35)',
                color: '#E0E7FF',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {activeMode === 'work' ? '💼 Work Mode' : '👤 Personal Mode'}
            </span>
          )}
          <span className={`badge ${isCompany ? 'badge-company' : 'badge-individual'}`} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.4)' }}>
            {isCompany ? <Building2 size={12} /> : <User size={12} />}
            {isCompany ? 'Company' : 'Individual'}
          </span>
        </div>
      </div>

      {/* Profile Photo / Avatar */}
      <div className="public-avatar-container">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={displayName}
            className="public-avatar"
            style={{ borderRadius: isCompany ? '22px' : '50%' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="public-avatar-placeholder"
          style={{
            display: photoUrl ? 'none' : 'flex',
            borderRadius: isCompany ? '22px' : '50%',
            background: `linear-gradient(135deg, ${themeColor}, #0F172A)`
          }}
        >
          {getInitials(displayName)}
        </div>
      </div>

      {/* Main Info Section */}
      <div style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem'
          }}
        >
          {displayName}
          {profile.badge_text && (
            <span title={profile.badge_text}>
              <ShieldCheck size={18} color="#06B6D4" />
            </span>
          )}
        </h2>

        {/* Designation & Department */}
        {profile.designation && (
          <p style={{ fontSize: '0.92rem', color: '#E2E8F0', fontWeight: '600', marginTop: '0.2rem' }}>
            {profile.designation}
            {profile.department && <span style={{ color: 'var(--text-muted)' }}> • {profile.department}</span>}
          </p>
        )}

        {/* Company Association */}
        {!isCompany && (profile.company_name || profile.official_company_name) && (
          <p style={{ fontSize: '0.85rem', color: 'var(--primary-300)', marginTop: '0.15rem' }}>
            {profile.official_company_name || profile.company_name}
          </p>
        )}

        {/* Company Contact Person & Industry */}
        {isCompany && profile.contact_person_name && (
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Key Contact: <strong style={{ color: '#FFFFFF' }}>{profile.contact_person_name}</strong>
          </p>
        )}

        {isCompany && profile.industry && (
          <div style={{ marginTop: '0.5rem' }}>
            <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
              {profile.industry}
            </span>
          </div>
        )}

        {/* Primary CTA: Add Contact Button (vCard), Exchange Contact & Share Card */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 160px' }}>
              <AddContactButton token={token} profile={profile} size="large" />
            </div>
            <button
              type="button"
              onClick={() => setShowLeadModal(true)}
              className="btn btn-secondary"
              style={{
                flex: '1 1 160px',
                padding: '0.85rem 1rem',
                fontSize: '0.92rem',
                fontWeight: '700',
                borderRadius: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <UserPlus size={18} color="var(--primary-400)" />
              <span>Exchange Contact</span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleTriggerShare}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.88rem',
              fontWeight: '600',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(56, 189, 248, 0.08)',
              color: '#38BDF8'
            }}
            title="Share this digital card via WhatsApp, LinkedIn, Twitter/X, or Copy Link"
          >
            <Share2 size={16} color="#38BDF8" />
            <span>Share Card</span>
          </button>
        </div>

        {/* 1-Tap Quick Action Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.75rem 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap'
          }}
        >
          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              className="quick-action-btn"
              title="Call"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <Phone size={18} />
            </a>
          )}

          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="quick-action-btn"
              title="Email"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818CF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              <Mail size={18} />
            </a>
          )}

          {whatsappLink && (
            <a
              href={whatsappLink.startsWith('http') ? whatsappLink : `https://wa.me/${whatsappLink.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-action-btn"
              title="WhatsApp"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(37, 211, 102, 0.15)',
                color: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(37, 211, 102, 0.3)'
              }}
            >
              <Phone size={18} />
            </a>
          )}

          {profile.website && (
            <a
              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-action-btn"
              title="Website"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06B6D4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(6, 182, 212, 0.3)'
              }}
            >
              <Globe size={18} />
            </a>
          )}

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-action-btn"
              title="Get Directions"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              <Navigation size={18} />
            </a>
          )}
        </div>

        {/* 1. Bio / Executive Overview */}
        {profile.bio && (
          <div style={{ textAlign: 'left', marginTop: '1.25rem', padding: '1rem 1.15rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.35rem' }}>
              {isCompany ? 'About Company' : 'About'}
            </p>
            <p style={{ fontSize: '0.88rem', color: '#E2E8F0', lineHeight: '1.55', whiteSpace: 'pre-line' }}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* 2. Multiple Company Contacts Section (If Company and has contacts) */}
        {isCompany && Array.isArray(profile.company_contacts) && profile.company_contacts.length > 0 && (
          <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={14} color="#10B981" />
              Key Team & Representatives
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {profile.company_contacts.map((contact) => (
                <div
                  key={contact.id}
                  style={{
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', color: '#F8FAFC', fontWeight: '700' }}>{contact.name}</h4>
                      {contact.designation && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--primary-300)', fontWeight: '600' }}>
                          {contact.designation} {contact.department && `• ${contact.department}`}
                        </p>
                      )}
                      {contact.notes && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{contact.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions for this specific representative */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center', marginTop: '0.2rem' }}>
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}>
                        <Phone size={13} color="#10B981" /> Call
                      </a>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}>
                        <Mail size={13} color="#818CF8" /> Email
                      </a>
                    )}
                    {contact.linkedin && (
                      <a href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}>
                        <Linkedin size={13} color="#0A66C2" /> LinkedIn
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDownloadPersonVCard(contact)}
                      className="btn btn-emerald btn-sm"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', marginLeft: 'auto' }}
                      title={`Download ${contact.name}'s vCard`}
                    >
                      <UserPlus size={13} />
                      <span>{downloadingPersonId === contact.id ? 'Saved!' : `Save Contact`}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Services & Products Catalog */}
        {isCompany && Array.isArray(profile.services) && profile.services.length > 0 && (
          <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={14} color="#8B5CF6" />
              Our Services & Solutions
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
              {profile.services.map((service) => (
                <div
                  key={service.id}
                  style={{
                    padding: '0.9rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.92rem', color: '#FFFFFF', fontWeight: '700' }}>{service.title}</h4>
                    {service.link_url && (
                      <a href={service.link_url.startsWith('http') ? service.link_url : `https://${service.link_url}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-400)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        Learn More <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                  {service.description && (
                    <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '4px', lineHeight: '1.45' }}>
                      {service.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Know More About Us (Mission, Vision, Company Details) */}
        {isCompany && (profile.about_us || profile.mission || profile.vision || profile.founded_year || profile.employee_count) && (
          <div style={{ textAlign: 'left', marginTop: '1.5rem', padding: '1rem 1.15rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={14} color="#A5B4FC" />
              Know More About Us
            </p>

            {profile.about_us && (
              <p style={{ fontSize: '0.85rem', color: '#E2E8F0', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                {profile.about_us}
              </p>
            )}

            {profile.mission && (
              <div style={{ marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Our Mission</span>
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '1px' }}>{profile.mission}</p>
              </div>
            )}

            {profile.vision && (
              <div style={{ marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Our Vision</span>
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '1px' }}>{profile.vision}</p>
              </div>
            )}

            {/* Quick Metrics (Founded, Employees, Areas) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {profile.founded_year && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Founded</span>
                  <strong style={{ fontSize: '0.82rem', color: '#F8FAFC' }}>{profile.founded_year}</strong>
                </div>
              )}
              {profile.employee_count && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Headcount</span>
                  <strong style={{ fontSize: '0.82rem', color: '#F8FAFC' }}>{profile.employee_count}</strong>
                </div>
              )}
              {profile.areas_served && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Areas Served</span>
                  <strong style={{ fontSize: '0.82rem', color: '#F8FAFC' }}>{profile.areas_served}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Business Operating Hours Table */}
        {isCompany && Array.isArray(profile.business_hours) && profile.business_hours.length > 0 && (
          <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} color="#F59E0B" />
              Business Operating Hours
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
              {profile.business_hours.map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.8rem',
                    borderBottom: i < profile.business_hours.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    background: h.is_closed ? 'rgba(0,0,0,0.1)' : 'transparent'
                  }}
                >
                  <span style={{ color: h.is_closed ? 'var(--text-muted)' : '#F8FAFC', fontWeight: '500' }}>{h.day_of_week}</span>
                  <span style={{ color: h.is_closed ? '#FB7185' : '#6EE7B7', fontWeight: '600' }}>
                    {h.is_closed ? 'Closed' : `${h.open_time} - ${h.close_time}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Interactive Location & "Get Directions" Card */}
        {fullAddressString && (
          <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} color="#F59E0B" />
              {isCompany ? 'Office Location & Navigation' : 'Location'}
            </p>

            <div
              style={{
                padding: '1rem 1.15rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <p style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: '600', lineHeight: '1.4' }}>
                {profile.address_line_1 || profile.address}
              </p>
              {profile.address_line_2 && (
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '2px' }}>{profile.address_line_2}</p>
              )}
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '2px' }}>
                {[profile.city, profile.state, profile.pincode, profile.country].filter(Boolean).join(', ')}
              </p>
              {profile.landmark && (
                <p style={{ fontSize: '0.78rem', color: 'var(--primary-300)', marginTop: '4px' }}>
                  📍 Landmark: {profile.landmark}
                </p>
              )}

              {/* Get Directions & View on Map CTA Buttons */}
              {directionsUrl && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, minWidth: '130px', padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    <Navigation size={14} />
                    Get Directions
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.latitude && profile.longitude ? `${profile.latitude},${profile.longitude}` : fullAddressString)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    <MapPin size={14} />
                    View Map
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. Contact Details Channels List */}
        <div style={{ textAlign: 'left', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.15rem' }}>
            Direct Contact Details
          </p>

          {profile.phone && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.9rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                <Phone size={16} color="#10B981" />
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Primary Line</span>
                  <a href={`tel:${profile.phone}`} style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: '500' }}>
                    {profile.phone}
                  </a>
                </div>
              </div>
              <button onClick={() => copyToClipboard(profile.phone, 'phone')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}>
                {copiedField === 'phone' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
              </button>
            </div>
          )}

          {profile.alternate_phone && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.9rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                <Phone size={16} color="#06B6D4" />
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Alternative / Support</span>
                  <a href={`tel:${profile.alternate_phone}`} style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: '500' }}>
                    {profile.alternate_phone}
                  </a>
                </div>
              </div>
              <button onClick={() => copyToClipboard(profile.alternate_phone, 'alt_phone')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}>
                {copiedField === 'alt_phone' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
              </button>
            </div>
          )}

          {profile.email && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.9rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                <Mail size={16} color="#818CF8" />
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                  <a href={`mailto:${profile.email}`} style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: '500', wordBreak: 'break-all' }}>
                    {profile.email}
                  </a>
                </div>
              </div>
              <button onClick={() => copyToClipboard(profile.email, 'email')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}>
                {copiedField === 'email' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
              </button>
            </div>
          )}

          {profile.website && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.9rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                <Globe size={16} color="#38BDF8" />
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Website</span>
                  <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.88rem', color: 'var(--primary-300)', fontWeight: '500', wordBreak: 'break-all' }}>
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
              <ExternalLink size={14} color="var(--text-muted)" />
            </div>
          )}

          {isCompany && profile.gst_number && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem 0.9rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <FileText size={16} color="#A5B4FC" />
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>GST / Tax Registration ID</span>
                <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontFamily: 'monospace' }}>{profile.gst_number}</span>
              </div>
            </div>
          )}
        </div>

        {/* 8. Social Media & Professional Grid */}
        {Array.isArray(profile.social_links) && profile.social_links.length > 0 && (
          <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.65rem' }}>
              Connect & Follow
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
              {profile.social_links.map((link, idx) => {
                const url = link.url && (link.url.startsWith('http') ? link.url : `https://${link.url}`);
                if (!url) return null;

                const getIcon = (plat) => {
                  switch (plat) {
                    case 'linkedin': return <Linkedin size={16} color="#0A66C2" />;
                    case 'github': return <Github size={16} color="#FFFFFF" />;
                    case 'twitter': return <Twitter size={16} color="#38BDF8" />;
                    case 'whatsapp': return <Phone size={16} color="#25D366" />;
                    case 'telegram': return <Send size={16} color="#229ED9" />;
                    case 'instagram': return <Instagram size={16} color="#E1306C" />;
                    case 'youtube': return <Youtube size={16} color="#FF0000" />;
                    case 'facebook': return <Facebook size={16} color="#1877F2" />;
                    default: return <Globe size={16} color="#06B6D4" />;
                  }
                };

                return (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                    className="hover-pop"
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {getIcon(link.platform)}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.label || link.platform}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Branding */}
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Digital Profile Ecosystem Powered by <strong>QRLync</strong>
          </p>
        </div>
      </div>

      {/* Feature 4: Exchange Contact / Connect Modal */}
      {showLeadModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowLeadModal(false)}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '2rem',
              borderRadius: '24px',
              background: '#0F172A',
              border: `1px solid ${themeColor}44`,
              boxShadow: `0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px ${themeColor}22`,
              textAlign: 'left',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowLeadModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${themeColor}22`, color: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#F8FAFC' }}>Exchange Contact</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Send your contact info directly to <strong>{displayName}</strong>.
            </p>

            {leadSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Check size={32} />
                </div>
                <h4 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '0.4rem' }}>Details Sent!</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Thank you! Your contact details have been successfully shared with {displayName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {leadError && (
                  <div style={{ padding: '0.65rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', color: '#FB7185', fontSize: '0.82rem' }}>
                    {leadError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>
                    <span>Your Full Name <span style={{ color: '#FB7185' }}>*</span></span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Alex Taylor"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="alex@example.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 000-1122"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>
                    <span>Note / Message <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(optional)</span></span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Great meeting you..."
                    value={leadForm.note}
                    onChange={(e) => setLeadForm({ ...leadForm, note: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', fontWeight: '700' }}
                >
                  {leadSubmitting ? 'Sending Details...' : 'Send Contact Details'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Share Card Modal */}
      {showShareModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowShareModal(false);
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '1.75rem',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38BDF8'
                  }}
                >
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Share Digital Card</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Share {displayName}'s profile</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Social Sharing Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 0.5rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  background: 'rgba(37, 211, 102, 0.1)',
                  color: '#25D366',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="hover-bright"
                title="Share directly via WhatsApp"
              >
                <MessageSquare size={24} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>WhatsApp</span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={handleShareLinkedIn}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 0.5rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(10, 102, 194, 0.3)',
                  background: 'rgba(10, 102, 194, 0.1)',
                  color: '#38BDF8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="hover-bright"
                title="Share directly via LinkedIn"
              >
                <Linkedin size={24} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>LinkedIn</span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={handleShareTwitter}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 0.5rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="hover-bright"
                title="Share directly via Twitter / X"
              >
                <Twitter size={24} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Twitter / X</span>
              </button>
            </div>

            {/* Direct Copy Link Input */}
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '600' }}>
                Direct Card URL
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  readOnly
                  value={cardShareUrl}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    color: '#E2E8F0',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                  onClick={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.35rem', padding: '0.5rem 0.85rem' }}
                >
                  {shareCopied ? (
                    <>
                      <Check size={15} color="#10B981" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
