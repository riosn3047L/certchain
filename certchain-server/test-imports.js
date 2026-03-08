// Test if all route modules can be loaded without errors
async function testImports() {
  const modules = [
    './src/routes/analytics.routes.js',
    './src/routes/institution.routes.js',
    './src/routes/bulk.routes.js',
    './src/routes/cert.routes.js',
    './src/middleware/rateLimiter.js',
    './src/middleware/errorHandler.js',
    './src/services/csv.service.js',
  ];

  for (const mod of modules) {
    try {
      const m = await import(mod);
      console.log(`OK: ${mod} (default: ${typeof m.default})`);
    } catch (e) {
      console.error(`FAIL: ${mod} => ${e.message}`);
    }
  }
}

testImports();
