/**
 * lib/client/svg/trophy-card.ts
 * Generates a GitHub trophies card SVG entirely client-side as a fallback for github-profile-trophy.
 */

interface TrophyTheme {
  bg: string;
  border: string;
  title: string;
  text: string;
  gold: string;
  silver: string;
  bronze: string;
  emerald: string;
  sapphire: string;
  amethyst: string;
}

const THEMES: Record<string, TrophyTheme> = {
  tokyonight: {
    bg: '#1a1b27', border: '#38385a', title: '#70a5fd', text: '#cdd6f4',
    gold: '#ff9e64', silver: '#9ece6a', bronze: '#e0af68',
    emerald: '#73daca', sapphire: '#b4f9f8', amethyst: '#bb9af7'
  },
  flat: {
    bg: '#ffffff', border: '#e4e2e2', title: '#2f80ed', text: '#434d58',
    gold: '#f1c40f', silver: '#95a5a6', bronze: '#e67e22',
    emerald: '#2ecc71', sapphire: '#3498db', amethyst: '#9b59b6'
  },
  dark: {
    bg: '#141321', border: '#2d2d2d', title: '#fe428e', text: '#a9fef7',
    gold: '#ff9e64', silver: '#9ece6a', bronze: '#e0af68',
    emerald: '#73daca', sapphire: '#b4f9f8', amethyst: '#bb9af7'
  },
  default: {
    bg: '#fffefe', border: '#e4e2e2', title: '#2f80ed', text: '#434d58',
    gold: '#f1c40f', silver: '#95a5a6', bronze: '#e67e22',
    emerald: '#2ecc71', sapphire: '#3498db', amethyst: '#9b59b6'
  },
};

export interface Trophy {
  label: string;
  value: number;
  rank: string;
  color: string;
}

export interface TrophyCardParams {
  username: string;
  theme?: string;
  stats: {
    stars: number;
    commits: number;
    prs: number;
    issues: number;
    followers: number;
    repos: number;
  };
  hideBorder?: boolean;
}

function getRank(value: number, thresholds: number[]): { rank: string; colorKey: keyof TrophyTheme } {
  if (value >= thresholds[5]) return { rank: 'SSS', colorKey: 'amethyst' };
  if (value >= thresholds[4]) return { rank: 'SS', colorKey: 'sapphire' };
  if (value >= thresholds[3]) return { rank: 'S', colorKey: 'emerald' };
  if (value >= thresholds[2]) return { rank: 'A', colorKey: 'gold' };
  if (value >= thresholds[1]) return { rank: 'B', colorKey: 'silver' };
  return { rank: 'C', colorKey: 'bronze' };
}

export function generateTrophyCardSvg(params: TrophyCardParams): string {
  const { username, theme = 'tokyonight', stats, hideBorder = false } = params;
  const t = THEMES[theme] ?? THEMES.tokyonight;

  const trophySpecs = [
    { label: 'Stars', value: stats.stars, icon: '⭐', thresholds: [0, 10, 50, 100, 500, 1000] },
    { label: 'Commits', value: stats.commits, icon: '📝', thresholds: [0, 100, 500, 1000, 2000, 5000] },
    { label: 'PRs', value: stats.prs, icon: '🔀', thresholds: [0, 10, 50, 100, 200, 500] },
    { label: 'Issues', value: stats.issues, icon: '❗️', thresholds: [0, 10, 50, 100, 200, 500] },
    { label: 'Followers', value: stats.followers, icon: '👥', thresholds: [0, 10, 50, 100, 200, 500] },
    { label: 'Repos', value: stats.repos, icon: '📁', thresholds: [0, 5, 10, 20, 50, 100] },
  ];

  const trophies = trophySpecs.map(spec => {
    const { rank, colorKey } = getRank(spec.value, spec.thresholds);
    return { ...spec, rank, color: t[colorKey] as string };
  });

  const W = 700, H = 120;
  const trophyW = 100, trophyH = 100;
  const gap = 12;

  const trophySvgs = trophies.map((tr, i) => {
    const x = 20 + i * (trophyW + gap);
    const y = 10;
    return `
    <g transform="translate(${x},${y})">
      <rect width="${trophyW}" height="${trophyH}" rx="8" fill="${t.bg}" stroke="${tr.color}" stroke-width="2" opacity="0.8"/>
      <text x="${trophyW / 2}" y="22" fill="${t.title}" font-size="10" font-weight="700" text-anchor="middle" font-family="'Segoe UI',Ubuntu,sans-serif">${tr.label}</text>
      <text x="${trophyW / 2}" y="45" font-size="20" text-anchor="middle">${tr.icon}</text>
      <text x="${trophyW / 2}" y="75" fill="${tr.color}" font-size="24" font-weight="900" text-anchor="middle" font-family="'Segoe UI',Ubuntu,sans-serif">${tr.rank}</text>
      <text x="${trophyW / 2}" y="92" fill="${t.text}" font-size="9" text-anchor="middle" font-family="'Segoe UI',Ubuntu,sans-serif">${tr.value.toLocaleString()}</text>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="10" fill="${t.bg}"/>
  ${hideBorder ? '' : `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${t.border}" stroke-width="1"/>`}
  ${trophySvgs}
</svg>`;
}

export function trophyDataUri(params: TrophyCardParams): string {
  const svg = generateTrophyCardSvg(params);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
