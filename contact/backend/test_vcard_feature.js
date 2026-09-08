const http = require('http');
require('dotenv').config({ path: __dirname + '/.env' });
const { ensureServerRunning } = require('./test_server_helper');

async function runTests() {
  console.log('🧪 Starting Feature 1: Dynamic vCard (.vcf) Download Integration Tests...\n');

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

  const get = (path) => {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: process.env.PORT || 5001,
        path,
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });
      req.on('error', reject);
      req.end();
    });
  };

  // Test 1: Health check
  const health = await get('/api/health');
  assert(health.status === 200, 'Backend server is running (GET /api/health)');

  // Test 2: Dynamic vCard by username for individual (Rahul)
  const rahulRes = await get('/api/public/rahul/vcard');
  assert(rahulRes.status === 200, 'GET /api/public/rahul/vcard returns 200 OK');
  assert(
    rahulRes.headers['content-type'] && rahulRes.headers['content-type'].includes('text/vcard'),
    'Content-Type is text/vcard; charset=utf-8'
  );
  assert(
    rahulRes.headers['content-disposition'] && rahulRes.headers['content-disposition'].includes('attachment') && rahulRes.headers['content-disposition'].includes('.vcf'),
    'Content-Disposition is attachment with .vcf extension'
  );
  assert(rahulRes.body.includes('BEGIN:VCARD') && rahulRes.body.includes('VERSION:3.0'), 'vCard header has BEGIN:VCARD and VERSION:3.0');
  assert(rahulRes.body.includes('FN:Rahul Sharma'), 'vCard contains FN:Rahul Sharma');
  assert(rahulRes.body.includes('ORG:TechNova Solutions Pvt Ltd'), 'vCard contains ORG for individual');
  assert(rahulRes.body.includes('TEL;TYPE=CELL,VOICE:'), 'vCard contains mobile phone');
  assert(rahulRes.body.includes('EMAIL;TYPE=INTERNET,WORK:rahul.sharma@technova.io'), 'vCard contains email');
  assert(rahulRes.body.includes('GEO:12.9279;77.6271'), 'vCard contains GEO coordinates');
  assert(rahulRes.body.includes('END:VCARD'), 'vCard properly terminates with END:VCARD');

  // Test 3: Dynamic vCard by username for company (Apex Cloud)
  const apexRes = await get('/api/public/apexcloud/vcard');
  assert(apexRes.status === 200, 'GET /api/public/apexcloud/vcard returns 200 OK');
  assert(apexRes.body.includes('FN:Apex Cloud Solutions'), 'Company vCard contains FN:Apex Cloud Solutions');
  assert(apexRes.body.includes('ORG:Apex Cloud Solutions'), 'Company vCard contains ORG:Apex Cloud Solutions');
  assert(apexRes.body.includes('GEO:37.7885;-122.3995'), 'Company vCard contains headquarters GEO coordinates');
  assert(apexRes.body.includes('END:VCARD'), 'Company vCard properly terminates with END:VCARD');

  // Test 4: Token fallback test (/api/public/:token/vcard)
  const tokenRes = await get('/api/public/rahul-demo-2026/vcard');
  assert(tokenRes.status === 200, 'GET /api/public/:token/vcard fallback succeeds with 200 OK');
  assert(tokenRes.body.includes('FN:Rahul Sharma'), 'Token fallback returns Rahul Sharma vCard');

  // Test 5: Non-existent username returns 404
  const notFoundRes = await get('/api/public/nonexistent_user_xyz_9999/vcard');
  assert(notFoundRes.status === 404, 'GET /api/public/nonexistent_user/vcard returns 404 Not Found');

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  await serverInstance.stop();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
