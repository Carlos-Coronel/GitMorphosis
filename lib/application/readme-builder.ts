// Constructor README - Capa de Aplicación
// Implementa Patrón Builder para construir archivos README.md

import {
  GitHubProfile,
  GitHubUser,
  Repository,
  LanguageStats,
  Template,
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
 * Builds a stats URL pointing to public github-readme-stats instance.
 */
function buildStatsUrl(
  profile: { user: { username: string; followers: number; publicRepos: number }; repositories: { stars: number }[] },
  theme: string,
  options?: ReadmeOptions
): string {
  const username = profile.user.username;
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
 * Builds a top-langs URL with language data embedded.
 */
function buildTopLangsUrl(
  langs: { language: string; percentage: number; color: string }[],
  username: string,
  theme: string,
  layout: string,
  options?: ReadmeOptions
): string {
  const p = new URLSearchParams({
    username, theme, layout, hide_border: 'true',
    langs_count: '8',
  });
  return `https://github-readme-stats-sigma-five.vercel.app/api/top-langs/?${p.toString()}`;
}

/**
 * Builds a pin URL with repo data embedded.
 */
function buildPinUrl(
  repo: { name: string; description: string | null; language: string | null; stars: number; forks: number; url: string },
  username: string,
  theme: string,
  showOwner: boolean,
  options?: ReadmeOptions
): string {
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
  /** Status of external services to decide on fallbacks */
  serviceStatus?: Record<string, boolean>;
  /** Whether to include the contribution snake animation section. Requires GitHub Action setup. Defaults to false. */
  includeSnake?: boolean;
}

/**
 * Builds a trophies URL, using mirror fallback if official is down.
 */
function buildTrophiesUrl(
  username: string,
  theme: string,
  options?: ReadmeOptions
): string {
  const isMirrorUp = options?.serviceStatus?.['trophy-mirror'] !== false;

  // Mirror is always preferred (official is 402 Payment Required)
  if (isMirrorUp) {
    return `https://github-profile-trophy-one.vercel.app/?username=${username}&theme=${theme}&no-frame=true&row=1&column=7`;
  }

  // Last resort: official (may return 402 for high-traffic accounts)
  return `https://github-profile-trophy.vercel.app/?username=${username}&theme=${theme}&no-frame=true&row=1&column=7`;
}

/**
 * Genera la sección del Snake de contribuciones.
 * Solo se incluye si options.includeSnake === true.
 * Incluye el workflow YAML completo como bloque de código para facilitar la configuración.
 */
function buildSnakeSection(username: string): string {
  const snakeDark = `https://raw.githubusercontent.com/${username}/${username}/output/github-contribution-grid-snake-dark.svg`;
  const snakeLight = `https://raw.githubusercontent.com/${username}/${username}/output/github-contribution-grid-snake.svg`;

  let section = `## 🐍 Contribution Snake\n\n`;
  section += `> [!NOTE]\n`;
  section += `> Para que la animación aparezca debes configurar el GitHub Action de abajo una sola vez.\n\n`;
  section += `<div align="center">\n`;
  section += getAdaptiveImage(snakeDark, snakeLight, 'Snake animation') + '\n';
  section += `</div>\n\n`;

  // Provide the full workflow as a fenced code block (visible, copyable)
  section += `<details>\n<summary>⚙️ Configurar GitHub Action (clic para expandir)</summary>\n\n`;
  section += `Crea el archivo \`.github/workflows/snake.yml\` en tu repo con este contenido:\n\n`;
  section += `\`\`\`yaml\n`;
  section += `name: Generate Snake Animation\n\n`;
  section += `on:\n`;
  section += `  schedule:\n`;
  section += `    - cron: "0 0 * * *"\n`;
  section += `  workflow_dispatch:\n`;
  section += `  push:\n`;
  section += `    branches:\n`;
  section += `      - main\n\n`;
  section += `jobs:\n`;
  section += `  generate:\n`;
  section += `    runs-on: ubuntu-latest\n`;
  section += `    timeout-minutes: 5\n`;
  section += `    steps:\n`;
  section += `      - name: Generate snake SVG\n`;
  section += `        uses: Platane/snk/svg-only@v3\n`;
  section += `        with:\n`;
  section += `          github_user_name: \${{ github.repository_owner }}\n`;
  section += `          outputs: |\n`;
  section += `            dist/github-contribution-grid-snake.svg\n`;
  section += `            dist/github-contribution-grid-snake-dark.svg?palette=github-dark\n`;
  section += `      - name: Push to output branch\n`;
  section += `        uses: crazy-max/ghaction-github-pages@v3.1.0\n`;
  section += `        with:\n`;
  section += `          target_branch: output\n`;
  section += `          build_dir: dist\n`;
  section += `        env:\n`;
  section += `          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}\n`;
  section += `\`\`\`\n\n`;
  section += `</details>\n\n`;

  return section;
}

/**
 * Genera la sección de estadísticas de GitHub
 */
function buildStatsSection(profile: GitHubProfile, darkTheme: string, lightTheme: string, options?: ReadmeOptions): string {
  return getAdaptiveImage(
    buildStatsUrl(profile, darkTheme, options),
    buildStatsUrl(profile, lightTheme, options),
    `${profile.user.username}'s GitHub stats`
  );
}

/**
 * Genera la sección de lenguajes más usados
 */
function buildTopLangsSection(profile: GitHubProfile, darkTheme: string, lightTheme: string, layout: string = 'compact', options?: ReadmeOptions): string {
  if (profile.topLanguages.length === 0) return '';
  
  return getAdaptiveImage(
    buildTopLangsUrl(profile.topLanguages, profile.user.username, darkTheme, layout, options),
    buildTopLangsUrl(profile.topLanguages, profile.user.username, lightTheme, layout, options),
    'Top Languages'
  );
}

/**
 * Genera la sección de trofeos
 */
function buildTrophiesSection(username: string, darkTheme: string, lightTheme: string, options?: ReadmeOptions): string {
  return getAdaptiveImage(
    buildTrophiesUrl(username, darkTheme, options),
    buildTrophiesUrl(username, lightTheme, options),
    'GitHub Trophies'
  );
}

/**
 * Genera la sección de racha (streak)
 */
function buildStreakSection(username: string, darkTheme: string, lightTheme: string, options?: ReadmeOptions): string {
  return getAdaptiveImage(
    `https://streak-stats.demolab.com/?user=${username}&theme=${darkTheme}&hide_border=true`,
    `https://streak-stats.demolab.com/?user=${username}&theme=${lightTheme}&hide_border=true`,
    'GitHub Streak'
  );
}

/**
 * Genera la sección de gráfico de actividad
 */
function buildActivityGraphSection(username: string, darkTheme: string = 'tokyo-night', lightTheme: string = 'github'): string {
  return getAdaptiveImage(
    `https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=${darkTheme}&hide_border=true`,
    `https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=${lightTheme}&hide_border=true`,
    'Activity Graph'
  );
}

/**
 * Genera la sección de proyectos destacados
 */
function buildFeaturedProjectsSection(profile: GitHubProfile, darkTheme: string, lightTheme: string, limit: number = 4, showOwner: boolean = false, options?: ReadmeOptions): string {
  const { user, repositories, pinnedRepos } = profile;
  const featuredRepos = pinnedRepos.length > 0 ? pinnedRepos : repositories.filter(r => !r.isForked).slice(0, 6);
  
  if (featuredRepos.length === 0) return '';
  
  let section = `<div align="center">\n`;
  for (const repo of featuredRepos.slice(0, limit)) {
    const darkCard = buildPinUrl(repo, user.username, darkTheme, showOwner, options);
    const lightCard = buildPinUrl(repo, user.username, lightTheme, showOwner, options);
    section += `[${getAdaptiveImage(darkCard, lightCard, repo.name)}](${repo.url})\n`;
  }
  section += `</div>\n\n`;
  return section;
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
    const { user, repositories } = profile;
    const topRepos = repositories.filter(r => !r.isForked).slice(0, 6);
    
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
    readme += buildStatsSection(profile, 'dark', 'default', options) + `\n\n`;
    
    // Languages
    if (profile.topLanguages.length > 0) {
      readme += `## Top Languages\n\n`;
      readme += buildTopLangsSection(profile, 'dark', 'default', 'compact', options) + `\n\n`;
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
    const { user, topLanguages } = profile;
    
    let readme = '';
    
    // Hero Section with animated typing
    readme += `<div align="center">\n`;
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
    readme += `<div align="center">\n`;
    
    for (const lang of topLanguages.slice(0, 8)) {
      const badgeName = lang.language.replace(/\s+/g, '_');
      const color = lang.color.replace('#', '');
      const topicUrl = `https://github.com/topics/${lang.language.toLowerCase().replace(/\s+/g, '-')}`;
      readme += `[![${lang.language}](https://img.shields.io/badge/${badgeName}-${color}?style=for-the-badge&logo=${lang.language.toLowerCase()}&logoColor=white)](${topicUrl}) `;
    }
    readme += `\n</div>\n\n`;
    
    // GitHub Stats
    readme += `## 📊 GitHub Analytics\n\n`;
    readme += `<div align="center">\n`;
    readme += buildStatsSection(profile, 'tokyonight', 'flat', options) + '\n';
    readme += buildTopLangsSection(profile, 'tokyonight', 'flat', 'compact', options) + '\n';
    readme += `</div>\n\n`;
    
    // Streak Stats
    readme += `<div align="center">\n`;
    readme += buildStreakSection(user.username, 'tokyonight', 'flat', options) + '\n';
    readme += `</div>\n\n`;
    
    // Featured Projects
    readme += `## 🚀 Featured Projects\n\n`;
    readme += buildFeaturedProjectsSection(profile, 'tokyonight', 'flat', 4, false, options);
    
    // Activity Snake (only if user has set up the GitHub Action)
    if (options?.includeSnake) {
      readme += buildSnakeSection(user.username);
    }
    
    // Activity Graph
    readme += `## 📈 Contribution Graph\n\n`;
    readme += `<div align="center">\n`;
    readme += buildActivityGraphSection(user.username) + '\n';
    readme += `</div>\n\n`;
    
    // Connect Section
    readme += `## 🤝 Let's Connect\n\n`;
    readme += `<div align="center">\n`;
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
    readme += `\n</div>\n\n`;
    
    // Footer
    readme += `---\n\n`;
    readme += `<div align="center">\n`;
    readme += `*⭐ From [${user.username}](${user.profileUrl}) with ❤️*\n`;
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
    const { user, topLanguages } = profile;
    
    let readme = '';
    
    // Animated Header
    readme += `<div align="center">\n`;
    readme += getAdaptiveImage(
      `https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=${encodeURIComponent(user.name || user.username)}&fontSize=50&fontColor=fff&animation=twinkling&fontAlignY=35&desc=${encodeURIComponent(user.bio || 'Developer')}&descAlignY=55&descSize=18`,
      `https://capsule-render.vercel.app/api?type=waving&color=00B4AB&height=200&section=header&text=${encodeURIComponent(user.name || user.username)}&fontSize=50&fontColor=fff&animation=twinkling&fontAlignY=35&desc=${encodeURIComponent(user.bio || 'Developer')}&descAlignY=55&descSize=18`,
      'Header'
    ) + '\n';
    readme += `</div>\n\n`;
    
    // Typing SVG
    readme += `<div align="center">\n`;
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
    ) + '\n';
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
    readme += `<div align="center">\n`;
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
    readme += `<div align="center">\n`;
    readme += buildTrophiesSection(user.username, 'tokyonight', 'flat', options) + '\n';
    readme += `</div>\n\n`;
    
    // Stats Grid
    readme += `## 📊 GitHub Stats\n\n`;
    readme += `<div align="center">\n`;
    readme += `<table>\n<tr>\n`;
    readme += `<td>\n\n`;
    readme += buildStatsSection(profile, 'tokyonight', 'flat', options) + '\n\n';
    readme += `</td>\n<td>\n\n`;
    readme += buildStreakSection(user.username, 'tokyonight', 'flat', options) + '\n\n';
    readme += `</td>\n</tr>\n</table>\n`;
    readme += `</div>\n\n`;

    // Projects as Cards
    readme += `## 🌟 Featured Repositories\n\n`;
    readme += buildFeaturedProjectsSection(profile, 'tokyonight', 'flat', 4, true, options);
    
    // Activity Snake
    // Activity Snake (only if user has set up the GitHub Action)
    if (options?.includeSnake) {
      readme += buildSnakeSection(user.username);
    }
    
    // Connect
    readme += `## 🌐 Connect with Me\n\n`;
    readme += `<div align="center">\n`;
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
    const { user, repositories } = profile;
    const topRepos = repositories.filter(r => !r.isForked).slice(0, 5);
    
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
    readme += `total ${profile.topLanguages.length}\n`;
    for (const lang of profile.topLanguages.slice(0, 8)) {
      const bar = '█'.repeat(Math.ceil(lang.percentage / 10)) + '░'.repeat(10 - Math.ceil(lang.percentage / 10));
      readme += `drwxr-xr-x  ${lang.language.padEnd(15)} ${bar} ${lang.percentage}%\n`;
    }
    readme += `\`\`\`\n\n`;
    
    // Stats
    readme += `## 📊 System Metrics\n\n`;
    readme += `<div align="center">\n`;
    readme += buildStatsSection(profile, 'chartreuse-dark', 'default', options) + '\n';
    readme += buildTopLangsSection(profile, 'chartreuse-dark', 'default', 'compact', options) + '\n';
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
  
  getAvailableTemplates(): Template[] {
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
