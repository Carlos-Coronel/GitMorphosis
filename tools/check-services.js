const https = require('https');

const services = [
  { name: 'GitHub Readme Stats (Official)', url: 'https://github-readme-stats.vercel.app/api?username=torvalds' },
  { name: 'GitHub Readme Stats (Mirror - Sigma Five)', url: 'https://github-readme-stats-sigma-five.vercel.app/api?username=torvalds' },
  { name: 'GitHub Profile Trophy (Official)', url: 'https://github-profile-trophy.vercel.app/?username=torvalds' },
  { name: 'Streak Stats', url: 'https://streak-stats.demolab.com/?user=torvalds' },
  { name: 'Capsule Render', url: 'https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=header' },
  { name: 'Activity Graph', url: 'https://github-readme-activity-graph.vercel.app/graph?username=torvalds' },
  { name: 'Shields.io', url: 'https://img.shields.io/badge/test-status-green' }
];

function checkService(service) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = https.get(service.url, { timeout: 10000 }, (res) => {
      const duration = Date.now() - start;
      resolve({
        name: service.name,
        url: service.url,
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 400,
        duration: `${duration}ms`
      });
    });

    req.on('error', (err) => {
      resolve({
        name: service.name,
        url: service.url,
        status: 'ERROR',
        ok: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: service.name,
        url: service.url,
        status: 'TIMEOUT',
        ok: false
      });
    });
  });
}

async function run() {
  console.log('--- Checking GitMorphosis Services ---\n');
  const results = await Promise.all(services.map(checkService));
  
  console.table(results.map(r => ({
    Service: r.name,
    Status: r.status,
    OK: r.ok ? '✅' : '❌',
    Time: r.duration || '-',
    Details: r.error || (r.ok ? 'Available' : 'Unavailable')
  })));

  const downServices = results.filter(r => !r.ok);
  if (downServices.length > 0) {
    console.log(`\n⚠️  Found ${downServices.length} service(s) with issues.`);
  } else {
    console.log('\n✅ All services are up and running!');
  }
}

run();
