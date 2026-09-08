import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import IndividualForm from '../components/profile/IndividualForm';
import CompanyForm from '../components/profile/CompanyForm';
import PhoneMockupPreview from '../components/dashboard/PhoneMockupPreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Save, ArrowLeft, CheckCircle2, Layers, User, Mail, Phone, } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProfileEditPage() {
  const { profile, qrCode, updateProfileData, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({ ...profile });
    }
  }, [profile]);

  if (loading || !formData) {
    return <LoadingSpinner fullScreen={true} text="Loading profile editor..." />;
  }

  const isCompany = formData.account_type === 'company';

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const res = await updateProfileData(formData);
    setIsSaving(false);

    if (res?.success) {
      setSavedSuccess(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Sticky Bar */}
      <div
        className="glass-panel"
        style={{
          position: 'sticky',
          top: '70px',
          zIndex: 40,
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/dashboard" className="btn btn-secondary btn-sm" title="Back to Dashboard">
            <ArrowLeft size={16} />
            <span className="hide-mobile">Dashboard</span>
          </Link>

          <div>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Edit {isCompany ? 'Company Profile' : 'Personal Profile'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Changes reflect immediately on your live QR code & public URL
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {savedSuccess && (
            <span style={{ fontSize: '0.85rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
              <CheckCircle2 size={16} /> Saved!
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.65rem 1.25rem' }}
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving Changes...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Split Layout: Form on Left, Live Phone Preview on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(360px, 0.9fr)', gap: '2rem', alignItems: 'start' }}>
        {/* Left Pane: Form */}
        <div>
          <form onSubmit={handleSave}>
            {isCompany ? (
              <CompanyForm
                formData={formData}
                onChange={setFormData}
                onImageUploaded={(url) => setFormData((prev) => ({ ...prev, company_logo: url }))}
              />
            ) : (
              <IndividualForm
                formData={formData}
                onChange={setFormData}
                onImageUploaded={(url) => setFormData((prev) => ({ ...prev, profile_photo: url }))}
              />
            )}

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Link to="/dashboard" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary btn-lg"
              >
                <Save size={18} />
                <span>{isSaving ? 'Saving Profile...' : 'Save All Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Pane: Sticky Smartphone Live Mockup */}
        <div style={{ position: 'sticky', top: '150px', display: 'flex', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PhoneMockupPreview profile={formData} token={qrCode?.token} />
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: minmax(0, 1.35fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}