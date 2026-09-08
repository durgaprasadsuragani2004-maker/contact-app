import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Building2, Mail, Lock, Phone, Briefcase, MapPin, Sparkles, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('individual'); // 'individual' | 'company'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    official_company_name: '',
    designation: '',
    contact_person_name: '',
    phone: '',
    city: '',
    country: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (accountType === 'individual' && !formData.full_name) {
      setError('Please provide your full name.');
      return;
    }

    if (accountType === 'company' && (!formData.official_company_name && !formData.company_name)) {
      setError('Please provide your official company name.');
      return;
    }

    setLoading(true);
    const res = await register({
      ...formData,
      account_type: accountType
    });
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ maxWidth: '580px', margin: '1rem auto 3rem', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.25rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary-600), var(--accent-cyan))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
              boxShadow: '0 4px 15px var(--primary-glow)'
            }}
          >
            <Sparkles size={24} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '1.75rem' }}>Create Your Digital Profile</h2>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
            Instant dynamic QR code & 1-tap mobile contact generation
          </p>
        </div>

        {/* Account Type Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(11, 15, 25, 0.7)',
            padding: '4px',
            borderRadius: '14px',
            border: '1px solid var(--border-glass)',
            marginBottom: '1.75rem'
          }}
        >
          <button
            type="button"
            onClick={() => setAccountType('individual')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '10px',
              border: 'none',
              background: accountType === 'individual' ? 'var(--primary-600)' : 'transparent',
              color: accountType === 'individual' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <User size={16} />
            Individual / Person
          </button>

          <button
            type="button"
            onClick={() => setAccountType('company')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '10px',
              border: 'none',
              background: accountType === 'company' ? '#10B981' : 'transparent',
              color: accountType === 'company' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Building2 size={16} />
            Company / Organization
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '10px',
              color: '#FB7185',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Dynamic Fields Based on Account Type */}
          {accountType === 'individual' ? (
            <>
              <div className="form-group">
                <label className="form-label">
                  <span>Full Name <span className="required">*</span></span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"><User size={16} /></span>
                  <input
                    type="text"
                    name="full_name"
                    className="form-input input-has-icon"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">
                    <span>Job Title / Designation</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Briefcase size={16} /></span>
                    <input
                      type="text"
                      name="designation"
                      className="form-input input-has-icon"
                      placeholder="e.g. Lead Architect"
                      value={formData.designation}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Company Name</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    className="form-input"
                    placeholder="e.g. TechNova Inc."
                    value={formData.company_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">
                  <span>Official Company Name <span className="required">*</span></span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"><Building2 size={16} /></span>
                  <input
                    type="text"
                    name="official_company_name"
                    className="form-input input-has-icon"
                    placeholder="e.g. Apex Cloud Solutions Inc."
                    value={formData.official_company_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">
                    <span>Contact Person Name</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon"><User size={16} /></span>
                    <input
                      type="text"
                      name="contact_person_name"
                      className="form-input input-has-icon"
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.contact_person_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Representative Title</span>
                  </label>
                  <input
                    type="text"
                    name="designation"
                    className="form-input"
                    placeholder="e.g. VP of Operations"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {/* Shared Contact & Auth Fields */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                <span>Phone Number <span className="optional">(vCard TEL)</span></span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon"><Phone size={16} /></span>
                <input
                  type="tel"
                  name="phone"
                  className="form-input input-has-icon"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>City & Country</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon"><MapPin size={16} /></span>
                <input
                  type="text"
                  name="city"
                  className="form-input input-has-icon"
                  placeholder="e.g. Bangalore, India"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Email Address <span className="required">*</span></span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Mail size={16} /></span>
              <input
                type="email"
                name="email"
                className="form-input input-has-icon"
                placeholder="name@domain.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Account Password <span className="required">*</span></span>
              <span className="optional">Min 6 characters</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Lock size={16} /></span>
              <input
                type="password"
                name="password"
                className="form-input input-has-icon"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn ${accountType === 'company' ? 'btn-emerald' : 'btn-primary'} btn-full btn-lg`}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Creating Profile & QR...' : (
              <>
                <span>Register & Generate QR</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.85rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-400)', fontWeight: '600' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
