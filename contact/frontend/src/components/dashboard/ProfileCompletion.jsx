import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

export default function ProfileCompletion({ profile }) {
  if (!profile) return null;

  const isCompany = profile.account_type === 'company';
  const percentage = profile.completionPercentage || 0;

  // Determine missing fields
  const missing = [];
  if (isCompany) {
    if (!profile.company_logo) missing.push({ label: 'Upload Company Logo', tab: 'media' });
    if (!profile.website) missing.push({ label: 'Add Official Website', tab: 'contact' });
    if (!profile.industry) missing.push({ label: 'Select Industry', tab: 'general' });
    if (!profile.bio) missing.push({ label: 'Write Company Overview', tab: 'about' });
    if (!profile.linkedin) missing.push({ label: 'Connect LinkedIn', tab: 'social' });
    if (!profile.address) missing.push({ label: 'Provide Office Address', tab: 'location' });
  } else {
    if (!profile.profile_photo) missing.push({ label: 'Upload Profile Photo / Avatar', tab: 'media' });
    if (!profile.designation) missing.push({ label: 'Add Job Title & Department', tab: 'general' });
    if (!profile.bio) missing.push({ label: 'Write Professional Bio', tab: 'about' });
    if (!profile.linkedin) missing.push({ label: 'Connect LinkedIn Profile', tab: 'social' });
    if (!profile.phone) missing.push({ label: 'Add Mobile Phone Number', tab: 'contact' });
    if (!profile.city) missing.push({ label: 'Add City / Location', tab: 'location' });
  }

  // Determine meter color
  let meterColor = '#F43F5E';
  let statusText = 'Needs Attention';
  if (percentage >= 80) {
    meterColor = '#10B981';
    statusText = 'Excellent Profile!';
  } else if (percentage >= 50) {
    meterColor = '#F59E0B';
    statusText = 'Good Progress';
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary-400)" />
              Profile Strength
            </h3>
            <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>{statusText}</p>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: meterColor }}>
            {percentage}%
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              background: `linear-gradient(90deg, var(--primary-500), ${meterColor})`,
              borderRadius: '4px',
              transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>

        {/* Missing recommendations */}
        {missing.length > 0 ? (
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recommended Next Steps:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {missing.slice(0, 3).map((item, idx) => (
                <Link
                  key={idx}
                  to={`/profile/edit?tab=${item.tab}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    fontSize: '0.83rem',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'all 0.15s'
                  }}
                  className="hover-bright"
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <AlertTriangle size={14} color="#F59E0B" />
                    {item.label}
                  </span>
                  <ArrowRight size={14} color="var(--primary-400)" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: '#6EE7B7', fontSize: '0.85rem' }}>
            <CheckCircle2 size={18} />
            All primary contact & company details are complete!
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <Link to="/profile/edit" className="btn btn-secondary btn-sm btn-full">
          Complete Full Profile
        </Link>
      </div>
    </div>
  );
}
