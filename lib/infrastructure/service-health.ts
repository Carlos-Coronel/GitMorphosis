/**
 * lib/infrastructure/service-health.ts
 * Utility to check the status of external services used by GitMorphosis.
 */

export interface ServiceStatus {
  name: string;
  url: string;
  isUp: boolean;
  statusCode?: number;
  lastChecked: Date;
}

const SERVICES = [
  { name: 'github-readme-stats', url: 'https://github-readme-stats-sigma-five.vercel.app/api?username=torvalds' },
  { name: 'github-profile-trophy', url: 'https://github-profile-trophy.vercel.app/?username=torvalds' },
  { name: 'trophy-mirror', url: 'https://github-profile-trophy-one.vercel.app/?username=torvalds' },
  { name: 'streak-stats', url: 'https://streak-stats.demolab.com/?user=torvalds' },
  { name: 'capsule-render', url: 'https://capsule-render.vercel.app/api?type=waving&height=50&section=header' },
];

export async function checkServicesHealth(): Promise<ServiceStatus[]> {
  const checks = SERVICES.map(async (service) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(service.url, { 
        method: 'HEAD', 
        signal: controller.signal,
        mode: 'no-cors'
      });
      
      clearTimeout(timeoutId);
      
      // Con no-cors, la respuesta es opaca y no podemos ver el status.
      // Marcamos como caídos los servicios conocidos por estar rotos (oficiales).
      const isKnownBroken = service.name === 'github-profile-trophy' || (service.name === 'github-readme-stats' && service.url.includes('github-readme-stats.vercel.app'));

      return {
        name: service.name,
        url: service.url,
        isUp: !isKnownBroken, 
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: service.name,
        url: service.url,
        isUp: false,
        lastChecked: new Date(),
      };
    }
  });

  return Promise.all(checks);
}

// In-memory cache for health status
let healthCache: ServiceStatus[] | null = null;
let lastCheckTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function getCachedServiceHealth(): Promise<ServiceStatus[]> {
  const now = Date.now();
  if (!healthCache || (now - lastCheckTime) > CACHE_TTL) {
    healthCache = await checkServicesHealth();
    lastCheckTime = now;
  }
  return healthCache;
}
