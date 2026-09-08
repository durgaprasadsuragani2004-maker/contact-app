import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ProfileCompletion from '../components/dashboard/ProfileCompletion';
import QRCodeCard from '../components/dashboard/QRCodeCard';
import PhoneMockupPreview from '../components/dashboard/PhoneMockupPreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  User,
  Building2,
  Edit3,
  ExternalLink,
  Eye,
  Sparkles,
  QrCode,
  ShieldCheck,
  Smartphone,
  Calendar,
  Share2,
  Download,
  MousePointerClick,
  Users,
  FileSpreadsheet,
  Search,
  Mail,
  Phone,
  MessageSquare,
  BarChart3,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, qrCode, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'leads'

  // Analytics & Leads state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [searchLeadQuery, setSearchLeadQuery] = useState('');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setAnalyticsLoading(true);
        const data = await api.getAnalytics(30);
        if (data.success) {
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.warn('Failed to load analytics:', err.message);
      } finally {
        setAnalyticsLoading(false);
      }
    }

    async function fetchLeads() {
      try {
        setLeadsLoading(true);
        const data = await api.getLeads();
        if (data.success) {
          setLeads(data.leads || []);
        }
      } catch (err) {
        console.warn('Failed to load leads:', err.message);
      } finally {
        setLeadsLoading(false);
      }
    }

    if (user && profile) {
      fetchAnalytics();
      fetchLeads();
    }
  }, [user, profile]);

  if (authLoading) {
    return <LoadingSpinner fullScreen={true} text="Loading your dashboard..." />;
  }

  if (!user || !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p>Please log in to view your dashboard.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Go to Sign In
        </Link>
      </div>
    );
  }

  const isCompany = profile.account_type === 'company';
  const displayName = isCompany
    ? (profile.official_company_name || profile.company_name || 'Organization')
    : (profile.full_name || 'User');

  const publicUrl = qrCode?.token ? `${window.location.origin}/profile/${qrCode.token}` : '#';

  // Export leads to CSV via backend streaming endpoint
  const [exportingLeads, setExportingLeads] = useState(false);

  const exportLeadsToCSV = async () => {
    if (!leads || leads.length === 0) return;
    try {
      setExportingLeads(true);
      const blob = await api.exportLeadsCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (profile?.username || profile?.full_name || 'contacts').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `leads_${safeName}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export leads to CSV:', err);
      alert('Failed to export leads. Please try again.');
    } finally {
      setExportingLeads(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const q = searchLeadQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.note && l.note.toLowerCase().includes(q))
    );
  });

  const summary = analytics?.summary || {};
  const totalPageViews = summary.total_page_views || 0;
  const totalQrScans = summary.total_qr_scans || qrCode?.scansCount || 0;
  const totalVcardDownloads = summary.total_vcard_downloads || 0;
  const totalLinkClicks = summary.total_link_clicks || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Greeting & Action Header */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem 2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: isCompany ? '16px' : '50%',
              background: 'linear-gradient(135deg, var(--primary-600), var(--accent-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '800',
              color: '#FFF',
              overflow: 'hidden',
              boxShadow: '0 6px 20px var(--primary-glow)',
              flexShrink: 0
            }}
          >
            {(profile.profile_photo || profile.company_logo) ? (
              <img
                src={profile.profile_photo || profile.company_logo}
                alt={displayName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.65rem' }}>{displayName}</h1>
              <span className={`badge ${isCompany ? 'badge-company' : 'badge-individual'}`}>
                {isCompany ? <Building2 size={12} /> : <User size={12} />}
                {isCompany ? 'Company' : 'Individual'}
              </span>
              {profile.activeMode && profile.activeMode !== 'all' && (
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC' }}>
                  {profile.activeMode === 'work' ? '💼 Work Mode' : '👤 Personal Mode'}
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {profile.designation || (isCompany ? profile.industry : 'Digital Profile Holder')}
              {profile.company_name && !isCompany && ` at ${profile.company_name}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/profile/edit" className="btn btn-primary btn-sm">
            <Edit3 size={16} />
            Edit Profile
          </Link>

          {qrCode?.token && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <ExternalLink size={16} />
              View Public Card
            </a>
          )}
        </div>
      </div>

      {/* Feature 2 & 5: Live Analytics Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Metric 1: Total Page Views */}
        <div className="glass-panel hover-bright" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Page Views
            </span>
            <Eye size={18} color="#06B6D4" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'var(--font-display)', marginTop: '0.4rem', color: '#F8FAFC' }}>
            {analyticsLoading ? '...' : totalPageViews}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#06B6D4' }}>Live profile views recorded</span>
        </div>

        {/* Metric 2: Total QR Scans */}
        <div className="glass-panel hover-bright" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total QR Scans
            </span>
            <QrCode size={18} color="#818CF8" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'var(--font-display)', marginTop: '0.4rem', color: '#F8FAFC' }}>
            {analyticsLoading ? '...' : totalQrScans}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10B981' }}>Scanned via physical QR</span>
        </div>

        {/* Metric 3: vCard Downloads */}
        <div className="glass-panel hover-bright" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              vCard Downloads
            </span>
            <Download size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'var(--font-display)', marginTop: '0.4rem', color: '#10B981' }}>
            {analyticsLoading ? '...' : totalVcardDownloads}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contacts saved to address book</span>
        </div>

        {/* Metric 4: Link Clicks */}
        <div className="glass-panel hover-bright" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Link Clicks
            </span>
            <MousePointerClick size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'var(--font-display)', marginTop: '0.4rem', color: '#F59E0B' }}>
            {analyticsLoading ? '...' : totalLinkClicks}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Social & web click engagements</span>
        </div>
      </div>

      {/* Navigation Tabs (Overview & Card Studio vs. Captured Leads) */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.4rem' }}
        >
          <BarChart3 size={16} />
          <span>Card Studio & Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leads')}
          className={`btn btn-sm ${activeTab === 'leads' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.4rem' }}
        >
          <Users size={16} />
          <span>Captured Leads</span>
          {leads.length > 0 && (
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.25)',
                color: '#10B981',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}
            >
              {leads.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Overview, QR Card & Smartphone Live Preview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {/* Column 1: QR Code Card */}
            <div>
              <QRCodeCard profile={profile} qrCode={qrCode} />
            </div>

            {/* Column 2: Profile Strength & Recommendations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <ProfileCompletion profile={profile} />

              {/* Top Clicked Links Breakdown */}
              {analytics?.top_links && analytics.top_links.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MousePointerClick size={16} color="var(--primary-400)" />
                    Top Clicked Links
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {analytics.top_links.map((link, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          background: 'rgba(0,0,0,0.25)',
                          borderRadius: '10px',
                          fontSize: '0.84rem'
                        }}
                      >
                        <span style={{ color: '#F8FAFC', textTransform: 'capitalize', fontWeight: '600' }}>
                          {link.platform || 'Link'}
                        </span>
                        <span style={{ color: 'var(--primary-400)', fontWeight: '700' }}>
                          {link.clicks} clicks
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Devices Breakdown */}
              {analytics?.devices && (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Smartphone size={16} color="#06B6D4" />
                    Visitor Devices
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Mobile</span>
                      <strong style={{ fontSize: '1.2rem', color: '#F8FAFC' }}>{analytics.devices.mobile || 0}</strong>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Desktop</span>
                      <strong style={{ fontSize: '1.2rem', color: '#F8FAFC' }}>{analytics.devices.desktop || 0}</strong>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Tablet</span>
                      <strong style={{ fontSize: '1.2rem', color: '#F8FAFC' }}>{analytics.devices.tablet || 0}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: Live Interactive Smartphone Preview */}
            <div>
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <PhoneMockupPreview profile={profile} token={qrCode?.token} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Captured Leads (Feature 4: Exchange Contact Table & Export) */}
      {activeTab === 'leads' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={22} color="var(--primary-400)" />
                Received Leads & Contacts
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Contacts submitted by visitors through your public card's "Exchange Contact" button.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="input-wrapper" style={{ minWidth: '220px' }}>
                <span className="input-icon"><Search size={15} /></span>
                <input
                  type="text"
                  className="form-input input-has-icon"
                  placeholder="Search leads..."
                  value={searchLeadQuery}
                  onChange={(e) => setSearchLeadQuery(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem 0.5rem 2.2rem', fontSize: '0.85rem' }}
                />
              </div>

              <button
                type="button"
                onClick={exportLeadsToCSV}
                disabled={leads.length === 0 || exportingLeads}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.4rem' }}
                title="Download all captured leads as a CSV spreadsheet"
              >
                <FileSpreadsheet size={16} color="#10B981" />
                <span>{exportingLeads ? 'Exporting...' : 'Export to CSV'}</span>
              </button>
            </div>
          </div>

          {leadsLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <LoadingSpinner text="Fetching received leads..." />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '16px',
                border: '1px dashed var(--border-glass)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: 'var(--primary-400)'
                }}
              >
                <Users size={28} />
              </div>
              <h4 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '0.4rem' }}>
                {searchLeadQuery ? 'No matching contacts found' : 'No leads captured yet'}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
                {searchLeadQuery
                  ? 'Try a different search keyword.'
                  : 'Share your QR code at conferences or meetings. When visitors click "Exchange Contact", their details will appear right here.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Contact Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Email</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Phone</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Note / Message</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Date Received</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id || lead._id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.15s'
                      }}
                      className="hover-bright"
                    >
                      <td style={{ padding: '1rem', color: '#F8FAFC', fontWeight: '700' }}>
                        {lead.name}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} style={{ color: 'var(--primary-400)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Mail size={13} />
                            {lead.email}
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {lead.phone ? (
                          <a href={`tel:${lead.phone}`} style={{ color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Phone size={13} />
                            {lead.phone}
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                        {lead.note || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {new Date(lead.createdAt || lead.created_at || Date.now()).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
