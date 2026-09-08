import React from 'react';
import {
  Building2,
  User,
  Briefcase,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  Palette,
  Crosshair,
  Compass,
  Info,
  Layers,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import ImageUploader from './ImageUploader';
import SocialLinksManager from './SocialLinksManager';
import CompanyContactsManager from './CompanyContactsManager';
import ServicesManager from './ServicesManager';
import BusinessHoursManager from './BusinessHoursManager';

const THEME_PRESETS = [
  { name: 'Teal Enterprise', color: '#0D9488' },
  { name: 'Ocean Blue', color: '#0284C7' },
  { name: 'Indigo Corporate', color: '#4F46E5' },
  { name: 'Emerald Prime', color: '#059669' },
  { name: 'Crimson Executive', color: '#BE123C' },
  { name: 'Amber Gold', color: '#D97706' },
  { name: 'Dark Slate', color: '#334155' }
];

export default function CompanyForm({ formData, onChange, onImageUploaded }) {
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
          console.warn('Geolocation unavailable:', err.message);
        }
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Corporate Identity & Logo */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={18} color="var(--primary-400)" />
          Organization Identity & Branding
        </h4>

        <ImageUploader
          label="Company Official Logo"
          field="company_logo"
          currentImage={formData.company_logo || formData.profile_photo}
          onImageUploaded={(url) => {
            handleInputChange('company_logo', url);
            if (onImageUploaded) onImageUploaded(url);
          }}
        />

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">
              <span>Official Registered Legal Entity Name <span className="required">*</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Building2 size={16} /></span>
              <input
                type="text"
                className="form-input input-has-icon"
                placeholder="e.g. Apex Cloud Solutions Inc."
                value={formData.official_company_name || formData.company_name || ''}
                onChange={(e) => {
                  handleInputChange('official_company_name', e.target.value);
                  handleInputChange('company_name', e.target.value);
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Industry / Domain <span className="required">*</span></span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cloud Infrastructure & Enterprise AI"
              value={formData.industry || ''}
              onChange={(e) => handleInputChange('industry', e.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">
              <span>GST / Tax / Registration ID <span className="optional">(Optional)</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><FileText size={16} /></span>
              <input
                type="text"
                className="form-input input-has-icon"
                placeholder="e.g. 29AABCU9603R1ZM / US-EIN-987654321"
                value={formData.gst_number || ''}
                onChange={(e) => handleInputChange('gst_number', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Brand Display / Trademark Name</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Apex Cloud"
              value={formData.company_name || ''}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. Primary Executive Representative */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} color="#06B6D4" />
          Primary Executive Contact Person
        </h4>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label"><span>Representative Name</span></label>
            <div className="input-wrapper">
              <span className="input-icon"><User size={16} /></span>
              <input
                type="text"
                className="form-input input-has-icon"
                placeholder="e.g. Sarah Jenkins"
                value={formData.contact_person_name || ''}
                onChange={(e) => handleInputChange('contact_person_name', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><span>Designation / Role</span></label>
            <div className="input-wrapper">
              <span className="input-icon"><Briefcase size={16} /></span>
              <input
                type="text"
                className="form-input input-has-icon"
                placeholder="e.g. VP of Enterprise Partnerships"
                value={formData.designation || ''}
                onChange={(e) => handleInputChange('designation', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><span>Department</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Global Growth & Partnerships"
              value={formData.department || ''}
              onChange={(e) => handleInputChange('department', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. Official Contact Channels */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Phone size={18} color="#10B981" />
          Official Contact Details
        </h4>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">
              <span>Official Phone Number <span className="required">*</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Phone size={16} /></span>
              <input
                type="tel"
                className="form-input input-has-icon"
                placeholder="e.g. +1 (415) 555-0199"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Toll-Free / Support Line</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Phone size={16} /></span>
              <input
                type="tel"
                className="form-input input-has-icon"
                placeholder="e.g. +1 (800) 555-APEX"
                value={formData.alternate_phone || ''}
                onChange={(e) => handleInputChange('alternate_phone', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">
              <span>Official Corporate Email <span className="required">*</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Mail size={16} /></span>
              <input
                type="email"
                className="form-input input-has-icon"
                placeholder="e.g. contact@apexcloud.com"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Company Website URL <span className="required">*</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Globe size={16} /></span>
              <input
                type="url"
                className="form-input input-has-icon"
                placeholder="e.g. https://apexcloud.com"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Headquarters, Coordinates & Navigation */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#F59E0B" />
              Corporate Headquarters & GPS Navigation
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Used by visitors to 1-tap "Get Directions" straight to your office.
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
            <label className="form-label"><span>Address Line 1 (Street / Building)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 500 Howard Street"
              value={formData.address_line_1 || formData.address || ''}
              onChange={(e) => {
                handleInputChange('address_line_1', e.target.value);
                handleInputChange('address', e.target.value);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><span>Address Line 2 (Suite / Floor)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Suite 400, SoMa District"
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
              placeholder="e.g. San Francisco"
              value={formData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><span>State / Province</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. California"
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
              placeholder="e.g. United States"
              value={formData.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><span>Zip / Postal Code</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 94105"
              value={formData.pincode || ''}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><span>Landmark</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Across from Salesforce Transit Center"
              value={formData.landmark || ''}
              onChange={(e) => handleInputChange('landmark', e.target.value)}
            />
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="grid-2" style={{ marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="form-group">
            <label className="form-label"><span>Latitude</span></label>
            <div className="input-wrapper">
              <span className="input-icon"><Compass size={15} /></span>
              <input
                type="number"
                step="any"
                className="form-input input-has-icon"
                placeholder="e.g. 37.7885"
                value={formData.latitude || ''}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><span>Longitude</span></label>
            <div className="input-wrapper">
              <span className="input-icon"><Compass size={15} /></span>
              <input
                type="number"
                step="any"
                className="form-input input-has-icon"
                placeholder="e.g. -122.3995"
                value={formData.longitude || ''}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Additional Company Contact Persons */}
      <CompanyContactsManager
        contacts={formData.company_contacts || []}
        onChange={(updatedContacts) => handleInputChange('company_contacts', updatedContacts)}
      />

      {/* 6. Services & Products Catalog */}
      <ServicesManager
        services={formData.services || []}
        onChange={(updatedServices) => handleInputChange('services', updatedServices)}
      />

      {/* 7. Know More About Us / Company Overview */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={18} color="#A5B4FC" />
          Know More About Us (Company Overview)
        </h4>

        <div className="form-group">
          <label className="form-label"><span>Company Overview / Elevator Pitch</span></label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Describe what your organization provides, client specialties, and mission..."
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label"><span>Corporate Mission Statement</span></label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. To empower global enterprises with autonomous, zero-trust cloud infrastructure..."
              value={formData.mission || ''}
              onChange={(e) => handleInputChange('mission', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><span>Corporate Vision</span></label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Pioneering the future of secure, self-optimizing multi-cloud systems..."
              value={formData.vision || ''}
              onChange={(e) => handleInputChange('vision', e.target.value)}
            />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label"><span>Founded Year</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 2018"
              value={formData.founded_year || ''}
              onChange={(e) => handleInputChange('founded_year', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><span>Employee Headcount</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 250+ Engineers"
              value={formData.employee_count || ''}
              onChange={(e) => handleInputChange('employee_count', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><span>Areas / Regions Served</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Global (Americas, EMEA, APAC)"
              value={formData.areas_served || ''}
              onChange={(e) => handleInputChange('areas_served', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 8. Business Operating Hours */}
      <BusinessHoursManager
        hours={formData.business_hours || []}
        onChange={(updatedHours) => handleInputChange('business_hours', updatedHours)}
      />

      {/* 9. Dynamic Social Links Manager */}
      <SocialLinksManager
        links={formData.social_links || []}
        onChange={(updatedLinks) => handleInputChange('social_links', updatedLinks)}
      />

      {/* 10. Presentation Mode (Feature 5) */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--primary-400)" />
          Organization Presentation Mode
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Choose which links and contact details to feature on your public digital card.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          {[
            { id: 'all', label: 'All Channels', desc: 'Display all channels & links', icon: '🌐' },
            { id: 'work', label: 'Business Focus', desc: 'Highlight commercial & work channels', icon: '🏢' },
            { id: 'personal', label: 'Direct Representative', desc: 'Direct rep & contact focal points', icon: '👤' }
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

      {/* 11. Theme Accent & Corporate Card Styling */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Palette size={18} color="var(--primary-400)" />
          Corporate Brand Styling & Theme
        </h4>

        {/* Card Style Selector */}
        <div className="form-group">
          <label className="form-label"><span>Visual Card Style</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            {[
              { id: 'modern', name: 'Modern Gradient', desc: 'Corporate curves & rich gradient banner' },
              { id: 'glassmorphism', name: 'Glassmorphism', desc: 'Frosted crystal glass & ambient blur' },
              { id: 'minimal', name: 'Minimalist Slate', desc: 'Clean high-contrast corporate lines' }
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

        {/* Accent Brand Color */}
        <div className="form-group" style={{ marginTop: '1.25rem' }}>
          <label className="form-label"><span>Accent Brand Color</span></label>
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
              value={formData.theme?.primaryColor || formData.theme_color || '#0D9488'}
              onChange={(e) => {
                const curr = formData.theme || {};
                onChange({
                  ...formData,
                  theme_color: e.target.value,
                  theme: { ...curr, primaryColor: e.target.value }
                });
              }}
              style={{ width: '36px', height: '36px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }}
              title="Pick Custom Brand Color"
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
            <option value="Inter">Inter (Clean & Corporate)</option>
            <option value="Outfit">Outfit (Modern & Geometric)</option>
            <option value="Roboto">Roboto (Solid & Reliable)</option>
            <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary)</option>
            <option value="Space Grotesk">Space Grotesk (Tech & Dynamic)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <label className="form-label"><span>Corporate Badge Text <span className="optional">(e.g. Enterprise Organization, ISO 9001)</span></span></label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Enterprise Organization"
            value={formData.badge_text || ''}
            onChange={(e) => handleInputChange('badge_text', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
