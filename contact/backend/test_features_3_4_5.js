const http = require('http');
require('dotenv').config({ path: __dirname + '/.env' });
const fs = require('fs');
const path = require('path');
const { ensureServerRunning } = require('./test_server_helper');

async function runTestSuite() {
  console.log('🧪 Running Comprehensive Integration Tests for Features 3, 4, 5 & Analytics...\n');

  const serverInstance = await ensureServerRunning(process.env.PORT || 5001);

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  const PORT = process.env.PORT || 5001;

  const request = (endpoint, method = 'GET', body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const reqHeaders = { ...headers };
      if (payload) {
        reqHeaders['Content-Type'] = 'application/json';
        reqHeaders['Content-Length'] = Buffer.byteLength(payload);
      }

      const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path: endpoint,
        method,
        headers: reqHeaders
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        });
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  };

  // ─────────────────────────────────────────────
  // 0. Clean Up & Database Alignment Verification
  // ─────────────────────────────────────────────
  const legacyDbPath = path.resolve(__dirname, '../data/qr_contact.db');
  assert(!fs.existsSync(legacyDbPath), 'Legacy SQLite file (data/qr_contact.db) does not exist');
  assert(Boolean(process.env.MONGO_URI), 'backend/.env has MONGO_URI properly configured');
  assert(Boolean(process.env.JWT_SECRET), 'backend/.env has JWT_SECRET properly configured');

  // Health check
  const health = await request('/api/health');
  assert(health.status === 200, 'Backend API is running and healthy (GET /api/health)');

  // Authenticate as demo user (Rahul)
  const loginRes = await request('/api/auth/login', 'POST', {
    email: 'rahul@example.com',
    password: 'Password123!'
  });
  assert(loginRes.status === 200 && loginRes.data.token, 'POST /api/auth/login succeeds for demo account');
  const token = loginRes.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // ─────────────────────────────────────────────
  // 1. Feature 3: Customized QR Code Generation & Export
  // ─────────────────────────────────────────────
  // Update QR code style to custom colors with PNG format
  const qrStyleResPNG = await request('/api/profile/qrcode', 'PUT', {
    darkColor: '#4F46E5',
    lightColor: '#F0F9FF',
    format: 'png'
  }, authHeaders);

  assert(qrStyleResPNG.status === 200 && qrStyleResPNG.data.success, 'PUT /api/profile/qrcode succeeds (PNG format)');
  assert(qrStyleResPNG.data.qrCode.darkColor === '#4F46E5', 'darkColor is set to #4F46E5');
  assert(qrStyleResPNG.data.qrCode.lightColor === '#F0F9FF', 'lightColor is set to #F0F9FF');
  assert(qrStyleResPNG.data.qrCode.format === 'png', 'format is set to png');
  assert(
    qrStyleResPNG.data.qrCode.qrImage && qrStyleResPNG.data.qrCode.qrImage.startsWith('data:image/png;base64,'),
    'qrImage contains valid PNG base64 data URL'
  );

  // Update QR code style with SVG format
  const qrStyleResSVG = await request('/api/profile/qrcode', 'PUT', {
    darkColor: '#06B6D4',
    lightColor: '#FFFFFF',
    format: 'svg'
  }, authHeaders);

  assert(qrStyleResSVG.status === 200 && qrStyleResSVG.data.success, 'PUT /api/profile/qrcode succeeds (SVG format)');
  assert(qrStyleResSVG.data.qrCode.format === 'svg', 'format is set to svg');
  assert(
    qrStyleResSVG.data.qrCode.qrImage && qrStyleResSVG.data.qrCode.qrImage.includes('<svg'),
    'qrImage contains valid SVG markup'
  );

  // Verify getProfile returns custom QR style
  const profileRes = await request('/api/profile', 'GET', null, authHeaders);
  assert(profileRes.status === 200 && profileRes.data.qrCode.darkColor === '#06B6D4', 'GET /api/profile returns persisted darkColor in qrCode');
  assert(profileRes.data.qrCode.format === 'svg', 'GET /api/profile returns persisted format in qrCode');

  // ─────────────────────────────────────────────
  // 2. Feature 4: Lead Capture ("Exchange Contact") Form
  // ─────────────────────────────────────────────
  // Submit lead by username
  const lead1Res = await request('/api/public/rahul/lead', 'POST', {
    name: 'Emily Watson',
    email: 'emily.watson@example.com',
    phone: '+1 (555) 987-6543',
    note: 'Met at DevConf 2026. Interested in Kubernetes consulting.'
  });
  assert(lead1Res.status === 201 && lead1Res.data.success, 'POST /api/public/:username/lead captures visitor details');
  assert(lead1Res.data.lead.name === 'Emily Watson', 'Captured lead contains correct contact name');

  // Submit lead by token fallback
  const lead2Res = await request('/api/public/rahul-demo-2026/lead', 'POST', {
    name: 'Marcus Vance',
    email: 'marcus@cloudventures.vc',
    phone: '+1 (555) 432-1098',
    note: 'VC partner interested in seed round.'
  });
  assert(lead2Res.status === 201 && lead2Res.data.success, 'POST /api/public/:token/lead fallback captures visitor details');

  // Validation: Missing name returns 400
  const invalidNameRes = await request('/api/public/rahul/lead', 'POST', {
    email: 'noname@example.com'
  });
  assert(invalidNameRes.status === 400 && !invalidNameRes.data.success, 'POST /api/public/:username/lead rejects missing name with 400');

  // Validation: Missing both email and phone returns 400
  const invalidContactRes = await request('/api/public/rahul/lead', 'POST', {
    name: 'Ghost User'
  });
  assert(invalidContactRes.status === 400 && !invalidContactRes.data.success, 'POST /api/public/:username/lead rejects missing email/phone with 400');

  // Retrieve leads as authenticated owner
  const leadsRes = await request('/api/profile/leads', 'GET', null, authHeaders);
  assert(leadsRes.status === 200 && Array.isArray(leadsRes.data.leads), 'GET /api/profile/leads retrieves owner leads list');
  assert(leadsRes.data.leads.length >= 2, 'GET /api/profile/leads contains captured leads');
  const emilyLead = leadsRes.data.leads.find(l => l.name === 'Emily Watson');
  assert(Boolean(emilyLead && emilyLead.email === 'emily.watson@example.com'), 'Captured lead has correct email and fields');

  // ─────────────────────────────────────────────
  // 3. Feature 5: Multi-Mode Profile & Theme Customization
  // ─────────────────────────────────────────────
  // Update profile with social links having categories ('work', 'personal', 'both')
  // and set activeMode: 'work', theme: { primaryColor, cardStyle, fontFamily }
  const updateModeRes = await request('/api/profile', 'PUT', {
    activeMode: 'work',
    theme: {
      primaryColor: '#8B5CF6',
      cardStyle: 'glassmorphism',
      fontFamily: 'Outfit'
    },
    social_links: [
      { platform: 'linkedin', label: 'Work LinkedIn', url: 'https://linkedin.com/in/rahul-sharma', category: 'work' },
      { platform: 'github', label: 'Work GitHub', url: 'https://github.com/rahulsharma-dev', category: 'work' },
      { platform: 'instagram', label: 'Personal Instagram', url: 'https://instagram.com/rahul_snaps', category: 'personal' },
      { platform: 'website', label: 'All-Mode Blog', url: 'https://rahulsharma.dev', category: 'both' }
    ]
  }, authHeaders);

  assert(updateModeRes.status === 200 && updateModeRes.data.success, 'PUT /api/profile updates activeMode and theme');
  assert(updateModeRes.data.profile.activeMode === 'work', 'profile.activeMode is set to work');
  assert(updateModeRes.data.profile.theme.cardStyle === 'glassmorphism', 'profile.theme.cardStyle is glassmorphism');
  assert(updateModeRes.data.profile.theme.primaryColor === '#8B5CF6', 'profile.theme.primaryColor is #8B5CF6');

  // Public retrieval in 'work' mode: must only include 'work' and 'both' links, excluding 'personal'
  const workPublicRes = await request('/api/public/rahul');
  assert(workPublicRes.status === 200, 'GET /api/public/rahul returns 200 OK');
  const workLinks = workPublicRes.data.profile.social_links;
  assert(
    workLinks.some(l => l.label === 'Work LinkedIn') && workLinks.some(l => l.label === 'All-Mode Blog'),
    'Work mode includes work and both tagged links'
  );
  assert(
    !workLinks.some(l => l.label === 'Personal Instagram'),
    'Work mode filters out personal links'
  );

  // Switch to 'personal' mode: must only include 'personal' and 'both' links, excluding 'work'
  await request('/api/profile', 'PUT', { activeMode: 'personal' }, authHeaders);
  const personalPublicRes = await request('/api/public/rahul');
  const personalLinks = personalPublicRes.data.profile.social_links;
  assert(
    personalLinks.some(l => l.label === 'Personal Instagram') && personalLinks.some(l => l.label === 'All-Mode Blog'),
    'Personal mode includes personal and both tagged links'
  );
  assert(
    !personalLinks.some(l => l.label === 'Work LinkedIn'),
    'Personal mode filters out work links'
  );

  // Switch back to 'all' mode: must include all links
  await request('/api/profile', 'PUT', { activeMode: 'all' }, authHeaders);
  const allPublicRes = await request('/api/public/rahul');
  const allLinks = allPublicRes.data.profile.social_links;
  assert(allLinks.length === 4, 'All mode returns all social links without filtering');

  // ─────────────────────────────────────────────
  // 4. Feature 2 & 5: Analytics Integration
  // ─────────────────────────────────────────────
  const analyticsRes = await request('/api/profile/analytics', 'GET', null, authHeaders);
  assert(analyticsRes.status === 200 && analyticsRes.data.success, 'GET /api/profile/analytics returns 200 OK');
  assert(typeof analyticsRes.data.analytics.summary.total_page_views === 'number', 'analytics summary has total_page_views');
  assert(typeof analyticsRes.data.analytics.summary.total_qr_scans === 'number', 'analytics summary has total_qr_scans');
  assert(typeof analyticsRes.data.analytics.summary.total_vcard_downloads === 'number', 'analytics summary has total_vcard_downloads');
  assert(typeof analyticsRes.data.analytics.summary.total_link_clicks === 'number', 'analytics summary has total_link_clicks');
  assert(Array.isArray(analyticsRes.data.analytics.timeline), 'analytics contains timeline array');

  console.log(`\n========================================`);
  console.log(`📊 Test Suite Completed: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  await serverInstance.stop();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
