import React from 'react';
import {
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Youtube,
  Facebook,
  Globe,
  ExternalLink
} from 'lucide-react';

export default function SocialLinksGrid({ profile }) {
  if (!profile) return null;

  const links = [];

  const formatUrl = (url) => {
    if (!url) return '';
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  if (profile.linkedin) {
    links.push({
      id: 'linkedin',
      name: 'LinkedIn',
      url: formatUrl(profile.linkedin),
      icon: <Linkedin size={18} />,
      color: '#0A66C2',
      bg: 'rgba(10, 102, 194, 0.15)',
      border: 'rgba(10, 102, 194, 0.3)'
    });
  }

  if (profile.twitter) {
    links.push({
      id: 'twitter',
      name: 'X / Twitter',
      url: formatUrl(profile.twitter),
      icon: <Twitter size={18} />,
      color: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.15)',
      border: 'rgba(56, 189, 248, 0.3)'
    });
  }

  if (profile.github) {
    links.push({
      id: 'github',
      name: 'GitHub',
      url: formatUrl(profile.github),
      icon: <Github size={18} />,
      color: '#F8FAFC',
      bg: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)'
    });
  }

  if (profile.instagram) {
    links.push({
      id: 'instagram',
      name: 'Instagram',
      url: formatUrl(profile.instagram),
      icon: <Instagram size={18} />,
      color: '#E1306C',
      bg: 'rgba(225, 48, 108, 0.15)',
      border: 'rgba(225, 48, 108, 0.3)'
    });
  }

  if (profile.youtube) {
    links.push({
      id: 'youtube',
      name: 'YouTube',
      url: formatUrl(profile.youtube),
      icon: <Youtube size={18} />,
      color: '#FF0000',
      bg: 'rgba(255, 0, 0, 0.15)',
      border: 'rgba(255, 0, 0, 0.3)'
    });
  }

  if (profile.facebook) {
    links.push({
      id: 'facebook',
      name: 'Facebook',
      url: formatUrl(profile.facebook),
      icon: <Facebook size={18} />,
      color: '#1877F2',
      bg: 'rgba(24, 119, 242, 0.15)',
      border: 'rgba(24, 119, 242, 0.3)'
    });
  }

  // Parse custom links
  let customList = [];
  if (profile.custom_links) {
    try {
      customList = typeof profile.custom_links === 'string' ? JSON.parse(profile.custom_links) : profile.custom_links;
    } catch (e) {
      customList = [];
    }
  }

  if (Array.isArray(customList)) {
    customList.forEach((item, index) => {
      if (item?.label && item?.url) {
        links.push({
          id: `custom-${index}`,
          name: item.label,
          url: formatUrl(item.url),
          icon: <Globe size={18} />,
          color: '#A5B4FC',
          bg: 'rgba(165, 180, 252, 0.15)',
          border: 'rgba(165, 180, 252, 0.3)'
        });
      }
    });
  }

  if (links.length === 0) return null;

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.6rem' }}>
        Connect & Follow
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 0.85rem',
              background: link.bg,
              border: `1px solid ${link.border}`,
              borderRadius: '12px',
              color: '#F8FAFC',
              fontSize: '0.82rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'transform 0.15s ease, background 0.15s ease'
            }}
            className="hover-pop"
          >
            <span style={{ color: link.color, display: 'flex', alignItems: 'center' }}>
              {link.icon}
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {link.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
