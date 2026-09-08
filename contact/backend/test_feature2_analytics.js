const http = require('http');
require('dotenv').config({ path: __dirname + '/.env' });
const { ensureServerRunning } = require('./test_server_helper');

async function runTests() {
  console.log('🧪 Starting Feature 2: Analytics Tracking Integration Tests...\n');

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

  const port = process.env.PORT || 5001;

  const request = (path, method = 'GET', body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const reqHeaders = { ...headers };
      if (payload) {
        reqHeaders['Content-Type'] = 'application/json';
        reqHeaders['Content-Length'] = Buffer.byteLength(payload);
      }

      const req = http.request({
        hostname: 'localhost',
        port,
        path,
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

  // 1. Health check
  const health = await request('/api/health');
  assert(health.status === 200, 'Backend is reachable (GET /api/health)');

  // 2. Track link_click event via POST /api/public/track
  const linkClickRes = await request('/api/public/track', 'POST', {
    username: 'rahul',
    event_type: 'link_click',
    metadata: {
      platform: 'github',
      link_url: 'https://github.com/rahulsharma-dev',
      device_type: 'mobile'
    }
  });
  assert(linkClickRes.status === 200 && linkClickRes.data.success, 'POST /api/public/track logs link_click event');

  // 3. Track qr_scan event via POST /api/public/:token/track
  const qrScanRes = await request('/api/public/rahul-demo-2026/track', 'POST', {
    event_type: 'qr_scan',
    metadata: {
      device_type: 'mobile'
    }
  });
  assert(qrScanRes.status === 200 && qrScanRes.data.success, 'POST /api/public/:token/track logs qr_scan event');

  // 4. Invalid event_type returns 400
  const invalidTypeRes = await request('/api/public/track', 'POST', {
    username: 'rahul',
    event_type: 'invalid_event_type'
  });
  assert(invalidTypeRes.status === 400 && !invalidTypeRes.data.success, 'POST /api/public/track rejects invalid event_type with 400');

  // 5. Non-existent profile returns 404
  const notFoundRes = await request('/api/public/track', 'POST', {
    username: 'nonexistent_user_9999',
    event_type: 'page_view'
  });
  assert(notFoundRes.status === 404, 'POST /api/public/track returns 404 for unknown user');

  // 6. Automatic tracking on public profile and vCard endpoints
  const profileVisit = await request('/api/public/profile/rahul-demo-2026');
  assert(profileVisit.status === 200, 'Public profile view auto-tracks page_view');

  const vcardDownload = await request('/api/public/rahul/vcard');
  assert(vcardDownload.status === 200, 'Dynamic vCard download auto-tracks vcard_download');

  // 7. Owner Analytics: Authentication required
  const unauthAnalytics = await request('/api/profile/analytics');
  assert(unauthAnalytics.status === 401, 'GET /api/profile/analytics requires authentication (401 without JWT)');

  // 8. User login to get JWT
  const loginRes = await request('/api/auth/login', 'POST', {
    email: 'rahul@example.com',
    password: 'Password123!'
  });
  assert(loginRes.status === 200 && loginRes.data.token, 'Owner authentication succeeds for rahul@example.com');
  const token = loginRes.data.token;

  // 9. Fetch Owner Analytics Summary
  const analyticsRes = await request('/api/profile/analytics?days=30', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  assert(analyticsRes.status === 200 && analyticsRes.data.success, 'GET /api/profile/analytics returns 200 OK');

  const analytics = analyticsRes.data.analytics;
  assert(Boolean(analytics.summary), 'Analytics response contains summary object');
  assert(analytics.summary.total_page_views > 0, `Total page views recorded (${analytics.summary.total_page_views})`);
  assert(analytics.summary.total_qr_scans > 0, `Total QR scans recorded (${analytics.summary.total_qr_scans})`);
  assert(analytics.summary.total_link_clicks > 0, `Total link clicks recorded (${analytics.summary.total_link_clicks})`);
  assert(analytics.summary.total_vcard_downloads > 0, `Total vCard downloads recorded (${analytics.summary.total_vcard_downloads})`);
  assert(analytics.summary.total_engagements > 0, `Total aggregate engagements (${analytics.summary.total_engagements})`);

  // 10. Verify timeline structure
  assert(Array.isArray(analytics.timeline) && analytics.timeline.length === 30, 'Timeline provides complete 30-day breakdown without gaps');
  const sampleDay = analytics.timeline[0];
  assert(
    sampleDay && sampleDay.date && 'page_views' in sampleDay && 'qr_scans' in sampleDay && 'link_clicks' in sampleDay && 'vcard_downloads' in sampleDay,
    'Timeline item conforms to daily metrics schema'
  );

  // 11. Verify Top Links breakdown
  assert(Array.isArray(analytics.top_links), 'Top links breakdown is an array');
  if (analytics.top_links.length > 0) {
    assert(analytics.top_links[0].url && analytics.top_links[0].clicks > 0, 'Top link contains valid url and click count');
  }

  // 12. Verify Device breakdown
  assert(Boolean(analytics.devices), 'Device breakdown is present');
  assert(
    'mobile' in analytics.devices && 'desktop' in analytics.devices && 'tablet' in analytics.devices,
    'Device breakdown tracks mobile, desktop, and tablet distribution'
  );

  // 13. Verify Recent Activity
  assert(Array.isArray(analytics.recent_activity) && analytics.recent_activity.length > 0, 'Recent activity log provides latest events');
  assert(analytics.recent_activity[0].event_type && analytics.recent_activity[0].created_at, 'Activity items contain event_type and timestamp');

  console.log(`\n========================================`);
  console.log(`📊 Feature 2 Test Results: ${passed} Passed, ${failed} Failed`);
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
