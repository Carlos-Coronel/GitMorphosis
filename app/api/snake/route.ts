import { NextRequest, NextResponse } from 'next/server';

// Theme palettes
const THEMES: Record<string, {
  bg: string; empty: string; low: string; mid: string; high: string; max: string;
  snake: string; snakeHead: string; eye: string; border: string;
}> = {
  tokyonight: {
    bg: '#0d1117', empty: '#161b22', low: '#0e4429', mid: '#006d32', high: '#26a641', max: '#39d353',
    snake: '#bb9af7', snakeHead: '#7dcfff', eye: '#0d1117', border: '#30363d',
  },
  flat: {
    bg: '#ffffff', empty: '#ebedf0', low: '#9be9a8', mid: '#40c463', high: '#30a14e', max: '#216e39',
    snake: '#2563eb', snakeHead: '#1d4ed8', eye: '#ffffff', border: '#d0d7de',
  },
  dark: {
    bg: '#0d1117', empty: '#161b22', low: '#0e4429', mid: '#006d32', high: '#26a641', max: '#39d353',
    snake: '#fe428e', snakeHead: '#f8d847', eye: '#0d1117', border: '#30363d',
  },
  'chartreuse-dark': {
    bg: '#0d1117', empty: '#161b22', low: '#0e3d1e', mid: '#1a7a3d', high: '#3cb371', max: '#80ff00',
    snake: '#80ff00', snakeHead: '#c9d1d9', eye: '#0d1117', border: '#21262d',
  },
  default: {
    bg: '#ffffff', empty: '#ebedf0', low: '#9be9a8', mid: '#40c463', high: '#30a14e', max: '#216e39',
    snake: '#2563eb', snakeHead: '#1d4ed8', eye: '#ffffff', border: '#d0d7de',
  },
};

// Generate a deterministic but varied contribution grid from the username seed
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function usernameToSeed(username: string): number {
  let h = 0;
  for (let i = 0; i < username.length; i++) {
    h = Math.imul(31, h) + username.charCodeAt(i);
  }
  return h >>> 0;
}

// Snake path through a COLS x ROWS grid (boustrophedon / snake-path traversal)
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

export async function GET(request: NextRequest) {
  const params    = request.nextUrl.searchParams;
  const username  = params.get('username') || 'github';
  const themeKey  = params.get('theme') || 'tokyonight';
  const hideBorder = params.get('hide_border') === 'true';

  const t = THEMES[themeKey] ?? THEMES['tokyonight'];

  // Grid dimensions — standard GitHub contribution graph
  const COLS = 53;
  const ROWS = 7;
  const CELL = 11;   // px per cell
  const GAP  = 2;    // gap between cells
  const STEP = CELL + GAP;

  const PAD_LEFT  = 4;
  const PAD_TOP   = 28;
  const svgW = PAD_LEFT + COLS * STEP + 4;
  const svgH = PAD_TOP + ROWS * STEP + 8;

  // Generate contribution data (deterministic from username)
  const rand = seededRand(usernameToSeed(username));
  const grid: number[][] = [];
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      const v = rand();
      // Skewed toward lower values (realistic distribution)
      grid[r][c] = v < 0.55 ? 0 : v < 0.72 ? 1 : v < 0.86 ? 2 : v < 0.95 ? 3 : 4;
    }
  }

  // Color map
  const cellColors = ['empty', 'low', 'mid', 'high', 'max'] as const;

  // Build grid rectangles
  const cellRects: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = PAD_LEFT + c * STEP;
      const y = PAD_TOP + r * STEP;
      const colorKey = cellColors[grid[r][c]];
      cellRects.push(
        `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" ry="2" fill="${t[colorKey]}" />`
      );
    }
  }

  // Snake path traversal
  const snakePath = buildSnakePath(COLS, ROWS);
  const totalCells = snakePath.length;
  const SNAKE_LEN = 10; // visible body segments
  const ANIM_DURATION = totalCells * 0.06; // seconds total animation
  const DELAY_PER_CELL = ANIM_DURATION / totalCells;

  // Build one animated rect per body segment
  // Each segment is a copy of the snake that appears and disappears
  // We use a keyframe approach: the snake head travels through each cell
  // and each body cell "eats" the contribution square
  
  // For SVG animation performance, we use a single <path> approach:
  // We animate a polyline that traces the boustrophedon path
  const pathPoints = snakePath.map(([c, r]) => {
    const cx = PAD_LEFT + c * STEP + CELL / 2;
    const cy = PAD_TOP + r * STEP + CELL / 2;
    return `${cx},${cy}`;
  }).join(' ');

  // Calculate path length estimate for stroke-dashoffset animation
  const segLen = STEP; // each step is ~13px
  const pathLen = totalCells * segLen;
  const snakeBodyLen = SNAKE_LEN * segLen;

  // Head circle — animated along the path
  const headX = PAD_LEFT + snakePath[0][0] * STEP + CELL / 2;
  const headY = PAD_TOP + snakePath[0][1] * STEP + CELL / 2;
  const lastPt = snakePath[snakePath.length - 1];
  const lastX  = PAD_LEFT + lastPt[0] * STEP + CELL / 2;
  const lastY  = PAD_TOP + lastPt[1] * STEP + CELL / 2;

  // Generate month labels (abbreviated)
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const monthLabels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(monthNames[d.getMonth()]);
  }
  // Show ~every 4th week column
  const monthLabelsSvg = monthLabels.map((m, idx) => {
    const x = PAD_LEFT + Math.floor(idx * (COLS / 12)) * STEP;
    return `<text x="${x}" y="${PAD_TOP - 6}" fill="${t.border}" font-size="9" font-family="Segoe UI,Ubuntu,sans-serif">${m}</text>`;
  }).join('\n');

  // Week day labels
  const dayLabels = [
    { label: 'Mon', row: 1 }, { label: 'Wed', row: 3 }, { label: 'Fri', row: 5 },
  ].map(({ label, row }) => {
    const y = PAD_TOP + row * STEP + CELL - 2;
    return `<text x="0" y="${y}" fill="${t.border}" font-size="9" font-family="Segoe UI,Ubuntu,sans-serif">${label}</text>`;
  }).join('\n');

  const borderAttr = hideBorder ? '' : `<rect x="0" y="0" width="${svgW}" height="${svgH}" rx="10" ry="10" fill="none" stroke="${t.border}" stroke-width="1"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <defs>
    <style>
      .snake-body {
        fill: none;
        stroke: ${t.snake};
        stroke-width: ${CELL - 2};
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: ${snakeBodyLen} ${pathLen};
        stroke-dashoffset: ${pathLen};
        animation: snake-move ${ANIM_DURATION}s linear infinite;
      }
      .snake-trail {
        fill: none;
        stroke: ${t.bg};
        stroke-width: ${CELL - 2};
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: ${pathLen - snakeBodyLen} ${pathLen};
        stroke-dashoffset: ${pathLen};
        animation: snake-trail ${ANIM_DURATION}s linear infinite;
      }
      @keyframes snake-move {
        0%   { stroke-dashoffset: ${pathLen + snakeBodyLen}; }
        100% { stroke-dashoffset: ${-pathLen}; }
      }
      @keyframes snake-trail {
        0%   { stroke-dashoffset: ${pathLen}; }
        100% { stroke-dashoffset: ${-pathLen * 2}; }
      }
      .snake-head {
        animation: head-move ${ANIM_DURATION}s linear infinite;
      }
      @keyframes head-move {
        0%   { cx: ${headX}px; cy: ${headY}px; }
        100% { cx: ${lastX}px; cy: ${lastY}px; }
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${svgW}" height="${svgH}" rx="10" ry="10" fill="${t.bg}"/>
  ${borderAttr}

  <!-- Month labels -->
  ${monthLabelsSvg}

  <!-- Day labels -->
  ${dayLabels}

  <!-- Contribution grid -->
  ${cellRects.join('\n  ')}

  <!-- Snake body (polyline animated with stroke-dashoffset) -->
  <polyline class="snake-trail" points="${pathPoints}" />
  <polyline class="snake-body" points="${pathPoints}" />

  <!-- Snake head circle -->
  <circle class="snake-head" cx="${headX}" cy="${headY}" r="${CELL / 2 - 0.5}" fill="${t.snakeHead}">
    <animateMotion dur="${ANIM_DURATION}s" repeatCount="indefinite" rotate="auto">
      <mpath href="#snake-path-def"/>
    </animateMotion>
  </circle>

  <!-- Hidden path for head animateMotion -->
  <path id="snake-path-def" d="M ${snakePath.map(([c, r]) => {
    const cx = PAD_LEFT + c * STEP + CELL / 2;
    const cy = PAD_TOP + r * STEP + CELL / 2;
    return `${cx} ${cy}`;
  }).join(' L ')}" fill="none" stroke="none"/>

  <!-- Snake eyes (follow head) -->
  <circle cx="${headX + 2}" cy="${headY - 2}" r="1.5" fill="${t.eye}">
    <animateMotion dur="${ANIM_DURATION}s" repeatCount="indefinite" rotate="auto">
      <mpath href="#snake-path-def"/>
    </animateMotion>
  </circle>
  <circle cx="${headX - 2}" cy="${headY - 2}" r="1.5" fill="${t.eye}">
    <animateMotion dur="${ANIM_DURATION}s" repeatCount="indefinite" rotate="auto">
      <mpath href="#snake-path-def"/>
    </animateMotion>
  </circle>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
