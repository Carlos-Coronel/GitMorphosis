import { NextRequest, NextResponse } from 'next/server';

const THEMES: Record<string, { bg: string; border: string; title: string; text: string; sub: string; badge: string }> = {
  tokyonight:       { bg: '#1a1b27', border: '#414868', title: '#70a5fd', text: '#c0caf5', sub: '#787c99', badge: '#24283b' },
  flat:             { bg: '#ffffff', border: '#e4e2e2', title: '#2f80ed', text: '#333333', sub: '#888888', badge: '#f0f0f0' },
  dark:             { bg: '#141321', border: '#2d2d2d', title: '#fe428e', text: '#a9fef7', sub: '#5a5a7a', badge: '#1d1d2b' },
  'chartreuse-dark':{ bg: '#0d1117', border: '#21262d', title: '#80ff00', text: '#c9d1d9', sub: '#484f58', badge: '#161b22' },
  default:          { bg: '#ffffff', border: '#e4e2e2', title: '#2f80ed', text: '#333333', sub: '#888888', badge: '#f0f0f0' },
};

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  'C++': '#f34b7d', C: '#555555', 'C#': '#178600', Go: '#00ADD8', Rust: '#dea584',
  Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c', Vue: '#41b883', Svelte: '#ff3e00',
};

function langColor(lang: string, fallback?: string) {
  return LANG_COLORS[lang] ?? fallback ?? '#8b949e';
}

export async function GET(request: NextRequest) {
  const params     = request.nextUrl.searchParams;
  const username   = params.get('username') || 'github';
  const repo       = params.get('repo') || 'repository';
  const desc       = params.get('description') || '';
  const language   = params.get('language') || '';
  const stars      = parseInt(params.get('stars') || '0', 10);
  const forks      = parseInt(params.get('forks') || '0', 10);
  const langColor_ = params.get('color') || '';
  const themeKey   = params.get('theme') || 'default';
  const hideBorder = params.get('hide_border') === 'true';
  const showOwner  = params.get('show_owner') === 'true';

  const t = THEMES[themeKey] ?? THEMES['default'];
  const borderWidth  = hideBorder ? 0 : 1;
  const borderRadius = hideBorder ? 0 : 10;

  const width = 400;
  const height = 140;

  const repoColor = langColor(language, langColor_);
  const displayName = showOwner ? `${username}/${repo}` : repo;
  const truncDesc = desc.length > 60 ? desc.slice(0, 57) + '...' : desc;

  // Fork icon path
  const forkPath = 'M5 3a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM5 9a1 1 0 011 1v1a2 2 0 002 2h4a2 2 0 002-2v-1a1 1 0 112 0v1a4 4 0 01-4 4H8a4 4 0 01-4-4v-1a1 1 0 011-1z';
  const starPath  = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${width - borderWidth}" height="${height - borderWidth}"
        rx="${borderRadius}" ry="${borderRadius}"
        fill="${t.bg}" stroke="${hideBorder ? 'none' : t.border}" stroke-width="${borderWidth}"/>
  
  <!-- Repo icon (book) -->
  <svg x="20" y="20" width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="${t.sub}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>

  <!-- Repo name -->
  <text x="44" y="35" fill="${t.title}" font-size="14" font-weight="bold"
        font-family="Segoe UI,Ubuntu,sans-serif">${displayName}</text>

  <!-- Description -->
  ${truncDesc ? `<text x="20" y="62" fill="${t.sub}" font-size="12" font-family="Segoe UI,Ubuntu,sans-serif">${truncDesc}</text>` : ''}

  <!-- Language dot + name -->
  ${language ? `
  <circle cx="25" cy="100" r="6" fill="${repoColor}"/>
  <text x="36" y="104" fill="${t.text}" font-size="12" font-family="Segoe UI,Ubuntu,sans-serif">${language}</text>` : ''}

  <!-- Stars -->
  <svg x="${width - 110}" y="89" width="14" height="14" viewBox="0 0 24 24" fill="${t.sub}">
    <path d="${starPath}"/>
  </svg>
  <text x="${width - 94}" y="101" fill="${t.text}" font-size="12" font-family="Segoe UI,Ubuntu,sans-serif">${stars.toLocaleString()}</text>

  <!-- Forks -->
  <svg x="${width - 55}" y="89" width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="${t.sub}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="${forkPath}"/>
  </svg>
  <text x="${width - 37}" y="101" fill="${t.text}" font-size="12" font-family="Segoe UI,Ubuntu,sans-serif">${forks.toLocaleString()}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=1800' },
  });
}
