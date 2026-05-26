import { NextRequest, NextResponse } from 'next/server';

// Paletas de temas
const THEMES: Record<string, { bg: string; border: string; title: string; text: string; icon: string; ring: string; statBg: string }> = {
  tokyonight: { bg: '#1a1b27', border: '#414868', title: '#70a5fd', text: '#c0caf5', icon: '#bb9af7', ring: '#414868', statBg: '#24283b' },
  flat:        { bg: '#ffffff', border: '#e4e2e2', title: '#2f80ed', text: '#333333', icon: '#4c71a8', ring: '#e4e2e2', statBg: '#f6f8fa' },
  dark:        { bg: '#141321', border: '#2d2d2d', title: '#fe428e', text: '#a9fef7', icon: '#f8d847', ring: '#2d2d2d', statBg: '#1d1d2b' },
  'chartreuse-dark': { bg: '#0d1117', border: '#21262d', title: '#80ff00', text: '#c9d1d9', icon: '#80ff00', ring: '#21262d', statBg: '#161b22' },
  default:     { bg: '#ffffff', border: '#e4e2e2', title: '#2f80ed', text: '#333333', icon: '#4c71a8', ring: '#e4e2e2', statBg: '#f6f8fa' },
};

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const username   = params.get('username') || 'github';
  const themeKey   = params.get('theme') || 'default';
  const stars      = parseInt(params.get('stars') || '0', 10);
  const commits    = parseInt(params.get('commits') || '0', 10);
  const prs        = parseInt(params.get('prs') || '0', 10);
  const issues     = parseInt(params.get('issues') || '0', 10);
  const followers  = parseInt(params.get('followers') || '0', 10);
  const repos      = parseInt(params.get('repos') || '0', 10);
  const showIcons  = params.get('show_icons') !== 'false';
  const hideBorder = params.get('hide_border') === 'true';

  const t = THEMES[themeKey] ?? THEMES['default'];

  // Icono SVG reutilizable
  const starIcon = showIcons
    ? `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${t.icon}" />`
    : '';

  const statsItems = [
    { label: 'Total Stars Earned', value: formatNum(stars), iconD: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { label: 'Total Commits',      value: formatNum(commits), iconD: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z' },
    { label: 'Total PRs',          value: formatNum(prs),     iconD: 'M18 15l-6-6-6 6' },
    { label: 'Total Issues',       value: formatNum(issues),  iconD: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6v-4m0-4h.01' },
    { label: 'Followers',          value: formatNum(followers), iconD: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { label: 'Public Repos',       value: formatNum(repos),   iconD: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  ];

  const itemH = 35;
  const topPad = 70;
  const leftPad = showIcons ? 30 : 20;
  const totalH = topPad + statsItems.length * itemH + 25;
  const width = 420;
  const borderRadius = hideBorder ? 0 : 10;
  const borderWidth  = hideBorder ? 0 : 1;

  const rows = statsItems.map((item, i) => {
    const y = topPad + i * itemH;
    const iconSvg = showIcons
      ? `<svg x="20" y="${y - 13}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${t.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${item.iconD}" /></svg>`
      : '';
    return `
    ${iconSvg}
    <text x="${leftPad + (showIcons ? 22 : 0)}" y="${y}" fill="${t.text}" font-size="13" font-family="Segoe UI,Ubuntu,sans-serif">${item.label}:</text>
    <text x="${width - 20}" y="${y}" fill="${t.title}" font-size="13" font-weight="bold" text-anchor="end" font-family="Segoe UI,Ubuntu,sans-serif">${item.value}</text>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalH}" viewBox="0 0 ${width} ${totalH}">
  <style>
    * { font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif; }
  </style>
  <rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${width - borderWidth}" height="${totalH - borderWidth}"
        rx="${borderRadius}" ry="${borderRadius}"
        fill="${t.bg}" stroke="${hideBorder ? 'none' : t.border}" stroke-width="${borderWidth}" />
  
  <!-- Subtle inner shadow / top accent -->
  <line x1="20" y1="55" x2="${width - 20}" y2="55" stroke="${t.border}" stroke-width="1" opacity="0.5"/>

  <!-- Title -->
  <text x="${width / 2}" y="38" fill="${t.title}" font-size="16" font-weight="bold" text-anchor="middle"
        font-family="Segoe UI,Ubuntu,sans-serif">${username}'s GitHub Stats</text>

  <!-- Stats -->
  ${rows}
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  });
}
