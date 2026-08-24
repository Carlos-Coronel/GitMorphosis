/**
 * Generador puro de la tarjeta de trofeos.
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
    bg: '#ffffff', border: '#d0d7de', title: '#0969da', text: '#24292f',
    gold: '#9a6700', silver: '#57606a', bronze: '#bc4c00',
    emerald: '#1a7f37', sapphire: '#0969da', amethyst: '#8250df'
  },
  dark: {
    bg: '#141321', border: '#2d2d2d', title: '#fe428e', text: '#a9fef7',
    gold: '#ff9e64', silver: '#9ece6a', bronze: '#e0af68',
    emerald: '#73daca', sapphire: '#b4f9f8', amethyst: '#bb9af7'
  },
  default: {
    bg: '#ffffff', border: '#d0d7de', title: '#0969da', text: '#24292f',
    gold: '#9a6700', silver: '#57606a', bronze: '#bc4c00',
    emerald: '#1a7f37', sapphire: '#0969da', amethyst: '#8250df'
  },
};

export interface TrophyCardParams {
  theme?: string;
  stats: {
    stars: number;
    forks: number;
    followers: number;
    repos: number;
    languages: number;
    featured: number;
  };
  hideBorder?: boolean;
  layout?: 'default' | 'mobile';
}

type TrophyIcon = 'star' | 'fork' | 'followers' | 'repo' | 'code' | 'featured';

function trophyIcon(name: TrophyIcon, x: number, y: number, color: string, scale = 1): string {
  const paths: Record<Exclude<TrophyIcon, 'followers'>, string> = {
    star: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z',
    fork: 'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0Z',
    repo: 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.5 2.5 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.5 2.5 0 0 1 4.5 9h8Z',
    code: 'M5.22 3.22a.75.75 0 0 1 1.06 1.06L2.56 8l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06Zm5.56 0 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L13.44 8 9.72 4.28a.75.75 0 1 1 1.06-1.06Z',
    featured: 'M8 .75 10.15 5.85 15.25 8l-5.1 2.15L8 15.25l-2.15-5.1L.75 8l5.1-2.15Z',
  };
  if (name === 'followers') {
    return `<g transform="translate(${x},${y}) scale(${scale})" fill="${color}"><circle cx="5" cy="5" r="3"/><circle cx="11.5" cy="6" r="2.5"/><path d="M0 15c0-3.2 2-5 5-5s5 1.8 5 5H0Zm8.5 0c0-1.8-.5-3.2-1.5-4.2 1-.6 2.1-.8 3.4-.8 3.1 0 5.1 1.8 5.1 5h-7Z"/></g>`;
  }
  return `<path d="${paths[name]}" fill="${color}" transform="translate(${x},${y}) scale(${scale})"/>`;
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
  const { theme = 'tokyonight', stats, hideBorder = false, layout = 'default' } = params;
  const t = THEMES[theme] ?? THEMES.tokyonight;

  const trophySpecs = [
    { label: 'Stars', value: stats.stars, icon: 'star' as const, thresholds: [0, 10, 50, 100, 500, 1000] },
    { label: 'Forks', value: stats.forks, icon: 'fork' as const, thresholds: [0, 5, 20, 50, 100, 500] },
    { label: 'Followers', value: stats.followers, icon: 'followers' as const, thresholds: [0, 10, 50, 100, 200, 500] },
    { label: 'Repos', value: stats.repos, icon: 'repo' as const, thresholds: [0, 5, 10, 20, 50, 100] },
    { label: 'Languages', value: stats.languages, icon: 'code' as const, thresholds: [0, 2, 4, 6, 8, 12] },
    { label: 'Featured', value: stats.featured, icon: 'featured' as const, thresholds: [0, 2, 4, 6, 8, 12] },
  ];

  const trophies = trophySpecs.map(spec => {
    const { rank, colorKey } = getRank(spec.value, spec.thresholds);
    return { ...spec, rank, color: t[colorKey] as string };
  });

  const mobile = layout === 'mobile';
  const W = mobile ? 340 : 700;
  const H = mobile ? 316 : 120;
  const trophyW = mobile ? 145 : 100;
  const trophyH = mobile ? 92 : 100;
  const gap = mobile ? 10 : 12;

  const trophySvgs = trophies.map((tr, i) => {
    const col = mobile ? i % 2 : i;
    const row = mobile ? Math.floor(i / 2) : 0;
    const x = mobile ? 20 + col * (trophyW + gap) : 20 + col * (trophyW + gap);
    const y = 10 + row * 102;
    return `
    <g transform="translate(${x},${y})">
      <rect width="${trophyW}" height="${trophyH}" rx="8" fill="${t.bg}" stroke="${tr.color}" stroke-width="2" opacity="0.8"/>
      <text x="${trophyW / 2}" y="${mobile ? 20 : 22}" fill="${t.title}" font-size="${mobile ? 12 : 10}" font-weight="700" text-anchor="middle" font-family="'Segoe UI',Ubuntu,sans-serif">${tr.label}</text>
      ${trophyIcon(tr.icon, trophyW / 2 - (mobile ? 25 : 9), mobile ? 31 : 31, tr.color, mobile ? 1.25 : 1.05)}
      <text x="${trophyW / 2 + (mobile ? 23 : 0)}" y="${mobile ? 51 : 75}" fill="${tr.color}" font-size="${mobile ? 23 : 24}" font-weight="900" text-anchor="middle" font-family="'Segoe UI',Ubuntu,sans-serif">${tr.rank}</text>
      <text x="${trophyW / 2}" y="${mobile ? 78 : 92}" fill="${t.text}" font-size="${mobile ? 12 : 9}" text-anchor="middle" font-family="'Segoe UI',Ubuntu,sans-serif">${tr.value.toLocaleString()}</text>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub achievements">
  <rect width="${W}" height="${H}" rx="10" fill="${t.bg}"/>
  ${hideBorder ? '' : `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${t.border}" stroke-width="1"/>`}
  ${trophySvgs}
</svg>`;
}
