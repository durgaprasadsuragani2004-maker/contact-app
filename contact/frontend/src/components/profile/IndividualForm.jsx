import React from 'react';
import {
  User,
  Briefcase,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  Palette,
  Crosshair,
  Compass,
  Layers
} , Layers } from 'lucide-react';
import ImageUploader from './ImageUploader';
import SocialLinksManager from './SocialLinksManager';

const THEME_PRESETS = [
  { name: 'Indigo Aura', color: '#4F46E5' },
  { name: 'Emerald Luxe', color: '#10B981' },
  { name: 'Cyber Cyan', color: '#06B6D4' },
  { name: 'Royal Purple', color: '#8B5CF6' },
  { name: 'Rose Gold', color: '#F43F5E' },
  { name: 'Amber Sunset', color: '#F59E0B' },
  { name: 'Midnight Obsidian', color: '#334155' }
];

export default function IndividualForm({ formData, onChange, onImageUploaded }) {
  const handleInputChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onChange({
            ...formData,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6)
          });
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err.message);
        }
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Profile Picture & Core Identity */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} color="var(--primary-400)" />
          Personal & Professional Identity
        </h4>

        <ImageUploader
          label="Profile Photo / Avatar"
          field="profile_photo"
          currentImage={formData.profile_photo}
          onImageUploaded={(url) => {
            handleInputChange('profile_photo', url);
            if (onImageUploaded) onImageUploaded(url);
          }}
        />

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">
              <span>Full Name <span className="required">*</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><User size={16} /></span>
              <input
                type="text"
                className="form-input input-has-icon"
                placeholder="e.g. Rahul Sharma"
                value={formData.full_name || ''}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Job Title / Designation <span className="optional">(e.g. Lead Architect)</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Briefcase size={16} /></span>
              <input
                type="text"
                className="form-input input-has-icon"
                placeholder="e.g. Principal Solutions Architect"
                value={formData.designation || ''}
                onChange={(e) => handleInputChange('designation', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">
              <span>Department</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cloud & AI Engineering"
              value={formData.department || ''}
              onChange={(e) => handleInputChange('department', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Company Display Name</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Building size={16} /></span>
              <input
                type="text"
                className="form-input input-has-icon"
                placeholder="e.g. TechNova Solutions"
                value={formData.company_name || ''}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Official Legal Entity Name</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. TechNova Solutions Pvt Ltd"
              value={formData.official_company_name || ''}
              onChange={(e) => handleInputChange('official_company_name', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. Direct Contact Channels */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Phone size={18} color="#10B981" />
          Direct Contact Information
        </h4>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">
              <span>Primary Phone Number <span className="required">*</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Phone size={16} /></span>
              <input
                type="tel"
                className="form-input input-has-icon"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Alternative / Office Line</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Phone size={16} /></span>
              <input
                type="tel"
                className="form-input input-has-icon"
                placeholder="e.g. +91 80 1234 5678"
                value={formData.alternate_phone || ''}
                onChange={(e) => handleInputChange('alternate_phone', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">
              <span>Official Email Address <span className="required">*</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Mail size={16} /></span>
              <input
                type="email"
                className="form-input input-has-icon"
                placeholder="e.g. rahul@technova.io"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Website / Portfolio URL</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Globe size={16} /></span>
              <input
                type="url"
                className="form-input input-has-icon"
                placeholder="e.g. https://technova.io"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Location, Coordinates & Navigation */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#F59E0B" />
              Location, Address & GPS Navigation
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Used by visitors to open 1-tap "Get Directions" in Google Maps / Apple Maps.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            <Crosshair size={14} /> Detect Coordinates
          </button>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label"><span>Address Line 1 (Building / Street)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Block B, 4th Floor, Tech Park"
              value={formData.address_line_1 || formData.address || ''}
              onChange={(e) => {
                handleInputChange('address_line_1', e.target.value);
                handleInputChange('address', e.target.value);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><span>Address Line 2 (Area / District)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Outer Ring Road, Bellandur"
              value={formData.address_line_2 || ''}
              onChange={(e) => handleInputChange('address_line_2', e.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label"><span>City</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bangalore"
              value={formData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><span>State / Province</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Karnataka"
              value={formData.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
            />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label"><span>Country</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. India"
              value={formData.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><span>Pincode / Postal Code</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 560103"
              value={formData.pincode || ''}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><span>Landmark</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Near Ecospace Tech Park"
              value={formData.landmark || ''}
              onChange={(e) => handleInputChange('landmark', e.target.value)}
            />
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="grid-2" style={{ marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="form-group">
            <label className="form-label">
              <span>Latitude <span className="optional">(Exact Navigation)</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Compass
size={15} /></span>
              <input
                type="number"
                step="any"
                className="form-input input-has-icon"
                placeholder="e.g. 12.9279"
                value={formData.latitude || ''}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Longitude <span className="optional">(Exact Navigation)</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Compass
size={15} /></span>
              <input
                type="number"
                step="any"
                className="form-input input-has-icon"
                placeholder="e.g. 77.6271"
                value={formData.longitude || ''}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Professional Bio & Overview */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="#A5B4FC" />
          Professional Bio & Summary
        </h4>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <span>Short Bio / Professional Statement</span>
            <span className="optional">Included in vCard Note</span>
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Introduce your expertise, key skills, and what you do..."
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
          />
        </div>
      </div>

      {/* 5. Dynamic Social Links Manager */}
      <SocialLinksManager
        links={formData.social_links || []}
        onChange={(updatedLinks) => handleInputChange('social_links', updatedLinks)}
      />

      {/* 6. Profile Presentation Mode (Feature 5: Work vs Personal) */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--primary-400)" />
          Profile Presentation Mode
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Switch between showcasing all your links, your professional persona, or your personal profile.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          {[
            { id: 'all', label: 'All-in-One', desc: 'Display all social & work links', icon: '🌐' },
            { id: 'work', label: 'Work Mode', desc: 'Only links tagged as Work or All', icon: '💼' },
            { id: 'personal', label: 'Personal Mode', desc: 'Only links tagged as Personal or All', icon: '👤' }
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleInputChange('activeMode', mode.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '1rem',
                borderRadius: '14px',
                background: (formData.activeMode || 'all') === mode.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: (formData.activeMode || 'all') === mode.id ? '2px solid var(--primary-500)' : '1px solid var(--border-glass)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>{mode.icon}</span>
              <span style={{ fontSize: '0.92rem', fontWeight: '700', color: '#F8FAFC' }}>{mode.label}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{mode.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Card Theme & Customization */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Palette size={18} color="var(--primary-400)" />
          Digital Card Aesthetics & Theme
        </h4>

        {/* Card Style Selector */}
        <div className="form-group">
          <label className="form-label"><span>Visual Card Style</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            {[
              { id: 'modern', name: 'Modern Gradient', desc: 'Vibrant curves & rich gradients' },
              { id: 'glassmorphism', name: 'Glassmorphism', desc: 'Frosted glass & translucent blur' },
              { id: 'minimal', name: 'Minimalist Slate', desc: 'Monochrome contrast & clean lines' }
            ].map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  const curr = formData.theme || {};
                  onChange({ ...formData, theme: { ...curr, cardStyle: style.id } });
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '0.85rem 1rem',
                  borderRadius: '14px',
                  background: (formData.theme?.cardStyle || 'modern') === style.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: (formData.theme?.cardStyle || 'modern') === style.id ? '2px solid var(--primary-500)' : '1px solid var(--border-glass)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#F8FAFC' }}>{style.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{style.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color Palette */}
        <div className="form-group" style={{ marginTop: '1.25rem' }}>
          <label className="form-label"><span>Accent Theme Color</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.4rem', alignItems: 'center' }}>
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.color}
                type="button"
                onClick={() => {
                  const curr = formData.theme || {};
                  onChange({
                    ...formData,
                    theme_color: preset.color,
                    theme: { ...curr, primaryColor: preset.color }
                  });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: (formData.theme?.primaryColor || formData.theme_color) === preset.color ? `2px solid ${preset.color}` : '1px solid var(--border-glass)',
                  color: '#F8FAFC',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: preset.color }} />
                <span>{preset.name}</span>
              </button>
            ))}
            <input
              type="color"
              value={formData.theme?.primaryColor || formData.theme_color || '#4F46E5'}
              onChange={(e) => {
                const curr = formData.theme || {};
                onChange({
                  ...formData,
                  theme_color: e.target.value,
                  theme: { ...curr, primaryColor: e.target.value }
                });
              }}
              style={{ width: '36px', height: '36px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }}
              title="Pick Custom Color"
            />
          </div>
        </div>

        {/* Typography / Font Family */}
        <div className="form-group" style={{ marginTop: '1.25rem' }}>
          <label className="form-label"><span>Card Typography & Font</span></label>
          <select
            className="form-select"
            value={formData.theme?.fontFamily || 'Inter'}
            onChange={(e) => {
              const curr = formData.theme || {};
              onChange({ ...formData, theme: { ...curr, fontFamily: e.target.value } });
            }}
            style={{ maxWidth: '300px' }}
          >
            <option value="Inter">Inter (Clean & Professional)</option>
            <option value="Outfit">Outfit (Modern & Geometric)</option>
            <option value="Roboto">Roboto (Classic & Balanced)</option>
            <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary)</option>
            <option value="Space Grotesk">Space Grotesk (Tech & Creative)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <label className="form-label"><span>Custom Badge Pill <span className="optional">(e.g. Verified Member, Speaker)</span></span></label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Verified Cloud Architect"
            value={formData.badge_text || ''}
            onChange={(e) => handleInputChange('badge_text', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
