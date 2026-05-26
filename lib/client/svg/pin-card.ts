/**
 * lib/client/svg/pin-card.ts
 * Generates a repository pin card SVG entirely client-side.
 */

import { LANGUAGE_COLORS } from '@/lib/domain/types';

interface PinTheme {
  bg: string; border: string; title: string; text: string; desc: string; icon: string;
}

const THEMES: Record<string, PinTheme> = {
  tokyonight: { bg: '#1a1b27', border: '#38385a', title: '#70a5fd', text: '#cdd6f4', desc: '#8b949e', icon: '#70a5fd' },
  flat:       { bg: '#ffffff', border: '#e4e2e2', title: '#2f80ed', text: '#24292f', desc: '#57606a', icon: '#4c71f2' },
  dark:       { bg: '#141321', border: '#2d2d2d', title: '#fe428e', text: '#a9fef7', desc: '#8b949e', icon: '#fe428e' },
  'chartreuse-dark': { bg: '#0d1117', border: '#21262d', title: '#39d353', text: '#c9d1d9', desc: '#8b949e', icon: '#39d353' },
  default:    { bg: '#fffefe', border: '#e4e2e2', title: '#2f80ed', text: '#24292f', desc: '#57606a', icon: '#4c71f2' },
};

export interface PinCardParams {
  username: string;
  repo: string;
  description?: string | null;
  language?: string | null;
  stars?: number;
  forks?: number;
  theme?: string;
  hideBorder?: boolean;
  showOwner?: boolean;
}

function wrapText(text: string, maxChars = 55): string[] {
  if (!text) return [];
  if (text.length <= maxChars) return [text];
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
    if (lines.length >= 2) break;
  }
  if (cur && lines.length < 2) lines.push(cur);
  return lines.slice(0, 2);
}

export function generatePinCardSvg(params: PinCardParams): string {
  const {
    username, repo, description, language, stars = 0, forks = 0,
    theme = 'tokyonight', hideBorder = false, showOwner = true,
  } = params;

  const t = THEMES[theme] ?? THEMES.tokyonight;
  const W = 400;
  const descLines = wrapText(description || '');
  const H = 130 + descLines.length * 16;

  const langColor = language ? (LANGUAGE_COLORS[language] || '#8b949e') : '#8b949e';
  const repoTitle = showOwner ? `${username}/${repo}` : repo;

  const descSvg = descLines.map((line, i) =>
    `<text x="20" y="${62 + i * 17}" fill="${t.desc}" font-size="12" font-family="'Segoe UI',Ubuntu,sans-serif">${line}</text>`
  ).join('\n  ');

  const footerY = 62 + descLines.length * 17 + 14;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="10" fill="${t.bg}"/>
  ${hideBorder ? '' : `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${t.border}" stroke-width="1"/>`}

  <!-- Repo icon -->
  <g transform="translate(20,18)">
    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"
          fill="${t.icon}"/>
  </g>

  <!-- Repo title -->
  <text x="42" y="33" fill="${t.title}" font-size="14" font-weight="700"
        font-family="'Segoe UI',Ubuntu,sans-serif">${repoTitle}</text>

  <!-- Description -->
  ${descSvg}

  <!-- Footer: language + stars + forks -->
  ${language ? `
  <circle cx="20" cy="${footerY}" r="6" fill="${langColor}"/>
  <text x="30" y="${footerY + 4}" fill="${t.text}" font-size="11" font-family="'Segoe UI',Ubuntu,sans-serif">${language}</text>` : ''}

  <!-- Star icon -->
  <g transform="translate(${language ? 110 : 20},${footerY - 8})">
    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
          fill="${t.icon}" transform="scale(0.85)"/>
  </g>
  <text x="${language ? 126 : 36}" y="${footerY + 4}" fill="${t.text}" font-size="11" font-family="'Segoe UI',Ubuntu,sans-serif">${stars}</text>

  <!-- Fork icon -->
  <g transform="translate(${language ? 155 : 65},${footerY - 8})">
    <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0Z"
          fill="${t.icon}" transform="scale(0.85)"/>
  </g>
  <text x="${language ? 171 : 81}" y="${footerY + 4}" fill="${t.text}" font-size="11" font-family="'Segoe UI',Ubuntu,sans-serif">${forks}</text>
</svg>`;
}

export function pinDataUri(params: PinCardParams): string {
  const svg = generatePinCardSvg(params);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
