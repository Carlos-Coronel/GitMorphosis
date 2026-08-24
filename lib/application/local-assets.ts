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

function panel(theme: AssetTheme, title: string, lines: string[], height = 160, mobile = false): string {
  const c = colors[theme];
  const width = mobile ? 340 : 700;
  const panelHeight = mobile ? Math.max(height, 160) : height;
  const rows = lines
    .map((line, index) => `<text x="28" y="${70 + index * 24}" fill="${c.text}" font-size="14" font-family="Segoe UI,Arial,sans-serif">${escapeXml(line)}</text>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${panelHeight}" viewBox="0 0 ${width} ${panelHeight}" role="img" aria-label="${escapeXml(title)}"><rect width="${width}" height="${panelHeight}" rx="12" fill="${c.card}"/><rect x=".5" y=".5" width="${width - 1}" height="${panelHeight - 1}" rx="12" fill="none" stroke="${c.border}"/><text x="28" y="36" fill="${c.accent}" font-size="${mobile ? 18 : 20}" font-weight="700" font-family="Segoe UI,Arial,sans-serif">${escapeXml(title)}</text>${rows}</svg>`;
}

function header(profile: GitHubProfile, theme: AssetTheme, footer = false, mobile = false): string {
  const c = colors[theme];
  const width = mobile ? 340 : 900;
  const height = footer ? (mobile ? 70 : 90) : (mobile ? 160 : 210);
  const title = escapeXml(profile.user.name || profile.user.username);
  const subtitle = escapeXml(profile.user.bio || 'Developer');
  const center = width / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${footer ? 'Footer' : title}"><defs><linearGradient id="gradient" x1="0" x2="1"><stop stop-color="${c.accent}"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><path d="M0 0H${width}V${height - (mobile ? 25 : 35)}Q${width * .75} ${height + 10} ${center} ${height - (mobile ? 18 : 25)}T0 ${height - (mobile ? 25 : 35)}Z" fill="url(#gradient)"/>${footer ? '' : `<text x="${center}" y="${mobile ? 64 : 85}" text-anchor="middle" fill="#fff" font-size="${mobile ? 30 : 46}" font-weight="700" font-family="Segoe UI,Arial,sans-serif">${title}</text><text x="${center}" y="${mobile ? 96 : 125}" text-anchor="middle" fill="#fff" font-size="${mobile ? 16 : 19}" font-family="Segoe UI,Arial,sans-serif">${subtitle}</text>`}</svg>`;
}

function stack(profile: GitHubProfile, theme: AssetTheme, mobile = false): string {
  const c = colors[theme];
  const languages = profile.topLanguages.slice(0, 5).map((item) => item.language);
  const skills = languages.join(' · ') || 'Open Source';
  const width = mobile ? 340 : 700;
  const content = mobile && languages.length > 2
    ? `<text x="170" y="32" text-anchor="middle" fill="${c.accent}" font-size="16" font-family="ui-monospace,SFMono-Regular,Consolas,monospace">${escapeXml(languages.slice(0, 2).join(' · '))}</text><text x="170" y="59" text-anchor="middle" fill="${c.accent}" font-size="16" font-family="ui-monospace,SFMono-Regular,Consolas,monospace">${escapeXml(languages.slice(2).join(' · '))}</text>`
    : `<text x="${width / 2}" y="48" text-anchor="middle" fill="${c.accent}" font-size="${mobile ? 17 : 21}" font-family="ui-monospace,SFMono-Regular,Consolas,monospace">${escapeXml(skills)}<animate attributeName="opacity" values="1;.55;1" dur="2.4s" repeatCount="indefinite"/></text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="80" viewBox="0 0 ${width} 80" role="img" aria-label="Principal stack: ${escapeXml(skills)}"><rect width="${width}" height="80" rx="10" fill="${c.card}"/>${content}</svg>`;
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
    add(`assets/stats-mobile-${theme}.svg`, () => generateStatsCardSvg({ username: user.username, theme: svgTheme, layout: 'mobile', ...metrics }));
    add(`assets/languages-${theme}.svg`, () => generateTopLangsCardSvg({ languages: profile.topLanguages, theme: svgTheme, layout: 'compact' }));
    add(`assets/languages-mobile-${theme}.svg`, () => generateTopLangsCardSvg({ languages: profile.topLanguages, theme: svgTheme, layout: 'compact', width: 340 }));
    add(`assets/trophies-${theme}.svg`, () => generateTrophyCardSvg({ theme: svgTheme, stats: metrics }));
    add(`assets/trophies-mobile-${theme}.svg`, () => generateTrophyCardSvg({ theme: svgTheme, layout: 'mobile', stats: metrics }));
    add(`assets/streak-${theme}.svg`, () => panel(theme, 'Contribution streak', [
        `Current streak: ${contributionStats.currentStreak} days`,
        `Longest streak: ${contributionStats.longestStreak} days`,
        `Total contributions: ${contributionStats.totalContributions}`,
      ]));
    add(`assets/streak-mobile-${theme}.svg`, () => panel(theme, 'Contribution streak', [
        `Current streak: ${contributionStats.currentStreak} days`,
        `Longest streak: ${contributionStats.longestStreak} days`,
        `Total contributions: ${contributionStats.totalContributions}`,
      ], 160, true));
    add(`assets/contributions-${theme}.svg`, () => panel(theme, 'GitHub activity', [
        `${contributionStats.totalContributions} contributions`,
        `${user.publicRepos} public repositories · ${stars} stars · ${forks} forks`,
      ], 140));
    add(`assets/contributions-mobile-${theme}.svg`, () => panel(theme, 'GitHub activity', [
        `${contributionStats.totalContributions} contributions`,
        `${user.publicRepos} repos · ${stars} stars · ${forks} forks`,
      ], 160, true));
    add(`assets/header-${theme}.svg`, () => header(profile, theme));
    add(`assets/header-mobile-${theme}.svg`, () => header(profile, theme, false, true));
    add(`assets/footer-${theme}.svg`, () => header(profile, theme, true));
    add(`assets/footer-mobile-${theme}.svg`, () => header(profile, theme, true, true));
    add(`assets/stack-${theme}.svg`, () => stack(profile, theme));
    add(`assets/stack-mobile-${theme}.svg`, () => stack(profile, theme, true));
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
      add(`assets/project-${index + 1}-mobile-${theme}.svg`, () => generatePinCardSvg({
        username: user.username,
        repo: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stars,
        forks: repo.forks,
        theme: svgTheme,
        showOwner: false,
        width: 340,
      }));
    });
  }
  return assets;
}
