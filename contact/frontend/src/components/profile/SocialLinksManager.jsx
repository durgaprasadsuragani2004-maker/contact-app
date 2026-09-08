import React from 'react';
import {
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Youtube,
  Facebook,
  Phone,
  Send,
  Globe,
  Briefcase,
  Plus,
  Trash2,
  GripVertical,
  Link2
} from 'lucide-react';

export const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={15} color="#0A66C2" />, placeholder: 'https://linkedin.com/in/username' },
  { id: 'github', label: 'GitHub', icon: <Github size={15} color="#FFFFFF" />, placeholder: 'https://github.com/username' },
  { id: 'twitter', label: 'X / Twitter', icon: <Twitter size={15} color="#38BDF8" />, placeholder: 'https://twitter.com/username' },
  { id: 'whatsapp', label: 'WhatsApp', icon: <Phone size={15} color="#25D366" />, placeholder: '+91 9876543210 or wa.me link' },
  { id: 'telegram', label: 'Telegram', icon: <Send size={15} color="#229ED9" />, placeholder: 'https://t.me/username' },
  { id: 'instagram', label: 'Instagram', icon: <Instagram size={15} color="#E1306C" />, placeholder: 'https://instagram.com/username' },
  { id: 'youtube', label: 'YouTube', icon: <Youtube size={15} color="#FF0000" />, placeholder: 'https://youtube.com/@channel' },
  { id: 'facebook', label: 'Facebook', icon: <Facebook size={15} color="#1877F2" />, placeholder: 'https://facebook.com/page' },
  { id: 'website', label: 'Website', icon: <Globe size={15} color="#06B6D4" />, placeholder: 'https://yourwebsite.com' },
  { id: 'portfolio', label: 'Portfolio', icon: <Briefcase size={15} color="#8B5CF6" />, placeholder: 'https://portfolio.dev' },
  { id: 'custom', label: 'Custom Link', icon: <Link2 size={15} color="#A5B4FC" />, placeholder: 'https://anylink.com' }
];

export default function SocialLinksManager({ links = [], onChange }) {
  const handleAddLink = () => {
    const newLink = {
      platform: 'linkedin',
      label: 'LinkedIn',
      url: '',
      category: 'both',
      display_order: links.length
    };
    onChange([...links, newLink]);
  };

  const handleUpdate = (index, key, val) => {
    const updated = [...links];
    updated[index][key] = val;

    // Auto-update label when platform changes if label was default
    if (key === 'platform') {
      const match = PLATFORMS.find(p => p.id === val);
      if (match) updated[index].label = match.label;
    }

    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = links.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= links.length) return;
    const updated = [...links];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link2 size={18} color="#06B6D4" />
            Social Media & Professional Links
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Add your social profiles, WhatsApp, GitHub, and custom web links.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddLink}
          className="btn btn-primary btn-sm"
        >
          <Plus size={15} /> Add Link
        </button>
      </div>

      {links.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed var(--border-glass)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No social links added yet.</p>
          <button
            type="button"
            onClick={handleAddLink}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.75rem' }}
          >
            <Plus size={14} /> Add Your First Link
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {links.map((link, idx) => {
            const platformConfig = PLATFORMS.find(p => p.id === link.platform) || PLATFORMS[PLATFORMS.length - 1];

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.6rem',
                  alignItems: 'center',
                  padding: '0.85rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)'
                }}
              >
                {/* Platform Selector */}
                <div style={{ width: '150px', minWidth: '130px' }}>
                  <select
                    className="form-select"
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                    value={link.platform || 'website'}
                    onChange={(e) => handleUpdate(idx, 'platform', e.target.value)}
                  >
                    {PLATFORMS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Custom Label */}
                <div style={{ width: '140px' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                    placeholder="Display Label"
                    value={link.label || ''}
                    onChange={(e) => handleUpdate(idx, 'label', e.target.value)}
                  />
                </div>

                {/* URL Input */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div className="input-wrapper">
                    <span className="input-icon" style={{ left: '0.75rem' }}>
                      {platformConfig.icon}
                    </span>
                    <input
                      type="text"
                      className="form-input input-has-icon"
                      style={{ padding: '0.55rem 0.75rem 0.55rem 2.4rem', fontSize: '0.85rem' }}
                      placeholder={platformConfig.placeholder}
                      value={link.url || ''}
                      onChange={(e) => handleUpdate(idx, 'url', e.target.value)}
                    />
                  </div>
                </div>

                {/* Category Mode Selector */}
                <div style={{ width: '135px', minWidth: '120px' }}>
                  <select
                    className="form-select"
                    style={{ padding: '0.55rem 0.65rem', fontSize: '0.82rem' }}
                    value={link.category || 'both'}
                    onChange={(e) => handleUpdate(idx, 'category', e.target.value)}
                    title="Choose which profile modes show this link"
                  >
                    <option value="both">🌐 All Modes</option>
                    <option value="work">💼 Work Only</option>
                    <option value="personal">👤 Personal Only</option>
                  </select>
                </div>

                {/* Actions: Move & Delete */}
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      className="btn btn-secondary btn-sm"
                      title="Move up"
                      style={{ padding: '0.45rem 0.55rem' }}
                    >
                      ▲
                    </button>
                  )}
                  {idx < links.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      className="btn btn-secondary btn-sm"
                      title="Move down"
                      style={{ padding: '0.45rem 0.55rem' }}
                    >
                      ▼
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="btn btn-danger btn-sm"
                    title="Delete link"
                    style={{ padding: '0.45rem 0.55rem' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
