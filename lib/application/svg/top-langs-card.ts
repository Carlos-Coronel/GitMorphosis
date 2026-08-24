/**
 * Generador puro de la tarjeta de lenguajes.
 * Generates a top languages card SVG entirely client-side.
 */

import { LanguageStats, LANGUAGE_COLORS } from '@/lib/domain/types';

interface LangsTheme {
  bg: string; border: string; title: string; text: string;
}

const THEMES: Record<string, LangsTheme> = {
  tokyonight: { bg: '#1a1b27', border: '#38385a', title: '#70a5fd', text: '#cdd6f4' },
  flat:       { bg: '#ffffff', border: '#d0d7de', title: '#0969da', text: '#24292f' },
  dark:       { bg: '#141321', border: '#2d2d2d', title: '#fe428e', text: '#a9fef7' },
  'chartreuse-dark': { bg: '#0d1117', border: '#21262d', title: '#39d353', text: '#c9d1d9' },
  default:    { bg: '#ffffff', border: '#d0d7de', title: '#0969da', text: '#24292f' },
};

export interface TopLangsParams {
  languages: LanguageStats[];
  theme?: string;
  hideBorder?: boolean;
  layout?: 'compact' | 'normal';
  langCount?: number;
  width?: 340 | 495;
}

export function generateTopLangsCardSvg(params: TopLangsParams): string {
  const {
    languages, theme = 'tokyonight',
    hideBorder = false, layout = 'normal', langCount = 8, width = 495,
  } = params;

  const t = THEMES[theme] ?? THEMES.tokyonight;
  const langs = languages.slice(0, langCount);
  const W = width;
  const mobile = width === 340;

  if (layout === 'compact') {
    const H = mobile ? 160 : 120;
    // Progress bar layout
    const total = langs.reduce((s, l) => s + l.percentage, 0) || 1;
    let xOffset = 25;
    const barY = mobile ? 55 : 70;
    const barH = 10;
    const barW = W - 50;

    const bars = langs.map(l => {
      const w = Math.round((l.percentage / total) * barW);
      const color = l.color || LANGUAGE_COLORS[l.language] || '#8b949e';
      const bar = `<rect x="${xOffset}" y="${barY}" width="${w}" height="${barH}" fill="${color}"/>`;
      xOffset += w;
      return bar;
    }).join('');

    const labels = langs.slice(0, 6).map((l, i) => {
      const columns = mobile ? 2 : 3;
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = (mobile ? 20 : 25) + col * (mobile ? 160 : 150);
      const y = barY + barH + 18 + row * (mobile ? 22 : 18);
      const color = l.color || LANGUAGE_COLORS[l.language] || '#8b949e';
      return `<circle cx="${x}" cy="${y - 4}" r="5" fill="${color}"/>
  <text x="${x + 15}" y="${y}" fill="${t.text}" font-size="${mobile ? 12 : 11}" font-family="'Segoe UI',Ubuntu,sans-serif">${l.language}</text>
  <text x="${x + (mobile ? 142 : 130)}" y="${y}" fill="${t.title}" font-size="${mobile ? 12 : 11}" font-weight="600" font-family="'Segoe UI',Ubuntu,sans-serif" text-anchor="end">${l.percentage.toFixed(1)}%</text>`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Most used languages">
  <rect width="${W}" height="${H}" rx="10" fill="${t.bg}"/>
  ${hideBorder ? '' : `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${t.border}" stroke-width="1"/>`}
  <text x="25" y="28" fill="${t.title}" font-size="15" font-weight="700" font-family="'Segoe UI',Ubuntu,sans-serif">Most Used Languages</text>
  <line x1="25" y1="36" x2="${W - 25}" y2="36" stroke="${t.border}" stroke-width="0.5"/>
  <!-- Progress bars -->
  <rect x="25" y="${barY}" width="${W - 50}" height="${barH}" rx="4" fill="${t.border}" opacity="0.3"/>
  ${bars}
  ${labels}
</svg>`;
  }

  // Normal layout: list with progress bars per language
  const itemH = 30;
  const H = 40 + langs.length * itemH + 20;
  const barStart = mobile ? 120 : 150;
  const barMaxW = W - barStart - 55;
  const maxPct = Math.max(...langs.map(l => l.percentage), 1);

  const items = langs.map((l, i) => {
    const y = 45 + i * itemH;
    const color = l.color || LANGUAGE_COLORS[l.language] || '#8b949e';
    const barW = Math.round((l.percentage / maxPct) * barMaxW);
    return `
  <circle cx="30" cy="${y}" r="6" fill="${color}"/>
  <text x="45" y="${y + 4}" fill="${t.text}" font-size="12" font-family="'Segoe UI',Ubuntu,sans-serif">${l.language}</text>
  <rect x="${barStart}" y="${y - 6}" width="${barMaxW}" height="8" rx="4" fill="${t.border}" opacity="0.3"/>
  <rect x="${barStart}" y="${y - 6}" width="${barW}" height="8" rx="4" fill="${color}"/>
  <text x="${W - 25}" y="${y + 4}" fill="${t.title}" font-size="11" font-weight="600" font-family="'Segoe UI',Ubuntu,sans-serif" text-anchor="end">${l.percentage.toFixed(1)}%</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Most used languages">
  <rect width="${W}" height="${H}" rx="10" fill="${t.bg}"/>
  ${hideBorder ? '' : `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${t.border}" stroke-width="1"/>`}
  <text x="25" y="28" fill="${t.title}" font-size="15" font-weight="700" font-family="'Segoe UI',Ubuntu,sans-serif">Most Used Languages</text>
  <line x1="25" y1="36" x2="${W - 25}" y2="36" stroke="${t.border}" stroke-width="0.5"/>
  ${items}
</svg>`;
}
