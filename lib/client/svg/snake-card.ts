/**
 * lib/client/svg/snake-card.ts
 *
 * Generates a beautiful animated contribution snake SVG entirely client-side.
 * No server required — runs in the browser.
 *
 * Improvements over the previous version:
 *  - SVG glow filter (feGaussianBlur + feMerge) on the snake body
 *  - Gradient body: head bright → tail fades
 *  - Larger, more expressive head with distinct color
 *  - Animated eyes that follow the head via animateMotion
 *  - Animated forked tongue (flickers)
 *  - Contribution legend: Less ◻◻◻◻◻ More
 *  - Title bar: username + year range
 *  - Better month/day label visibility
 */

// ── Themes ───────────────────────────────────────────────────────────────────

interface SnakeTheme {
  bg: string;
  card: string;
  title: string;
  label: string;
  border: string;
  empty: string;
  low: string;
  mid: string;
  high: string;
  max: string;
  snake: string;
  snakeGlow: string;
  snakeTail: string;
  head: string;
  headGlow: string;
  eye: string;
  pupil: string;
  tongue: string;
}

const THEMES: Record<string, SnakeTheme> = {
  tokyonight: {
    bg: '#0d1117',       card: '#161b22',
    title: '#c9d1d9',    label: '#8b949e',   border: '#30363d',
    empty: '#21262d',    low: '#0e4429',     mid: '#006d32',
    high: '#26a641',     max: '#39d353',
    snake: '#7aa2f7',    snakeGlow: '#7aa2f733', snakeTail: '#414868',
    head: '#7dcfff',     headGlow: '#7dcfff55',
    eye: '#e0e0e0',      pupil: '#0d1117',   tongue: '#f7768e',
  },
  flat: {
    bg: '#ffffff',       card: '#f6f8fa',
    title: '#24292f',    label: '#57606a',   border: '#d0d7de',
    empty: '#ebedf0',    low: '#9be9a8',     mid: '#40c463',
    high: '#30a14e',     max: '#216e39',
    snake: '#2563eb',    snakeGlow: '#2563eb22', snakeTail: '#93c5fd',
    head: '#1e40af',     headGlow: '#1e40af33',
    eye: '#ffffff',      pupil: '#1e293b',   tongue: '#dc2626',
  },
  dark: {
    bg: '#0d1117',       card: '#161b22',
    title: '#e6edf3',    label: '#7d8590',   border: '#30363d',
    empty: '#21262d',    low: '#0e4429',     mid: '#006d32',
    high: '#26a641',     max: '#39d353',
    snake: '#f472b6',    snakeGlow: '#f472b633', snakeTail: '#831843',
    head: '#fbbf24',     headGlow: '#fbbf2444',
    eye: '#fef3c7',      pupil: '#0d1117',   tongue: '#fb923c',
  },
  'chartreuse-dark': {
    bg: '#0d1117',       card: '#111a12',
    title: '#c9d1d9',    label: '#6e7681',   border: '#21262d',
    empty: '#1a2011',    low: '#1a3d1a',     mid: '#1f6b22',
    high: '#3cb371',     max: '#80ff00',
    snake: '#80ff00',    snakeGlow: '#80ff0044', snakeTail: '#2d5a1b',
    head: '#b8ff6a',     headGlow: '#80ff0055',
    eye: '#0d1117',      pupil: '#80ff00',   tongue: '#ff6b6b',
  },
  default: {
    bg: '#ffffff',       card: '#f6f8fa',
    title: '#24292f',    label: '#57606a',   border: '#d0d7de',
    empty: '#ebedf0',    low: '#9be9a8',     mid: '#40c463',
    high: '#30a14e',     max: '#216e39',
    snake: '#0969da',    snakeGlow: '#0969da22', snakeTail: '#79c0ff',
    head: '#1f6feb',     headGlow: '#1f6feb33',
    eye: '#ffffff',      pupil: '#0d1117',   tongue: '#da3633',
  },
};

// ── Seeded RNG (deterministic per username) ──────────────────────────────────

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223;
    return (s >>> 0) / 0xffffffff;
  };
}

function usernameSeed(u: string): number {
  let h = 5381;
  for (let i = 0; i < u.length; i++) h = (Math.imul(31, h) + u.charCodeAt(i)) | 0;
  return h >>> 0;
}

// ── Grid generation ──────────────────────────────────────────────────────────

function buildGrid(username: string, cols: number, rows: number): number[][] {
  const rng = seededRng(usernameSeed(username));
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      const v = rng();
      // Realistic contribution distribution: ~55% empty
      return v < 0.55 ? 0 : v < 0.72 ? 1 : v < 0.86 ? 2 : v < 0.95 ? 3 : 4;
    })
  );
}

// ── Snake path (boustrophedon — zigzag row by row) ───────────────────────────

function buildSnakePath(cols: number, rows: number): [number, number][] {
  const path: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < cols; c++) path.push([c, r]);
    } else {
      for (let c = cols - 1; c >= 0; c--) path.push([c, r]);
    }
  }
  return path;
}

// ── Month labels ─────────────────────────────────────────────────────────────

function buildMonthLabels(
  cols: number,
  step: number,
  padLeft: number,
  y: number,
  color: string
): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const x = padLeft + Math.floor(i * (cols / 12)) * step;
    return `<text x="${x}" y="${y}" fill="${color}" font-size="10" font-family="'Segoe UI',Ubuntu,sans-serif" font-weight="500">${months[d.getMonth()]}</text>`;
  }).join('\n  ');
}

// ── Day labels ────────────────────────────────────────────────────────────────

function buildDayLabels(
  step: number,
  padTop: number,
  cell: number,
  x: number,
  color: string
): string {
  return [
    { label: 'Mon', row: 1 },
    { label: 'Wed', row: 3 },
    { label: 'Fri', row: 5 },
  ].map(({ label, row }) => {
    const y = padTop + row * step + cell - 1;
    return `<text x="${x}" y="${y}" fill="${color}" font-size="9" font-family="'Segoe UI',Ubuntu,sans-serif" text-anchor="end">${label}</text>`;
  }).join('\n  ');
}

// ── Legend ────────────────────────────────────────────────────────────────────

function buildLegend(
  svgW: number,
  y: number,
  t: SnakeTheme
): string {
  const boxSize = 10;
  const gap = 4;
  const colors = [t.empty, t.low, t.mid, t.high, t.max];
  const totalW = colors.length * boxSize + (colors.length - 1) * gap;
  const startX = svgW - totalW - 16;
  const boxes = colors.map((color, i) =>
    `<rect x="${startX + i * (boxSize + gap)}" y="${y}" width="${boxSize}" height="${boxSize}" rx="2" fill="${color}"/>`
  ).join('');

  return `
  <text x="${startX - 6}" y="${y + 9}" fill="${t.label}" font-size="9" font-family="'Segoe UI',Ubuntu,sans-serif" text-anchor="end">Less</text>
  ${boxes}
  <text x="${startX + totalW + 6}" y="${y + 9}" fill="${t.label}" font-size="9" font-family="'Segoe UI',Ubuntu,sans-serif">More</text>`;
}

// ── Main SVG generator ────────────────────────────────────────────────────────

export interface SnakeCardParams {
  username: string;
  theme?: string;
  hideBorder?: boolean;
  /** Width in pixels (default 735) */
  width?: number;
}

export function generateSnakeSvg(params: SnakeCardParams): string {
  const { username, theme = 'tokyonight', hideBorder = false } = params;
  const t = THEMES[theme] ?? THEMES.tokyonight;

  // Layout constants
  const COLS = 53;
  const ROWS = 7;
  const CELL = 11;
  const GAP  = 2;
  const STEP = CELL + GAP;

  const DAY_LABEL_W = 26; // width reserved for Mon/Wed/Fri
  const PAD_LEFT    = DAY_LABEL_W + 4;
  const TITLE_H     = 28;  // title bar height
  const MONTH_H     = 18;  // month labels height
  const PAD_TOP     = TITLE_H + MONTH_H;
  const LEGEND_H    = 22;

  const svgW = PAD_LEFT + COLS * STEP + 4;
  const svgH = PAD_TOP + ROWS * STEP + LEGEND_H + 6;

  // Grid data
  const grid = buildGrid(username, COLS, ROWS);

  // Grid cell rectangles
  const colorMap: (keyof SnakeTheme)[] = ['empty', 'low', 'mid', 'high', 'max'];
  const cellRects = grid.flatMap((row, r) =>
    row.map((level, c) => {
      const x = PAD_LEFT + c * STEP;
      const y = PAD_TOP + r * STEP;
      const fill = t[colorMap[level]] as string;
      return `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${fill}"/>`;
    })
  ).join('\n  ');

  // Snake path
  const snakePath = buildSnakePath(COLS, ROWS);
  const totalCells = snakePath.length;

  // Pixel center for each cell in the path
  const ptX = (c: number) => PAD_LEFT + c * STEP + CELL / 2;
  const ptY = (r: number) => PAD_TOP + r * STEP + CELL / 2;

  // Polyline points string
  const polyPoints = snakePath.map(([c, r]) => `${ptX(c)},${ptY(r)}`).join(' ');

  // Animation timing
  const SPEED = 0.065; // seconds per cell
  const ANIM  = totalCells * SPEED;
  const SNAKE_LEN = 12; // visible body segments
  const SEG_LEN   = STEP;
  const PATH_LEN  = totalCells * SEG_LEN;
  const BODY_LEN  = SNAKE_LEN * SEG_LEN;

  // Head start / end positions
  const [hc0, hr0] = snakePath[0];
  const [hcN, hrN] = snakePath[totalCells - 1];
  const hx0 = ptX(hc0), hy0 = ptY(hr0);
  const hxN = ptX(hcN), hyN = ptY(hrN);

  // Motion path (for animateMotion)
  const motionD = `M ${snakePath.map(([c, r]) => `${ptX(c)} ${ptY(r)}`).join(' L ')}`;

  // Gradient IDs need to be unique per username to avoid conflicts when multiple SVGs are shown
  const uid = username.replace(/[^a-z0-9]/gi, '');

  // ── Year range for title
  const now = new Date();
  const yearRange = `${now.getFullYear() - 1}–${now.getFullYear()}`;

  // ── SVG assembly ──────────────────────────────────────────────────────────
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <defs>
    <!-- Glow filter for snake body -->
    <filter id="glow-${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Head glow filter (stronger) -->
    <filter id="head-glow-${uid}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Snake body gradient: vivid head → faded tail -->
    <linearGradient id="snake-grad-${uid}" gradientUnits="userSpaceOnUse"
        x1="${ptX(hc0)}" y1="0" x2="${ptX(hcN)}" y2="0">
      <stop offset="0%"   stop-color="${t.snake}"     stop-opacity="1"/>
      <stop offset="70%"  stop-color="${t.snake}"     stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${t.snakeTail}" stop-opacity="0.5"/>
    </linearGradient>

    <!-- Motion path for head + eyes + tongue -->
    <path id="mp-${uid}" d="${motionD}" fill="none" stroke="none"/>

    <style>
      .sb-${uid} {
        fill: none;
        stroke: url(#snake-grad-${uid});
        stroke-width: ${CELL - 1};
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: ${BODY_LEN} ${PATH_LEN};
        stroke-dashoffset: ${PATH_LEN + BODY_LEN};
        filter: url(#glow-${uid});
        animation: sb-${uid} ${ANIM}s linear infinite;
      }
      .st-${uid} {
        fill: none;
        stroke: ${t.bg};
        stroke-width: ${CELL + 1};
        stroke-linecap: butt;
        stroke-linejoin: round;
        stroke-dasharray: ${PATH_LEN - BODY_LEN} ${PATH_LEN};
        stroke-dashoffset: ${PATH_LEN};
        animation: st-${uid} ${ANIM}s linear infinite;
      }
      @keyframes sb-${uid} {
        0%   { stroke-dashoffset: ${PATH_LEN + BODY_LEN}; }
        100% { stroke-dashoffset: ${-PATH_LEN + BODY_LEN}; }
      }
      @keyframes st-${uid} {
        0%   { stroke-dashoffset: ${PATH_LEN}; }
        100% { stroke-dashoffset: ${-PATH_LEN}; }
      }
      .tongue-${uid} {
        animation: tongue-${uid} 0.5s ease-in-out infinite alternate;
      }
      @keyframes tongue-${uid} {
        0%   { opacity: 1; transform: scaleX(1); }
        100% { opacity: 0.3; transform: scaleX(0.7); }
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${svgW}" height="${svgH}" rx="${hideBorder ? 0 : 10}" fill="${t.bg}"/>
  ${hideBorder ? '' : `<rect x="0.5" y="0.5" width="${svgW - 1}" height="${svgH - 1}" rx="10" fill="none" stroke="${t.border}" stroke-width="1"/>`}

  <!-- Title bar -->
  <text x="${PAD_LEFT}" y="19" fill="${t.title}"
        font-size="12" font-weight="600" font-family="'Segoe UI',Ubuntu,sans-serif">
    🐍 ${username} — Contribution Graph
  </text>
  <text x="${svgW - 12}" y="19" fill="${t.label}" text-anchor="end"
        font-size="10" font-family="'Segoe UI',Ubuntu,sans-serif">${yearRange}</text>

  <!-- Separator -->
  <line x1="${PAD_LEFT}" y1="24" x2="${svgW - 12}" y2="24" stroke="${t.border}" stroke-width="0.5" opacity="0.6"/>

  <!-- Month labels -->
  ${buildMonthLabels(COLS, STEP, PAD_LEFT, TITLE_H + 14, t.label)}

  <!-- Day labels (Mon / Wed / Fri) -->
  ${buildDayLabels(STEP, PAD_TOP, CELL, DAY_LABEL_W, t.label)}

  <!-- Contribution grid cells -->
  ${cellRects}

  <!-- ── Snake ── -->

  <!-- Trail: erases cells behind the snake's tail -->
  <polyline class="st-${uid}" points="${polyPoints}"/>

  <!-- Body: the actual snake (gradient + glow) -->
  <polyline class="sb-${uid}" points="${polyPoints}"/>

  <!-- Head (circle + glow) -->
  <circle cx="${hx0}" cy="${hy0}" r="${CELL / 2 + 1.5}"
          fill="${t.head}" filter="url(#head-glow-${uid})">
    <animateMotion dur="${ANIM}s" repeatCount="indefinite" rotate="auto">
      <mpath href="#mp-${uid}"/>
    </animateMotion>
  </circle>

  <!-- Left eye -->
  <circle cx="${hx0 - 2.5}" cy="${hy0 - 2.5}" r="1.8" fill="${t.eye}">
    <animateMotion dur="${ANIM}s" repeatCount="indefinite" rotate="auto">
      <mpath href="#mp-${uid}"/>
    </animateMotion>
  </circle>
  <circle cx="${hx0 - 2.5}" cy="${hy0 - 2.5}" r="0.8" fill="${t.pupil}">
    <animateMotion dur="${ANIM}s" repeatCount="indefinite" rotate="auto">
      <mpath href="#mp-${uid}"/>
    </animateMotion>
  </circle>

  <!-- Right eye -->
  <circle cx="${hx0 + 2.5}" cy="${hy0 - 2.5}" r="1.8" fill="${t.eye}">
    <animateMotion dur="${ANIM}s" repeatCount="indefinite" rotate="auto">
      <mpath href="#mp-${uid}"/>
    </animateMotion>
  </circle>
  <circle cx="${hx0 + 2.5}" cy="${hy0 - 2.5}" r="0.8" fill="${t.pupil}">
    <animateMotion dur="${ANIM}s" repeatCount="indefinite" rotate="auto">
      <mpath href="#mp-${uid}"/>
    </animateMotion>
  </circle>

  <!-- Forked tongue (animated flicker) -->
  <g class="tongue-${uid}">
    <line x1="${hx0}" y1="${hy0 - CELL / 2 - 2}" x2="${hx0}" y2="${hy0 - CELL / 2 - 6}"
          stroke="${t.tongue}" stroke-width="1.2" stroke-linecap="round">
      <animateMotion dur="${ANIM}s" repeatCount="indefinite" rotate="auto">
        <mpath href="#mp-${uid}"/>
      </animateMotion>
    </line>
    <line x1="${hx0}" y1="${hy0 - CELL / 2 - 5}" x2="${hx0 - 2.5}" y2="${hy0 - CELL / 2 - 8}"
          stroke="${t.tongue}" stroke-width="1" stroke-linecap="round">
      <animateMotion dur="${ANIM}s" repeatCount="indefinite" rotate="auto">
        <mpath href="#mp-${uid}"/>
      </animateMotion>
    </line>
    <line x1="${hx0}" y1="${hy0 - CELL / 2 - 5}" x2="${hx0 + 2.5}" y2="${hy0 - CELL / 2 - 8}"
          stroke="${t.tongue}" stroke-width="1" stroke-linecap="round">
      <animateMotion dur="${ANIM}s" repeatCount="indefinite" rotate="auto">
        <mpath href="#mp-${uid}"/>
      </animateMotion>
    </line>
  </g>

  <!-- Legend: Less ◻◻◻◻◻ More -->
  ${buildLegend(svgW, svgH - LEGEND_H + 4, t)}
</svg>`;
}

/** Returns a data: URI for use in img src */
export function snakeDataUri(params: SnakeCardParams): string {
  const svg = generateSnakeSvg(params);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
