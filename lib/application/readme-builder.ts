// Constructor README - Capa de Aplicación
// Implementa Patrón Builder para construir archivos README.md

import {
  GitHubProfile,
  GitHubUser,
  Repository,
  LanguageStats,
  ReadmeTemplate,
  GeneratedReadme,
  LANGUAGE_COLORS,
} from '@/lib/domain/types';

// Mapeo de colores para redes sociales
const SOCIAL_PLATFORM_COLORS: Record<string, string> = {
  twitter: '1DA1F2',
  linkedin: '0A66C2',
  instagram: 'E4405F',
  youtube: 'FF0000',
  discord: '5865F2',
  twitch: '9146FF',
  dev: '0A0A0A',
  medium: '000000',
  hashnode: '2962FF',
  stackoverflow: 'F48024',
  website: '4285F4',
  email: 'EA4335',
};

/**
 * Genera un tag de imagen adaptativo que cambia entre tema claro y oscuro
 * y utiliza tags <img> para evitar redirecciones automáticas a Camo en GitHub.
 */
function getAdaptiveImage(darkUrl: string, lightUrl: string, alt: string, height?: string): string {
  const heightAttr = height ? ` height="${height}"` : '';
  return `<picture><source media="(prefers-color-scheme: dark)" srcset="${darkUrl}"><source media="(prefers-color-scheme: light)" srcset="${lightUrl}"><img src="${lightUrl}" alt="${alt}"${heightAttr} /></picture>`;
}

/**
 * Builds a self-hosted /api/stats URL with profile data embedded in query params.
 * Falls back to a custom statsUrl server if provided.
 */
function buildStatsUrl(
  profile: { user: { username: string; followers: number; publicRepos: number }; repositories: { stars: number }[] },
  theme: string,
  statsUrl: string,
  siteUrl: string,
  options?: ReadmeOptions
): string {
  const username = profile.user.username;
  const forceSelf = options?.forceSelfHosted;

  // Custom stats server override (e.g. self-hosted github-readme-stats)
  if (statsUrl) {
    const p = new URLSearchParams({ username, theme, show_icons: 'true', hide_border: 'true' });
    return `${statsUrl}/api?${p.toString()}`;
  }
  
  // Self-hosted API route
  if (forceSelf && siteUrl && !siteUrl.includes('github.io')) {
    const p = new URLSearchParams({ username, theme, show_icons: 'true', hide_border: 'true' });
    return `${siteUrl}/api/stats?${p.toString()}`;
  }

  // Default: public github-readme-stats (works everywhere, no server needed)
  const p = new URLSearchParams({
    username,
    theme,
    show_icons: 'true',
    hide_border: 'true',
    count_private: 'true',
  });
  return `https://github-readme-stats-sigma-five.vercel.app/api?${p.toString()}`;
}

/**
 * Builds a self-hosted /api/top-langs URL with language data embedded.
 */
function buildTopLangsUrl(
  langs: { language: string; percentage: number; color: string }[],
  username: string,
  theme: string,
  layout: string,
  statsUrl: string,
  siteUrl: string,
  options?: ReadmeOptions
): string {
  const forceSelf = options?.forceSelfHosted;

  if (statsUrl) {
    const p = new URLSearchParams({ username, theme, layout, hide_border: 'true' });
    return `${statsUrl}/api/top-langs/?${p.toString()}`;
  }

  if (forceSelf && siteUrl && !siteUrl.includes('github.io')) {
    const p = new URLSearchParams({ username, theme, layout, hide_border: 'true' });
    return `${siteUrl}/api/top-langs?${p.toString()}`;
  }

  // Default: public github-readme-stats top-langs
  const p = new URLSearchParams({
    username, theme, layout, hide_border: 'true',
    langs_count: '8',
  });
  return `https://github-readme-stats-sigma-five.vercel.app/api/top-langs/?${p.toString()}`;
}

/**
 * Builds a self-hosted /api/pin URL with repo data embedded.
 */
function buildPinUrl(
  repo: { name: string; description: string | null; language: string | null; stars: number; forks: number; url: string },
  username: string,
  theme: string,
  showOwner: boolean,
  statsUrl: string,
  siteUrl: string,
  options?: ReadmeOptions
): string {
  const forceSelf = options?.forceSelfHosted;

  if (statsUrl) {
    const p = new URLSearchParams({ username, repo: repo.name, theme, hide_border: 'true', show_owner: String(showOwner) });
    return `${statsUrl}/api/pin/?${p.toString()}`;
  }

  if (forceSelf && siteUrl && !siteUrl.includes('github.io')) {
    const p = new URLSearchParams({ username, repo: repo.name, theme, hide_border: 'true', show_owner: String(showOwner) });
    return `${siteUrl}/api/pin?${p.toString()}`;
  }

  // Default: public github-readme-stats pin
  const p = new URLSearchParams({
    username,
    repo: repo.name,
    theme,
    hide_border: 'true',
    show_owner: String(showOwner),
  });
  return `https://github-readme-stats-sigma-five.vercel.app/api/pin/?${p.toString()}`;
}

export interface ReadmeOptions {
  /** Override base URL for github-readme-stats-compatible server (e.g. self-hosted). Leave blank to use the built-in /api/stats routes. */
  statsUrl?: string;
  /** Override base URL for streak-stats server. Defaults to streak-stats.demolab.com */
  streakUrl?: string;
  /** The origin used to build absolute self-hosted SVG URLs (e.g. https://yourdomain.com). Required when generating README for deployment. */
  siteUrl?: string;
  /** Force using self-hosted API routes for all SVG cards */
  forceSelfHosted?: boolean;
  /** Status of external services to decide on fallbacks */
  serviceStatus?: Record<string, boolean>;
}

/**
 * Builds a trophies URL, using self-hosted fallback if specified or if official is down.
 */
function buildTrophiesUrl(
  username: string,
  theme: string,
  siteUrl: string,
  options?: ReadmeOptions
): string {
  const isDown = options?.serviceStatus?.['github-profile-trophy'] === false;
  const isMirrorUp = options?.serviceStatus?.['trophy-mirror'] !== false;
  const forceSelf = options?.forceSelfHosted;

  // 1. Si se fuerza el propio y tenemos siteUrl (no en GitHub Pages)
  if (forceSelf && siteUrl && !siteUrl.includes('github.io')) {
    const p = new URLSearchParams({ username, theme, 'no-frame': 'true', row: '1', column: '7' });
    return `${siteUrl}/api/trophies?${p.toString()}`;
  }

  // 2. Si el oficial está caído, intentamos el espejo (mirror)
  if (isDown && isMirrorUp) {
    return `https://github-profile-trophy-one.vercel.app/?username=${username}&theme=${theme}&no-frame=true&row=1&column=7`;
  }

  // 3. Si el oficial está caído y el espejo también, y tenemos siteUrl propio
  if (isDown && !isMirrorUp && siteUrl && !siteUrl.includes('github.io')) {
    const p = new URLSearchParams({ username, theme, 'no-frame': 'true', row: '1', column: '7' });
    return `${siteUrl}/api/trophies?${p.toString()}`;
  }

  // Por defecto el oficial
  return `https://github-profile-trophy.vercel.app/?username=${username}&theme=${theme}&no-frame=true&row=1&column=7`;
}

// Interfaz de Estrategia de Plantilla (Patrón Strategy)
export interface IReadmeStrategy {
  id: string;
  name: string;
  description: string;
  generate(profile: GitHubProfile, options?: ReadmeOptions): string;
}

// Plantilla Minimalista Moderna
export class MinimalistStrategy implements IReadmeStrategy {
  id = 'minimalist';
  name = 'Minimalista';
  description = 'Perfil limpio y simple con información esencial';
  
  generate(profile: GitHubProfile, options?: ReadmeOptions): string {
    const { user, repositories, topLanguages } = profile;
    const topRepos = repositories.filter(r => !r.isForked).slice(0, 6);
    
    const statsUrl = options?.statsUrl?.trim().replace(/\/+$/, '') || '';
    const siteUrl = options?.siteUrl?.trim().replace(/\/+$/, '') || '';
    
    let readme = '';
    
    // Header
    readme += `# Hi, I'm ${user.name || user.username} 👋\n\n`;
    
    if (user.bio) {
      readme += `> ${user.bio}\n\n`;
    }
    
    // About section
    readme += `## About Me\n\n`;
    if (user.location) readme += `📍 ${user.location}\n`;
    if (user.company) readme += `💼 ${user.company}\n`;
    if (user.blog) readme += `🌐 [${user.blog}](${user.blog})\n`;
    readme += '\n';
    
    // Stats
    readme += `## GitHub Stats\n\n`;
    readme += getAdaptiveImage(
      buildStatsUrl(profile, 'dark', statsUrl, siteUrl, options),
      buildStatsUrl(profile, 'default', statsUrl, siteUrl, options),
      `${user.username}'s GitHub stats`
    ) + `\n\n`;
    
    // Languages
    if (topLanguages.length > 0) {
      readme += `## Top Languages\n\n`;
      readme += getAdaptiveImage(
        buildTopLangsUrl(topLanguages, user.username, 'dark', 'compact', statsUrl, siteUrl, options),
        buildTopLangsUrl(topLanguages, user.username, 'default', 'compact', statsUrl, siteUrl, options),
        `Top Langs`
      ) + `\n\n`;
    }
    
    // Projects
    if (topRepos.length > 0) {
      readme += `## Featured Projects\n\n`;
      for (const repo of topRepos) {
        readme += `### [${repo.name}](${repo.url})\n`;
        if (repo.description) readme += `${repo.description}\n`;
        readme += `⭐ ${repo.stars} | 🍴 ${repo.forks}`;
        if (repo.language) readme += ` | ${repo.language}`;
        readme += '\n\n';
      }
    }
    
    // Footer
    readme += `---\n\n`;
    readme += `📫 **Let's connect!** [GitHub](${user.profileUrl})`;
    
    if (user.socialLinks && user.socialLinks.length > 0) {
      for (const link of user.socialLinks) {
        readme += ` | [${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}](${link.url})`;
      }
    } else {
      if (user.twitterUsername) {
        readme += ` | [Twitter](https://twitter.com/${user.twitterUsername})`;
      }
      if (user.blog) {
        readme += ` | [Website](${user.blog})`;
      }
    }
    readme += '\n';
    
    return readme;
  }
}

// Plantilla de Portafolio Desarrollador
export class PortfolioStrategy implements IReadmeStrategy {
  id = 'portfolio';
  name = 'Portafolio Desarrollador';
  description = 'Portafolio profesional con exhibición de habilidades y destacados de proyectos';
  
  generate(profile: GitHubProfile, options?: ReadmeOptions): string {
    const { user, repositories, topLanguages, pinnedRepos } = profile;
    const featuredRepos = pinnedRepos.length > 0 ? pinnedRepos : repositories.filter(r => !r.isForked).slice(0, 6);
    
    const statsUrl = options?.statsUrl?.trim().replace(/\/+$/, '') || '';
    const streakUrl = options?.streakUrl?.trim().replace(/\/+$/, '') || 'https://streak-stats.demolab.com';
    const siteUrl = options?.siteUrl?.trim().replace(/\/+$/, '') || '';
    
    let readme = '';
    
    // Hero Section with animated typing
    readme += `<div align="center">\n\n`;
    readme += `# ${user.name || user.username}\n\n`;
    if (user.bio) {
      readme += `### ${user.bio}\n\n`;
    }
    
    // Badges
    const badges: string[] = [];
    if (user.location) {
      badges.push(`<img src="https://img.shields.io/badge/📍-${encodeURIComponent(user.location)}-blue?style=flat-square" alt="Location" />`);
    }
    badges.push(`<img src="https://img.shields.io/github/followers/${user.username}?style=flat-square&logo=github" alt="Followers" />`);
    badges.push(`<img src="https://komarev.com/ghpvc/?username=${user.username}&style=flat-square" alt="Profile Views" />`);
    
    readme += badges.join(' ') + '\n\n';
    readme += `</div>\n\n`;
    
    // Tech Stack
    readme += `## 🛠️ Tech Stack\n\n`;
    readme += `<div align="center">\n\n`;
    
    for (const lang of topLanguages.slice(0, 8)) {
      const badgeName = lang.language.replace(/\s+/g, '_');
      const color = lang.color.replace('#', '');
      const topicUrl = `https://github.com/topics/${lang.language.toLowerCase().replace(/\s+/g, '-')}`;
      readme += `[![${lang.language}](https://img.shields.io/badge/${badgeName}-${color}?style=for-the-badge&logo=${lang.language.toLowerCase()}&logoColor=white)](${topicUrl}) `;
    }
    readme += '\n\n</div>\n\n';
    
    // GitHub Stats
    readme += `## 📊 GitHub Analytics\n\n`;
    readme += `<div align="center">\n\n`;
    readme += getAdaptiveImage(
      buildStatsUrl(profile, 'tokyonight', statsUrl, siteUrl, options),
      buildStatsUrl(profile, 'flat', statsUrl, siteUrl, options),
      `${user.username}'s GitHub stats`,
      '180em'
    ) + '\n';
    readme += getAdaptiveImage(
      buildTopLangsUrl(topLanguages, user.username, 'tokyonight', 'compact', statsUrl, siteUrl, options),
      buildTopLangsUrl(topLanguages, user.username, 'flat', 'compact', statsUrl, siteUrl, options),
      'Top Langs',
      '180em'
    ) + '\n\n';
    readme += `</div>\n\n`;
    
    // Streak Stats
    readme += `<div align="center">\n\n`;
    readme += getAdaptiveImage(
      `${streakUrl}/?user=${user.username}&theme=tokyonight&hide_border=true`,
      `${streakUrl}/?user=${user.username}&theme=flat&hide_border=true`,
      'GitHub Streak'
    ) + '\n\n';
    readme += `</div>\n\n`;
    
    // Featured Projects
    if (featuredRepos.length > 0) {
      readme += `## 🚀 Featured Projects\n\n`;
      readme += `<div align="center">\n\n`;
      
      for (const repo of featuredRepos.slice(0, 4)) {
        const darkCard = buildPinUrl(repo, user.username, 'tokyonight', false, statsUrl, siteUrl, options);
        const lightCard = buildPinUrl(repo, user.username, 'flat', false, statsUrl, siteUrl, options);
        readme += `[${getAdaptiveImage(darkCard, lightCard, repo.name)}](${repo.url})\n`;
      }
      
      readme += '\n</div>\n\n';
    }
    
    // Connect Section
    readme += `## 🤝 Let's Connect\n\n`;
    readme += `<div align="center">\n\n`;
    readme += `[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](${user.profileUrl})`;
    
    if (user.socialLinks && user.socialLinks.length > 0) {
      for (const link of user.socialLinks) {
        const color = SOCIAL_PLATFORM_COLORS[link.platform] || '444';
        const logo = link.platform === 'website' ? 'google-chrome' : link.platform;
        readme += `\n[![${link.platform}](https://img.shields.io/badge/${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}-${color}?style=for-the-badge&logo=${logo}&logoColor=white)](${link.url})`;
      }
    } else {
      if (user.twitterUsername) {
        readme += `\n[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/${user.twitterUsername})`;
      }
      if (user.blog) {
        readme += `\n[![Website](https://img.shields.io/badge/Website-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](${user.blog})`;
      }
    }
    readme += '\n\n</div>\n\n';
    
    // Activity Graph
    readme += `## 📈 Contribution Graph\n\n`;
    readme += getAdaptiveImage(
      `https://github-readme-activity-graph.vercel.app/graph?username=${user.username}&theme=tokyo-night&hide_border=true`,
      `https://github-readme-activity-graph.vercel.app/graph?username=${user.username}&theme=github&hide_border=true`,
      'Activity Graph'
    ) + '\n\n';
    
    // Footer
    readme += `---\n\n`;
    readme += `<div align="center">\n\n`;
    readme += `*⭐ From [${user.username}](${user.profileUrl}) with ❤️*\n\n`;
    readme += `</div>\n`;
    
    return readme;
  }
}

// Plantilla Creativa/Única
export class CreativeStrategy implements IReadmeStrategy {
  id = 'creative';
  name = 'Creativa';
  description = 'Diseño único y llamativo con animaciones y elementos creativos';
  
  generate(profile: GitHubProfile, options?: ReadmeOptions): string {
    const { user, repositories, topLanguages } = profile;
    const topRepos = repositories.filter(r => !r.isForked).slice(0, 4);
    
    const statsUrl = options?.statsUrl?.trim().replace(/\/+$/, '') || '';
    const streakUrl = options?.streakUrl?.trim().replace(/\/+$/, '') || 'https://streak-stats.demolab.com';
    const siteUrl = options?.siteUrl?.trim().replace(/\/+$/, '') || '';
    
    let readme = '';
    
    // Animated Header
    readme += `<div align="center">\n\n`;
    readme += getAdaptiveImage(
      `https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=${encodeURIComponent(user.name || user.username)}&fontSize=50&fontColor=fff&animation=twinkling&fontAlignY=35&desc=${encodeURIComponent(user.bio || 'Developer')}&descAlignY=55&descSize=18`,
      `https://capsule-render.vercel.app/api?type=waving&color=00B4AB&height=200&section=header&text=${encodeURIComponent(user.name || user.username)}&fontSize=50&fontColor=fff&animation=twinkling&fontAlignY=35&desc=${encodeURIComponent(user.bio || 'Developer')}&descAlignY=55&descSize=18`,
      'Header'
    ) + '\n\n';
    readme += `</div>\n\n`;
    
    // Typing SVG
    readme += `<div align="center">\n\n`;
    const skillsList = topLanguages.slice(0, 6).map(l => l.language).join(' | ');
    const lines = [
      'Welcome to my GitHub Profile!',
      `Main skills: ${skillsList}`
    ];
    const encodedLines = lines.map(line => encodeURIComponent(line)).join(';');
    readme += getAdaptiveImage(
      `https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=58A6FF&center=true&vCenter=true&random=false&width=600&lines=${encodedLines}`,
      `https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=3178c6&center=true&vCenter=true&random=false&width=600&lines=${encodedLines}`,
      'Typing SVG'
    ) + '\n\n';
    readme += `</div>\n\n`;
    
    // About with icons
    readme += `## 💫 About Me\n\n`;
    readme += `\`\`\`javascript\n`;
    readme += `const developer = {\n`;
    readme += `  name: "${user.name || user.username}",\n`;
    if (user.location) readme += `  location: "${user.location}",\n`;
    if (user.company) readme += `  company: "${user.company}",\n`;
    readme += `  languages: [${topLanguages.slice(0, 5).map(l => `"${l.language}"`).join(', ')}],\n`;
    readme += `  followers: ${user.followers},\n`;
    readme += `  publicRepos: ${user.publicRepos},\n`;
    readme += `};\n`;
    readme += `\`\`\`\n\n`;
    
    // Skills Matrix
    readme += `## 🎯 Skills & Technologies\n\n`;
    readme += `<div align="center">\n\n`;
    readme += `| Category | Technologies |\n`;
    readme += `|----------|-------------|\n`;
    
    const langGroups: Record<string, string[]> = {
      'Languages': [],
      'Frameworks': [],
      'Tools': [],
    };
    
    for (const lang of topLanguages) {
      langGroups['Languages'].push(lang.language);
    }
    
    for (const [category, techs] of Object.entries(langGroups)) {
      if (techs.length > 0) {
        const badges = techs.slice(0, 5).map(t => {
          const topicUrl = `https://github.com/topics/${t.toLowerCase().replace(/\s+/g, '-')}`;
          return `[![${t}](https://img.shields.io/badge/-${t}-05122A?style=flat&logo=${t.toLowerCase()})](${topicUrl})`;
        }).join(' ');
        readme += `| ${category} | ${badges} |\n`;
      }
    }
    readme += '\n</div>\n\n';
    
    // Stats with Trophy
    readme += `## 🏆 GitHub Trophies\n\n`;
    readme += `<div align="center">\n\n`;
    readme += getAdaptiveImage(
      buildTrophiesUrl(user.username, 'tokyonight', siteUrl, options),
      buildTrophiesUrl(user.username, 'flat', siteUrl, options),
      'trophy'
    ) + '\n\n';
    readme += `</div>\n\n`;
    
    // Stats Grid
    readme += `## 📊 GitHub Stats\n\n`;
    readme += `<div align="center">\n`;
    readme += `<table>\n<tr>\n`;
    readme += `<td>\n\n`;
    readme += getAdaptiveImage(
      buildStatsUrl(profile, 'tokyonight', statsUrl, siteUrl, options),
      buildStatsUrl(profile, 'flat', statsUrl, siteUrl, options),
      'Stats'
    ) + '\n\n';
    readme += `</td>\n<td>\n\n`;
    readme += getAdaptiveImage(
      `${streakUrl}/?user=${user.username}&theme=tokyonight&hide_border=true`,
      `${streakUrl}/?user=${user.username}&theme=flat&hide_border=true`,
      'Streak'
    ) + '\n\n';
    readme += `</td>\n</tr>\n</table>\n`;
    readme += `</div>\n\n`;

    // Projects as Cards
    if (topRepos.length > 0) {
      readme += `## 🌟 Featured Repositories\n\n`;
      readme += `<div align="center">\n\n`;
      
      for (const repo of topRepos) {
        // En tarjetas de proyectos mantenemos el link pero usamos img adaptativa
        const darkCard = buildPinUrl(repo, user.username, 'tokyonight', true, statsUrl, siteUrl, options);
        const lightCard = buildPinUrl(repo, user.username, 'flat', true, statsUrl, siteUrl, options);
        readme += `[${getAdaptiveImage(darkCard, lightCard, repo.name)}](${repo.url})\n`;
      }
      
      readme += '\n</div>\n\n';
    }
    
    // Activity Snake
    // GitHub Actions Platane/snk public URL
    const snakeDark = `https://raw.githubusercontent.com/${user.username}/${user.username}/output/github-contribution-grid-snake-dark.svg`;
    const snakeLight = `https://raw.githubusercontent.com/${user.username}/${user.username}/output/github-contribution-grid-snake.svg`;

    readme += `## 🐍 Contribution Snake\n\n`;
    readme += `<div align="center">\n\n`;
    readme += getAdaptiveImage(snakeDark, snakeLight, 'Snake animation') + '\n\n';
    readme += `</div>\n\n`;


    
    // Connect
    readme += `## 🌐 Connect with Me\n\n`;
    readme += `<div align="center">\n\n`;
    readme += `[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github)](${user.profileUrl})\n`;
    
    if (user.socialLinks && user.socialLinks.length > 0) {
      for (const link of user.socialLinks) {
        const color = SOCIAL_PLATFORM_COLORS[link.platform] || '444';
        const logo = link.platform === 'website' ? 'firefox' : link.platform;
        readme += `[![${link.platform}](https://img.shields.io/badge/-${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}-${color}?style=for-the-badge&logo=${logo}&logoColor=white)](${link.url})\n`;
      }
    } else {
      if (user.twitterUsername) {
        readme += `[![Twitter](https://img.shields.io/badge/-Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/${user.twitterUsername})\n`;
      }
      if (user.blog) {
        readme += `[![Website](https://img.shields.io/badge/-Website-FF7139?style=for-the-badge&logo=firefox&logoColor=white)](${user.blog})\n`;
      }
    }
    readme += '\n</div>\n\n';
    
    // Footer Wave
    readme += getAdaptiveImage(
      `https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer`,
      `https://capsule-render.vercel.app/api?type=waving&color=00B4AB&height=100&section=footer`,
      'Footer'
    ) + '\n';
    
    return readme;
  }
}

// Plantilla Estilo Terminal/Hacker
export class TerminalStrategy implements IReadmeStrategy {
  id = 'terminal';
  name = 'Terminal';
  description = 'Estética de terminal estilo hacker con fuentes monoespaciadas';
  
  generate(profile: GitHubProfile, options?: ReadmeOptions): string {
    const { user, repositories, topLanguages } = profile;
    const topRepos = repositories.filter(r => !r.isForked).slice(0, 5);
    
    const statsUrl = options?.statsUrl?.trim().replace(/\/+$/, '') || '';
    const siteUrl = options?.siteUrl?.trim().replace(/\/+$/, '') || '';
    
    let readme = '';
    
    readme += `\`\`\`bash\n`;
    readme += `╔══════════════════════════════════════════════════════════════════╗\n`;
    readme += `║                                                                  ║\n`;
    readme += `║   ██████╗ ███████╗██╗   ██╗███████╗██╗      ██████╗ ██████╗ ███████╗██████╗   ║\n`;
    readme += `║   ██╔══██╗██╔════╝██║   ██║██╔════╝██║     ██╔═══██╗██╔══██╗██╔════╝██╔══██╗  ║\n`;
    readme += `║   ██║  ██║█████╗  ██║   ██║█████╗  ██║     ██║   ██║██████╔╝█████╗  ██████╔╝  ║\n`;
    readme += `║   ██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗  ║\n`;
    readme += `║   ██████╔╝███████╗ ╚████╔╝ ███████╗███████╗╚██████╔╝██║     ███████╗██║  ██║  ║\n`;
    readme += `║   ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝  ║\n`;
    readme += `║                                                                  ║\n`;
    readme += `╚══════════════════════════════════════════════════════════════════╝\n`;
    readme += `\`\`\`\n\n`;
    
    // System Info
    readme += `\`\`\`bash\n`;
    readme += `$ whoami\n`;
    readme += `> ${user.name || user.username}\n\n`;
    readme += `$ cat /etc/profile\n`;
    if (user.bio) readme += `> ${user.bio}\n`;
    if (user.location) readme += `> Location: ${user.location}\n`;
    if (user.company) readme += `> Organization: ${user.company}\n`;
    readme += `> Public Repos: ${user.publicRepos}\n`;
    readme += `> Followers: ${user.followers} | Following: ${user.following}\n`;
    readme += `\`\`\`\n\n`;
    
    // Skills
    readme += `\`\`\`bash\n`;
    readme += `$ ls -la /skills/\n`;
    readme += `total ${topLanguages.length}\n`;
    for (const lang of topLanguages.slice(0, 8)) {
      const bar = '█'.repeat(Math.ceil(lang.percentage / 10)) + '░'.repeat(10 - Math.ceil(lang.percentage / 10));
      readme += `drwxr-xr-x  ${lang.language.padEnd(15)} ${bar} ${lang.percentage}%\n`;
    }
    readme += `\`\`\`\n\n`;
    
    // Stats
    readme += `## 📊 System Metrics\n\n`;
    readme += `<div align="center">\n\n`;
    readme += getAdaptiveImage(
      buildStatsUrl(profile, 'chartreuse-dark', statsUrl, siteUrl, options),
      buildStatsUrl(profile, 'default', statsUrl, siteUrl, options),
      'Stats'
    ) + '\n\n';
    readme += getAdaptiveImage(
      buildTopLangsUrl(topLanguages, user.username, 'chartreuse-dark', 'compact', statsUrl, siteUrl, options),
      buildTopLangsUrl(topLanguages, user.username, 'default', 'compact', statsUrl, siteUrl, options),
      'Top Langs'
    ) + '\n\n';
    readme += `</div>\n\n`;
    
    // Repositories
    if (topRepos.length > 0) {
      readme += `\`\`\`bash\n`;
      readme += `$ git log --oneline --graph /repos/\n`;
      for (const repo of topRepos) {
        readme += `* ${repo.name} - ${repo.description || 'No description'}\n`;
        readme += `  ├── Language: ${repo.language || 'Unknown'}\n`;
        readme += `  ├── Stars: ${repo.stars} | Forks: ${repo.forks}\n`;
        readme += `  └── URL: ${repo.url}\n`;
      }
      readme += `\`\`\`\n\n`;
    }
    
    // Connect
    readme += `\`\`\`bash\n`;
    readme += `$ cat /etc/social-links\n`;
    readme += `[GitHub]     ${user.profileUrl}\n`;
    
    if (user.socialLinks && user.socialLinks.length > 0) {
      for (const link of user.socialLinks) {
        const label = `[${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}]`;
        readme += `${label.padEnd(13)} ${link.url}\n`;
      }
    } else {
      if (user.twitterUsername) readme += `[Twitter]    https://twitter.com/${user.twitterUsername}\n`;
      if (user.blog) readme += `[Website]    ${user.blog}\n`;
    }
    readme += `\n`;
    readme += `$ echo "Thanks for visiting! 👋"\n`;
    readme += `\`\`\`\n`;
    
    return readme;
  }
}

// Clase Constructor README (Patrón Builder)
export class ReadmeBuilder {
  private strategies: Map<string, IReadmeStrategy> = new Map();
  
  constructor() {
    // Registrar estrategias predeterminadas
    this.registerStrategy(new MinimalistStrategy());
    this.registerStrategy(new PortfolioStrategy());
    this.registerStrategy(new CreativeStrategy());
    this.registerStrategy(new TerminalStrategy());
  }
  
  registerStrategy(strategy: IReadmeStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }
  
  getAvailableTemplates(): ReadmeTemplate[] {
    return Array.from(this.strategies.values()).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      preview: '', // Podría ser una miniatura
    }));
  }
  
  build(profile: GitHubProfile, templateId: string = 'portfolio', options?: ReadmeOptions): GeneratedReadme {
    const strategy = this.strategies.get(templateId);
    if (!strategy) {
      throw new Error(`Plantilla no encontrada: ${templateId}`);
    }
    
    return {
      markdown: strategy.generate(profile, options),
      templateId,
      generatedAt: new Date(),
      profile,
    };
  }
}

// Función de fábrica
export function createReadmeBuilder(): ReadmeBuilder {
  return new ReadmeBuilder();
}
