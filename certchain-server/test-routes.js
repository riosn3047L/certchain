// Quick test to hit all new API endpoints
async function test() {
  const endpoints = [
    { url: 'http://localhost:3001/health', method: 'GET' },
    { url: 'http://localhost:3001/api/v1/analytics/overview', method: 'GET' },
    { url: 'http://localhost:3001/api/v1/institutions', method: 'GET' },
    { url: 'http://localhost:3001/api/v1/certificates', method: 'GET' },
    { url: 'http://localhost:3001/api/v1/analytics/live-log', method: 'GET' },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, { method: ep.method });
      const text = await res.text();
      console.log(`[${res.status}] ${ep.method} ${ep.url}`);
      console.log(`  Body (first 200 chars): ${text.substring(0, 200)}`);
      console.log();
    } catch (e) {
      console.error(`[ERROR] ${ep.method} ${ep.url}: ${e.message}`);
    }
  }
}

test();
