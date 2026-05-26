import { NextRequest, NextResponse } from 'next/server';

const THEMES: Record<string, { bg: string; border: string; title: string; text: string; barBg: string }> = {
  tokyonight:       { bg: '#1a1b27', border: '#414868', title: '#70a5fd', text: '#c0caf5', barBg: '#24283b' },
  flat:             { bg: '#ffffff', border: '#e4e2e2', title: '#2f80ed', text: '#333333', barBg: '#f0f0f0' },
  dark:             { bg: '#141321', border: '#2d2d2d', title: '#fe428e', text: '#a9fef7', barBg: '#1d1d2b' },
  'chartreuse-dark':{ bg: '#0d1117', border: '#21262d', title: '#80ff00', text: '#c9d1d9', barBg: '#161b22' },
  default:          { bg: '#ffffff', border: '#e4e2e2', title: '#2f80ed', text: '#333333', barBg: '#f0f0f0' },
};

// Default fallback colors for languages
const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  'C++': '#f34b7d', C: '#555555', 'C#': '#178600', Go: '#00ADD8', Rust: '#dea584',
  Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  Scala: '#c22d40', R: '#198CE7', Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c',
  Vue: '#41b883', Svelte: '#ff3e00', Elixir: '#6e4a7e', Lua: '#000080', Zig: '#ec915c',
};

function getLangColor(lang: string, fallback?: string): string {
  return LANG_COLORS[lang] ?? fallback ?? '#8b949e';
}

interface LangEntry { language: string; percentage: number; color?: string }

export async function GET(request: NextRequest) {
  const params    = request.nextUrl.searchParams;
  const username  = params.get('username') || 'github';
  const themeKey  = params.get('theme') || 'default';
  const layout    = params.get('layout') || 'compact';
  const hideBorder= params.get('hide_border') === 'true';

  // langs param: JSON encoded array of {language, percentage, color}
  let langs: LangEntry[] = [];
  try {
    const raw = params.get('langs');
    if (raw) langs = JSON.parse(decodeURIComponent(raw));
  } catch { /* ignore */ }

  // Fallback to individual lang_N params
  if (langs.length === 0) {
    let i = 0;
    while (params.has(`lang${i}`)) {
      const l = params.get(`lang${i}`) || '';
      const p = parseFloat(params.get(`pct${i}`) || '0');
      const c = params.get(`col${i}`) || '';
      if (l) langs.push({ language: l, percentage: p, color: c });
      i++;
    }
  }

  // Limit to top 8
  langs = langs.slice(0, 8);

  const t = THEMES[themeKey] ?? THEMES['default'];
  const borderWidth  = hideBorder ? 0 : 1;
  const borderRadius = hideBorder ? 0 : 10;

  const width = 320;
  const BAR_WIDTH = width - 60;

  if (layout === 'compact') {
    // Single full-width stacked bar + legend below
    const barHeight = 10;
    const legendItemH = 20;
    const totalH = 90 + langs.length * legendItemH + 20;

    // Build the stacked bar segments
    let barX = 30;
    const segments = langs.map(l => {
      const segW = Math.max(2, (l.percentage / 100) * BAR_WIDTH);
      const color = getLangColor(l.language, l.color);
      const seg = `<rect x="${barX.toFixed(1)}" y="60" width="${segW.toFixed(1)}" height="${barHeight}" fill="${color}" rx="0"/>`;
      barX += segW;
      return seg;
    });

    const legend = langs.map((l, i) => {
      const color = getLangColor(l.language, l.color);
      const y = 90 + i * legendItemH;
      return `
      <circle cx="35" cy="${y + 4}" r="5" fill="${color}"/>
      <text x="45" y="${y + 8}" fill="${t.text}" font-size="11" font-family="Segoe UI,Ubuntu,sans-serif">${l.language}</text>
      <text x="${width - 15}" y="${y + 8}" fill="${t.title}" font-size="11" font-weight="bold" text-anchor="end" font-family="Segoe UI,Ubuntu,sans-serif">${l.percentage.toFixed(1)}%</text>`;
    }).join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalH}" viewBox="0 0 ${width} ${totalH}">
  <rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${width - borderWidth}" height="${totalH - borderWidth}"
        rx="${borderRadius}" ry="${borderRadius}"
        fill="${t.bg}" stroke="${hideBorder ? 'none' : t.border}" stroke-width="${borderWidth}"/>
  <text x="${width / 2}" y="38" fill="${t.title}" font-size="14" font-weight="bold" text-anchor="middle"
        font-family="Segoe UI,Ubuntu,sans-serif">Most Used Languages</text>
  <!-- Stacked bar background -->
  <rect x="30" y="60" width="${BAR_WIDTH}" height="${barHeight}" fill="${t.barBg}" rx="5"/>
  <!-- Stacked bar segments -->
  <clipPath id="bar-clip"><rect x="30" y="60" width="${BAR_WIDTH}" height="${barHeight}" rx="5"/></clipPath>
  <g clip-path="url(#bar-clip)">${segments.join('')}</g>
  ${legend}
</svg>`;

    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=1800' },
    });
  }

  // Normal layout: individual bars
  const itemH = 32;
  const totalH = 65 + langs.length * itemH + 20;

  const bars = langs.map((l, i) => {
    const color = getLangColor(l.language, l.color);
    const y = 55 + i * itemH;
    const barW = Math.max(2, (l.percentage / 100) * BAR_WIDTH);
    return `
    <text x="30" y="${y}" fill="${t.text}" font-size="12" font-family="Segoe UI,Ubuntu,sans-serif">${l.language}</text>
    <text x="${width - 15}" y="${y}" fill="${t.title}" font-size="12" font-weight="bold" text-anchor="end" font-family="Segoe UI,Ubuntu,sans-serif">${l.percentage.toFixed(1)}%</text>
    <rect x="30" y="${y + 5}" width="${BAR_WIDTH}" height="7" fill="${t.barBg}" rx="3"/>
    <rect x="30" y="${y + 5}" width="${barW.toFixed(1)}" height="7" fill="${color}" rx="3"/>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalH}" viewBox="0 0 ${width} ${totalH}">
  <rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${width - borderWidth}" height="${totalH - borderWidth}"
        rx="${borderRadius}" ry="${borderRadius}"
        fill="${t.bg}" stroke="${hideBorder ? 'none' : t.border}" stroke-width="${borderWidth}"/>
  <text x="${width / 2}" y="38" fill="${t.title}" font-size="14" font-weight="bold" text-anchor="middle"
        font-family="Segoe UI,Ubuntu,sans-serif">Most Used Languages</text>
  ${bars}
</svg>`;

  return new NextResponse(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=1800' },
  });
}
