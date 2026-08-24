import type { GeneratedAsset, GitHubProfile, Repository } from '@/lib/domain/types';
import { generatePinCardSvg } from './svg/pin-card';
import { generateSnakeSvg } from './svg/snake-card';
import { generateStatsCardSvg } from './svg/stats-card';
import { generateTopLangsCardSvg } from './svg/top-langs-card';
import { generateTrophyCardSvg } from './svg/trophy-card';

type AssetTheme = 'dark' | 'light';

const colors = {
  dark: { card: '#161b22', border: '#30363d', text: '#c9d1d9', accent: '#58a6ff' },
  light: { card: '#f6f8fa', border: '#d0d7de', text: '#24292f', accent: '#0969da' },
};

export function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function safeRepository(repository: Repository): Repository {
  return {
    ...repository,
    name: escapeXml(repository.name),
    description: repository.description ? escapeXml(repository.description) : null,
    language: repository.language ? escapeXml(repository.language) : null,
  };
}

function safeProfile(profile: GitHubProfile): GitHubProfile {
  return {
    ...profile,
    user: {
      ...profile.user,
      username: escapeXml(profile.user.username),
      name: profile.user.name ? escapeXml(profile.user.name) : null,
    },
    topLanguages: profile.topLanguages.map((item) => ({ ...item, language: escapeXml(item.language) })),
    pinnedRepos: profile.pinnedRepos.map(safeRepository),
    repositories: profile.repositories.map(safeRepository),
  };
}

function svg(path: `assets/${string}`, content: string): GeneratedAsset {
  return { path, content, mimeType: 'image/svg+xml' };
}

function panel(theme: AssetTheme, title: string, lines: string[], height = 160): string {
  const c = colors[theme];
  const rows = lines
    .map((line, index) => `<text x="28" y="${70 + index * 24}" fill="${c.text}" font-size="14" font-family="Segoe UI,Arial,sans-serif">${escapeXml(line)}</text>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="${height}" viewBox="0 0 700 ${height}" role="img" aria-label="${escapeXml(title)}"><rect width="700" height="${height}" rx="12" fill="${c.card}"/><rect x=".5" y=".5" width="699" height="${height - 1}" rx="12" fill="none" stroke="${c.border}"/><text x="28" y="36" fill="${c.accent}" font-size="20" font-weight="700" font-family="Segoe UI,Arial,sans-serif">${escapeXml(title)}</text>${rows}</svg>`;
}

function header(profile: GitHubProfile, theme: AssetTheme, footer = false): string {
  const c = colors[theme];
  const height = footer ? 90 : 210;
  const title = escapeXml(profile.user.name || profile.user.username);
  const subtitle = escapeXml(profile.user.bio || 'Developer');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="${height}" viewBox="0 0 900 ${height}" role="img" aria-label="${footer ? 'Footer' : title}"><defs><linearGradient id="gradient" x1="0" x2="1"><stop stop-color="${c.accent}"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><path d="M0 0H900V${height - 35}Q675 ${height + 10} 450 ${height - 25}T0 ${height - 35}Z" fill="url(#gradient)"/>${footer ? '' : `<text x="450" y="85" text-anchor="middle" fill="#fff" font-size="46" font-weight="700" font-family="Segoe UI,Arial,sans-serif">${title}</text><text x="450" y="125" text-anchor="middle" fill="#fff" font-size="19" font-family="Segoe UI,Arial,sans-serif">${subtitle}</text>`}</svg>`;
}

function stack(profile: GitHubProfile, theme: AssetTheme): string {
  const c = colors[theme];
  const skills = profile.topLanguages
    .slice(0, 5)
    .map((item) => item.language)
    .join(' · ') || 'Open Source';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="80" viewBox="0 0 700 80" role="img" aria-label="Principal stack: ${escapeXml(skills)}"><rect width="700" height="80" rx="10" fill="${c.card}"/><text x="350" y="48" text-anchor="middle" fill="${c.accent}" font-size="21" font-family="ui-monospace,SFMono-Regular,Consolas,monospace">${escapeXml(skills)}<animate attributeName="opacity" values="1;.55;1" dur="2.4s" repeatCount="indefinite"/></text></svg>`;
}

export function createLocalAssets(profileInput: GitHubProfile, markdown: string, includeSnake = false): GeneratedAsset[] {
  const profile = safeProfile(profileInput);
  const { user, contributionStats } = profile;
  const featured = (profile.pinnedRepos.length ? profile.pinnedRepos : profile.repositories.filter((repo) => !repo.isForked)).slice(0, 4);
  const stars = profile.repositories.reduce((sum, repo) => sum + repo.stars, 0);
  const forks = profile.repositories.reduce((sum, repo) => sum + repo.forks, 0);
  const metrics = {
    stars,
    forks,
    followers: user.followers,
    repos: user.publicRepos,
    languages: profile.topLanguages.length,
    featured: featured.length,
  };
  const assets: GeneratedAsset[] = [];
  const add = (path: `assets/${string}`, generate: () => string) => {
    if (markdown.includes(path)) assets.push(svg(path, generate()));
  };
  for (const theme of ['dark', 'light'] as const) {
    const svgTheme = theme === 'dark' ? 'tokyonight' : 'flat';
    add(`assets/stats-${theme}.svg`, () => generateStatsCardSvg({ username: user.username, theme: svgTheme, ...metrics }));
    add(`assets/languages-${theme}.svg`, () => generateTopLangsCardSvg({ languages: profile.topLanguages, theme: svgTheme, layout: 'compact' }));
    add(`assets/trophies-${theme}.svg`, () => generateTrophyCardSvg({ theme: svgTheme, stats: metrics }));
    add(`assets/streak-${theme}.svg`, () => panel(theme, 'Contribution streak', [
        `Current streak: ${contributionStats.currentStreak} days`,
        `Longest streak: ${contributionStats.longestStreak} days`,
        `Total contributions: ${contributionStats.totalContributions}`,
      ]));
    add(`assets/contributions-${theme}.svg`, () => panel(theme, 'GitHub activity', [
        `${contributionStats.totalContributions} contributions`,
        `${user.publicRepos} public repositories · ${stars} stars · ${forks} forks`,
      ], 140));
    add(`assets/header-${theme}.svg`, () => header(profile, theme));
    add(`assets/footer-${theme}.svg`, () => header(profile, theme, true));
    add(`assets/stack-${theme}.svg`, () => stack(profile, theme));
    if (includeSnake) {
      add(`assets/snake-${theme}.svg`, () => generateSnakeSvg({ username: user.username, theme: svgTheme }));
    }
    featured.forEach((repo, index) => {
      add(`assets/project-${index + 1}-${theme}.svg`, () => generatePinCardSvg({
        username: user.username,
        repo: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stars,
        forks: repo.forks,
        theme: svgTheme,
        showOwner: false,
      }));
    });
  }
  return assets;
}
