const http = require('http');
const path = require('path');
const fs = require('fs');
const { ensureServerRunning } = require('./test_server_helper');

async function testNewFeatures() {
  console.log('🧪 Starting Verification for CSV Export, Social Metadata & PWA Support...\n');

  const serverInstance = await ensureServerRunning(process.env.PORT || 5001);
  const PORT = process.env.PORT || 5001;

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

  const get = (endpoint, headers = {}) => {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path: endpoint,
        method: 'GET',
        headers
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = null;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: data });
        });
      });
      req.on('error', reject);
      req.end();
    });
  };

  const post = (endpoint, body, headers = {}) => {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(body);
      const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...headers
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  };

  // 1. Authenticate as Rahul
  const loginRes = await post('/api/auth/login', { email: 'rahul@example.com', password: 'Password123!' });
  assert(loginRes.status === 200 && loginRes.data.token, 'POST /api/auth/login authenticates user');
  const token = loginRes.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2. Submit a lead to ensure data exists
  const leadRes = await post('/api/public/rahul/lead', {
    name: 'Samantha Ray',
    email: 'samantha.ray@fintech.co',
    phone: '+1 555 4433 221',
    note: 'Let us connect next week regarding digital identity'
  });
  assert(leadRes.status === 201, 'POST /api/public/rahul/lead captures lead');

  // 3. Test GET /api/profile/leads/export (Feature: CSV Export)
  const csvRes = await get('/api/profile/leads/export', authHeaders);
  assert(csvRes.status === 200, 'GET /api/profile/leads/export returns 200 OK');
  assert(
    csvRes.headers['content-type'] && csvRes.headers['content-type'].includes('text/csv'),
    'Content-Type header is text/csv'
  );
  assert(
    csvRes.headers['content-disposition'] && csvRes.headers['content-disposition'].includes('attachment') && csvRes.headers['content-disposition'].includes('.csv'),
    'Content-Disposition header specifies attachment with .csv extension'
  );
  assert(csvRes.raw.startsWith('"Name","Email","Phone","Note","Date"') || csvRes.raw.includes('Name,Email,Phone,Note,Date'), 'CSV starts with required header row');
  assert(csvRes.raw.includes('Samantha Ray') && csvRes.raw.includes('samantha.ray@fintech.co'), 'CSV contains captured lead details');

  // 4. Test Unauthenticated GET /api/profile/leads/export returns 401
  const unauthCsvRes = await get('/api/profile/leads/export');
  assert(unauthCsvRes.status === 401, 'GET /api/profile/leads/export requires authentication (401)');

  // 5. Test Public Profile Metadata (Feature: Dynamic Social Share & OG Tags)
  const publicRahul = await get('/api/public/rahul');
  assert(publicRahul.status === 200, 'GET /api/public/rahul returns 200 OK');
  assert(Boolean(publicRahul.data.metadata), 'Response includes ready-to-use metadata object');
  assert(publicRahul.data.metadata.title.includes('Rahul Sharma'), 'metadata.title contains full name');
  assert(Boolean(publicRahul.data.metadata.ogTitle), 'metadata.ogTitle is populated');
  assert(Boolean(publicRahul.data.metadata.ogDescription), 'metadata.ogDescription is populated');
  assert(Boolean(publicRahul.data.metadata.bio), 'metadata.bio is populated');

  // 6. Test Company Public Profile Metadata
  const publicApex = await get('/api/public/apexcloud');
  assert(publicApex.status === 200, 'GET /api/public/apexcloud returns 200 OK');
  assert(publicApex.data.metadata.displayName.includes('Apex Cloud Solutions'), 'Company metadata displayName matches official company name');

  // 7. Test PWA Files on Disk
  const manifestPath = path.resolve(__dirname, '../frontend/public/manifest.json');
  const swPath = path.resolve(__dirname, '../frontend/public/sw.js');
  const iconSvgPath = path.resolve(__dirname, '../frontend/public/icons/icon.svg');
  const icon192Path = path.resolve(__dirname, '../frontend/public/icons/icon-192.png');
  const icon512Path = path.resolve(__dirname, '../frontend/public/icons/icon-512.png');

  assert(fs.existsSync(manifestPath), 'frontend/public/manifest.json exists');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.name && manifest.short_name && manifest.theme_color, 'manifest.json has name, short_name, and theme_color');
  assert(Array.isArray(manifest.icons) && manifest.icons.length >= 3, 'manifest.json has required icons (SVG, 192, 512)');

  assert(fs.existsSync(swPath), 'frontend/public/sw.js exists');
  const swContent = fs.readFileSync(swPath, 'utf8');
  assert(swContent.includes('qrlync-shell') && swContent.includes('/api/public/profile/'), 'sw.js contains shell and offline card caching logic');

  assert(fs.existsSync(iconSvgPath), 'frontend/public/icons/icon.svg exists');
  assert(fs.existsSync(icon192Path), 'frontend/public/icons/icon-192.png exists');
  assert(fs.existsSync(icon512Path), 'frontend/public/icons/icon-512.png exists');

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

testNewFeatures().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});
