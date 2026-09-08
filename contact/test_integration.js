const http = require('http');
const { ensureServerRunning } = require('./backend/test_server_helper');

async function testSuite() {
  console.log('🧪 Running Complete End-to-End Advanced API & Integration Verification...\n');

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

  const post = (path, body, headers = {}) => {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(body);
      const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...headers
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }));
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  };

  const get = (path, headers = {}) => {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path,
        method: 'GET',
        headers
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: data });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  };

  const put = (path, body, headers = {}) => {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(body);
      const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...headers
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }));
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  };

  // 1. Health check
  const health = await get('/api/health');
  assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returns 200 OK');

  // 2. Individual Demo Profile Retrieval with dynamic links & coordinates
  const rahulPublic = await get('/api/public/profile/rahul-demo-2026');
  assert(
    rahulPublic.status === 200 &&
    rahulPublic.data.profile.full_name === 'Rahul Sharma' &&
    Array.isArray(rahulPublic.data.profile.social_links) &&
    rahulPublic.data.profile.social_links.length > 0 &&
    rahulPublic.data.profile.latitude === 12.9279,
    'GET /api/public/profile/rahul-demo-2026 returns profile with social links and GPS coordinates'
  );

  // 3. Individual vCard Download with GEO coordinates
  const rahulVCard = await get('/api/contact/rahul-demo-2026');
  assert(
    rahulVCard.status === 200 &&
    rahulVCard.raw.includes('BEGIN:VCARD') &&
    rahulVCard.raw.includes('FN:Rahul Sharma') &&
    rahulVCard.raw.includes('GEO:12.9279;77.6271'),
    'GET /api/contact/rahul-demo-2026 returns RFC vCard with GEO coordinates'
  );

  // 4. Company Demo Profile with multi-contacts, services & business hours
  const apexPublic = await get('/api/public/profile/apex-corp-2026');
  assert(
    apexPublic.status === 200 &&
    apexPublic.data.profile.official_company_name === 'Apex Cloud Solutions Inc.' &&
    Array.isArray(apexPublic.data.profile.company_contacts) &&
    apexPublic.data.profile.company_contacts.length === 3 &&
    Array.isArray(apexPublic.data.profile.services) &&
    apexPublic.data.profile.services.length === 3 &&
    Array.isArray(apexPublic.data.profile.business_hours) &&
    apexPublic.data.profile.business_hours.length === 7,
    'GET /api/public/profile/apex-corp-2026 bundles multi-contacts, services, and business hours'
  );

  // 5. Main Company vCard Download
  const apexVCard = await get('/api/contact/apex-corp-2026');
  assert(
    apexVCard.status === 200 &&
    apexVCard.raw.includes('ORG:Apex Cloud Solutions Inc.') &&
    apexVCard.raw.includes('GEO:37.7885;-122.3995'),
    'GET /api/contact/apex-corp-2026 returns company vCard with headquarters location'
  );

  // 6. Individual Representative vCard Download (e.g. CTO David Miller)
  const ctoContact = apexPublic.data.profile.company_contacts.find(c => c.name === 'David Miller');
  assert(Boolean(ctoContact), 'Found CTO contact person in company');

  if (ctoContact) {
    const ctoVCard = await get(`/api/contact/apex-corp-2026/person/${ctoContact.id}`);
    assert(
      ctoVCard.status === 200 &&
      ctoVCard.raw.includes('FN:David Miller') &&
      ctoVCard.raw.includes('TITLE:Chief Technology Officer') &&
      ctoVCard.raw.includes('ORG:Apex Cloud Solutions Inc.;Engineering & R&D'),
      'GET /api/contact/:token/person/:id generates tailored vCard for individual company representative'
    );
  }

  // 7. User Login
  const loginRes = await post('/api/auth/login', { email: 'contact@apexcloud.com', password: 'Password123!' });
  assert(loginRes.status === 200 && loginRes.data.token, 'POST /api/auth/login authenticates company account');
  const token = loginRes.data.token;

  // 8. Get Authenticated Company Profile
  const meRes = await get('/api/profile', { 'Authorization': `Bearer ${token}` });
  assert(
    meRes.status === 200 &&
    meRes.data.profile.company_contacts.length === 3,
    'GET /api/profile returns full authenticated profile with relations'
  );

  // 9. Update Profile: Add a new service and update business hours
  const currentServices = meRes.data.profile.services || [];
  const updatedServices = [
    ...currentServices,
    { title: 'Cloud Cost Optimization & FinOps', description: 'Real-time cloud billing intelligence reducing AWS/Azure spend by 40%.' }
  ];

  const updateRes = await put('/api/profile', {
    ...meRes.data.profile,
    official_company_name: 'Apex Cloud Solutions Worldwide Inc.',
    services: updatedServices
  }, { 'Authorization': `Bearer ${token}` });

  assert(
    updateRes.status === 200 &&
    updateRes.data.profile.services.length === 4 &&
    updateRes.data.profile.official_company_name === 'Apex Cloud Solutions Worldwide Inc.',
    'PUT /api/profile atomically updates core fields and relational services table'
  );

  // 10. Verify Live QR Stability on Public View
  const updatedPublic = await get('/api/public/profile/apex-corp-2026');
  assert(
    updatedPublic.data.profile.official_company_name === 'Apex Cloud Solutions Worldwide Inc.' &&
    updatedPublic.data.profile.services.length === 4,
    'Live QR stability: Public card immediately reflects newly added service and name under existing QR token'
  );

  // 11. Register Brand New Company Profile with Contacts and Services
  const newEmail = `quantum_${Date.now()}@leap.io`;
  const regRes = await post('/api/auth/register', {
    account_type: 'company',
    official_company_name: 'Quantum Leap Horizons Inc.',
    company_name: 'Quantum Leap',
    contact_person_name: 'Dr. Evelyn Reed',
    designation: 'Managing Director',
    email: newEmail,
    password: 'Password123!',
    phone: '+1 (212) 555-0144',
    city: 'New York',
    country: 'USA'
  });
  assert(regRes.status === 201 && regRes.data.qrCode.token, 'POST /api/auth/register creates new Company profile & QR token');

  const newQrToken = regRes.data.qrCode.token;
  const newPublic = await get(`/api/public/profile/${newQrToken}`);
  assert(newPublic.status === 200 && newPublic.data.profile.official_company_name === 'Quantum Leap Horizons Inc.', 'Public profile retrieval for dynamically registered company');

  // 12. Lead Capture & CSV Export (Feature 4 & Lead Export)
  async function testLeadExchange() {
    // A. Submit lead via public profile username
    const leadPostRes1 = await post('/api/public/rahul/lead', {
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@biotech.org',
      phone: '+1 (415) 890-1234',
      note: 'Met at BioMed Global 2026. Interested in platform integration.'
    });
    assert(leadPostRes1.status === 201 && leadPostRes1.data.success, 'POST /api/public/:username/lead captures visitor lead');
    assert(leadPostRes1.data.lead && leadPostRes1.data.lead.name === 'Dr. Sarah Jenkins', 'Lead payload has correct name');

    // B. Submit lead via token fallback
    const leadPostRes2 = await post('/api/public/rahul-demo-2026/lead', {
      name: 'Alex Chen',
      email: 'alex.chen@innovate.tech',
      phone: '+1 (408) 555-9012',
      note: 'Seed investor follow-up'
    });
    assert(leadPostRes2.status === 201 && leadPostRes2.data.success, 'POST /api/public/:token/lead captures lead via QR token');

    // C. Validation: missing name or contact details
    const invalidLead = await post('/api/public/rahul/lead', { note: 'No contact info' });
    assert(invalidLead.status === 400, 'POST /api/public/:username/lead rejects missing contact details with 400');

    // D. Log in as Rahul Sharma to retrieve leads
    const rahulAuth = await post('/api/auth/login', { email: 'rahul@example.com', password: 'Password123!' });
    assert(rahulAuth.status === 200 && rahulAuth.data.token, 'POST /api/auth/login succeeds for Rahul');
    const rahulHeaders = { Authorization: `Bearer ${rahulAuth.data.token}` };

    // E. Retrieve owner leads
    const leadsList = await get('/api/profile/leads', rahulHeaders);
    assert(leadsList.status === 200 && Array.isArray(leadsList.data.leads), 'GET /api/profile/leads retrieves owner leads list');
    assert(leadsList.data.leads.some(l => l.name === 'Dr. Sarah Jenkins'), 'Found captured lead in owner dashboard');

    // F. Export leads as streaming CSV
    const csvExport = await get('/api/profile/leads/export', rahulHeaders);
    assert(csvExport.status === 200, 'GET /api/profile/leads/export returns 200 OK');
    assert(csvExport.headers['content-type'] && csvExport.headers['content-type'].includes('text/csv'), 'Content-Type is text/csv');
    assert(csvExport.headers['content-disposition'] && csvExport.headers['content-disposition'].includes('attachment'), 'Content-Disposition is attachment');
    assert(csvExport.raw && csvExport.raw.includes('Name,Email,Phone,Note,Date'), 'CSV contains standard header row');
    assert(csvExport.raw && csvExport.raw.includes('Dr. Sarah Jenkins'), 'CSV contains captured lead record');
  }

  await testLeadExchange();

  console.log(`\n📊 Verification Summary: ${passed} Passed, ${failed} Failed\n`);

  await serverInstance.stop();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testSuite().catch(err => {
  console.error(err);
  process.exit(1);
});
