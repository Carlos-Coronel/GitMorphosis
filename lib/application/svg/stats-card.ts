/**
 * Generador puro de la tarjeta de estadísticas.
 * Generates a GitHub stats card SVG entirely client-side.
 */

interface StatsTheme {
  bg: string; border: string; title: string; text: string;
  icon: string; ring: string; fill: string;
}

const THEMES: Record<string, StatsTheme> = {
  tokyonight: {
    bg: '#1a1b27', border: '#38385a', title: '#70a5fd',
    text: '#cdd6f4', icon: '#70a5fd', ring: '#70a5fd', fill: '#70a5fd',
  },
  flat: {
    bg: '#ffffff', border: '#e4e2e2', title: '#2f80ed',
    text: '#434d58', icon: '#4c71f2', ring: '#2f80ed', fill: '#2f80ed',
  },
  dark: {
    bg: '#141321', border: '#2d2d2d', title: '#fe428e',
    text: '#a9fef7', icon: '#fe428e', ring: '#fe428e', fill: '#fe428e',
  },
  'chartreuse-dark': {
    bg: '#0d1117', border: '#21262d', title: '#39d353',
    text: '#c9d1d9', icon: '#39d353', ring: '#39d353', fill: '#39d353',
  },
  default: {
    bg: '#fffefe', border: '#e4e2e2', title: '#2f80ed',
    text: '#434d58', icon: '#4c71f2', ring: '#2f80ed', fill: '#2f80ed',
  },
};

export interface StatsCardParams {
  username: string;
  theme?: string;
  stars?: number;
  forks?: number;
  followers?: number;
  repos?: number;
  languages?: number;
  featured?: number;
  hideBorder?: boolean;
  showIcons?: boolean;
  layout?: 'default' | 'mobile';
}

type StatIcon = 'star' | 'fork' | 'followers' | 'repo' | 'code' | 'featured';

function svgIcon(name: StatIcon, x: number, y: number, color: string): string {
  const paths: Record<Exclude<StatIcon, 'followers'>, string> = {
    star:   'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z',
    fork:   'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z',
    repo:   'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.5 2.5 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.5 2.5 0 0 1 4.5 9h8Z',
    code:   'M5.22 3.22a.75.75 0 0 1 1.06 1.06L2.56 8l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06Zm5.56 0 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L13.44 8 9.72 4.28a.75.75 0 1 1 1.06-1.06Z',
    featured: 'M8 .75 10.15 5.85 15.25 8l-5.1 2.15L8 15.25l-2.15-5.1L.75 8l5.1-2.15Z',
  };
  if (name === 'followers') {
    return `<g transform="translate(${x},${y})" fill="${color}"><circle cx="5" cy="5" r="3"/><circle cx="11.5" cy="6" r="2.5"/><path d="M0 15c0-3.2 2-5 5-5s5 1.8 5 5H0Zm8.5 0c0-1.8-.5-3.2-1.5-4.2 1-.6 2.1-.8 3.4-.8 3.1 0 5.1 1.8 5.1 5h-7Z"/></g>`;
  }
  return `<g transform="translate(${x},${y})">
    <path d="${paths[name]}" fill="${color}"/>
  </g>`;
}

export function generateStatsCardSvg(params: StatsCardParams): string {
  const {
    username, theme = 'tokyonight', stars = 0, forks = 0,
    followers = 0, repos = 0, languages = 0, featured = 0,
    hideBorder = false, showIcons = true, layout = 'default',
  } = params;

  const t = THEMES[theme] ?? THEMES.tokyonight;
  const mobile = layout === 'mobile';
  const W = mobile ? 340 : 495;
  const H = mobile ? 300 : 195;

  const stats = [
    { label: 'Total Stars',    value: stars,     icon: 'star'   as const },
    { label: 'Total Forks',    value: forks,      icon: 'fork'   as const },
    { label: 'Followers',      value: followers,  icon: 'followers' as const },
    { label: 'Public Repos',   value: repos,      icon: 'repo'   as const },
    { label: 'Languages',      value: languages,  icon: 'code'   as const },
    { label: 'Featured',       value: featured,   icon: 'featured' as const },
  ];

  const rows = stats.map((s, i) => {
    const row = mobile ? i : Math.floor(i / 2);
    const col = mobile ? 0 : i % 2;
    const x = (mobile ? 22 : 25) + col * 220;
    const y = (mobile ? 58 : 60) + row * 38;
    const iconSvg = showIcons ? svgIcon(s.icon, x, y, t.icon) : '';
    const textX = showIcons ? x + 20 : x;
    return `
  ${iconSvg}
  <text x="${textX}" y="${y + 11}" fill="${t.text}" font-size="${mobile ? 14 : 12}" font-family="'Segoe UI',Ubuntu,sans-serif">${s.label}:</text>
  <text x="${mobile ? W - 24 : textX + 120}" y="${y + 11}" fill="${t.title}" font-size="${mobile ? 15 : 13}" font-weight="700" text-anchor="${mobile ? 'end' : 'start'}" font-family="'Segoe UI',Ubuntu,sans-serif">${s.value.toLocaleString()}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub statistics for ${username}">
  <defs>
    <linearGradient id="grad-${username}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.fill}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${t.fill}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" rx="10" fill="${t.bg}"/>
  ${hideBorder ? '' : `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${t.border}" stroke-width="1"/>`}
  <rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="url(#grad-${username})"/>
  <text x="${mobile ? 20 : 25}" y="30" fill="${t.title}" font-size="${mobile ? 16 : 17}" font-weight="700" font-family="'Segoe UI',Ubuntu,sans-serif">${username}'s GitHub Stats</text>
  <line x1="25" y1="40" x2="${W - 25}" y2="40" stroke="${t.border}" stroke-width="0.5" opacity="0.7"/>
  ${rows}
</svg>`;
}
