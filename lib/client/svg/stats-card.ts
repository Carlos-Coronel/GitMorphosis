/**
 * lib/client/svg/stats-card.ts
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
  commits?: number;
  prs?: number;
  issues?: number;
  followers?: number;
  repos?: number;
  hideBorder?: boolean;
  showIcons?: boolean;
}

function icon(name: 'star' | 'commit' | 'pr' | 'issue' | 'fork', color: string): string {
  const paths: Record<string, string> = {
    star:   'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z',
    commit: 'M11.93 8.5a4.0015 4.0015 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.0015 4.0015 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z',
    pr:     'M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z',
    issue:  'M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0A6.5 6.5 0 0 0 1.5 8Z',
    fork:   'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z',
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="${color}"><path d="${paths[name]}"/></svg>`;
}

function svgIcon(name: 'star' | 'commit' | 'pr' | 'issue' | 'fork', x: number, y: number, color: string): string {
  const paths: Record<string, string> = {
    star:   'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z',
    commit: 'M11.93 8.5a4.0015 4.0015 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.0015 4.0015 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z',
    pr:     'M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z',
    issue:  'M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0A6.5 6.5 0 0 0 1.5 8Z',
    fork:   'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z',
  };
  return `<g transform="translate(${x},${y})">
    <path d="${paths[name]}" fill="${color}"/>
  </g>`;
}

export function generateStatsCardSvg(params: StatsCardParams): string {
  const {
    username, theme = 'tokyonight', stars = 0, commits = 0,
    prs = 0, issues = 0, followers = 0, repos = 0,
    hideBorder = false, showIcons = true,
  } = params;

  const t = THEMES[theme] ?? THEMES.tokyonight;
  const W = 495, H = 195;

  const stats = [
    { label: 'Total Stars',    value: stars,     icon: 'star'   as const },
    { label: 'Total Commits',  value: commits,   icon: 'commit' as const },
    { label: 'Total PRs',      value: prs,        icon: 'pr'     as const },
    { label: 'Total Issues',   value: issues,     icon: 'issue'  as const },
    { label: 'Followers',      value: followers,  icon: 'fork'   as const },
    { label: 'Public Repos',   value: repos,      icon: 'fork'   as const },
  ];

  const rows = stats.map((s, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = 25 + col * 220;
    const y = 60 + row * 38;
    const iconSvg = showIcons ? svgIcon(s.icon, x, y, t.icon) : '';
    const textX = showIcons ? x + 20 : x;
    return `
  ${iconSvg}
  <text x="${textX}" y="${y + 11}" fill="${t.text}" font-size="12" font-family="'Segoe UI',Ubuntu,sans-serif">${s.label}:</text>
  <text x="${textX + 120}" y="${y + 11}" fill="${t.title}" font-size="13" font-weight="700" font-family="'Segoe UI',Ubuntu,sans-serif">${s.value.toLocaleString()}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="grad-${username}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.fill}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${t.fill}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" rx="10" fill="${t.bg}"/>
  ${hideBorder ? '' : `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${t.border}" stroke-width="1"/>`}
  <rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="url(#grad-${username})"/>
  <text x="25" y="30" fill="${t.title}" font-size="17" font-weight="700" font-family="'Segoe UI',Ubuntu,sans-serif">${username}'s GitHub Stats</text>
  <line x1="25" y1="40" x2="${W - 25}" y2="40" stroke="${t.border}" stroke-width="0.5" opacity="0.7"/>
  ${rows}
</svg>`;
}

export function statsDataUri(params: StatsCardParams): string {
  const svg = generateStatsCardSvg(params);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
