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

// Interfaz de Estrategia de Plantilla (Patrón Strategy)
export interface IReadmeStrategy {
  id: string;
  name: string;
  description: string;
  generate(profile: GitHubProfile): string;
}

// Plantilla Minimalista Moderna
export class MinimalistStrategy implements IReadmeStrategy {
  id = 'minimalist';
  name = 'Minimalista';
  description = 'Perfil limpio y simple con información esencial';
  
  generate(profile: GitHubProfile): string {
    const { user, repositories, topLanguages } = profile;
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
    readme += `![${user.username}'s GitHub stats](https://github-readme-stats.vercel.app/api?username=${user.username}&show_icons=true&theme=dark&hide_border=true)\n\n`;
    
    // Languages
    if (topLanguages.length > 0) {
      readme += `## Top Languages\n\n`;
      readme += `![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=${user.username}&layout=compact&theme=dark&hide_border=true)\n\n`;
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
    if (user.twitterUsername) {
      readme += ` | [Twitter](https://twitter.com/${user.twitterUsername})`;
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
  
  generate(profile: GitHubProfile): string {
    const { user, repositories, topLanguages, pinnedRepos } = profile;
    const featuredRepos = pinnedRepos.length > 0 ? pinnedRepos : repositories.filter(r => !r.isForked).slice(0, 6);
    
    let readme = '';
    
    // Hero Section with animated typing
    readme += `<div align="center">\n\n`;
    readme += `# 👨‍💻 ${user.name || user.username}\n\n`;
    if (user.bio) {
      readme += `### ${user.bio}\n\n`;
    }
    
    // Badges
    const badges: string[] = [];
    if (user.location) {
      badges.push(`![Location](https://img.shields.io/badge/📍-${encodeURIComponent(user.location)}-blue?style=flat-square)`);
    }
    badges.push(`![Followers](https://img.shields.io/github/followers/${user.username}?style=flat-square&logo=github)`);
    badges.push(`![Profile Views](https://komarev.com/ghpvc/?username=${user.username}&style=flat-square)`);
    
    readme += badges.join(' ') + '\n\n';
    readme += `</div>\n\n`;
    
    // Tech Stack
    readme += `## 🛠️ Tech Stack\n\n`;
    readme += `<div align="center">\n\n`;
    
    for (const lang of topLanguages.slice(0, 8)) {
      const badgeName = lang.language.replace(/\s+/g, '_');
      const color = lang.color.replace('#', '');
      readme += `![${lang.language}](https://img.shields.io/badge/${badgeName}-${color}?style=for-the-badge&logo=${lang.language.toLowerCase()}&logoColor=white) `;
    }
    readme += '\n\n</div>\n\n';
    
    // GitHub Stats
    readme += `## 📊 GitHub Analytics\n\n`;
    readme += `<div align="center">\n\n`;
    readme += `<img height="180em" src="https://github-readme-stats.vercel.app/api?username=${user.username}&show_icons=true&theme=tokyonight&hide_border=true&count_private=true"/>\n`;
    readme += `<img height="180em" src="https://github-readme-stats.vercel.app/api/top-langs/?username=${user.username}&layout=compact&theme=tokyonight&hide_border=true"/>\n\n`;
    readme += `</div>\n\n`;
    
    // Streak Stats
    readme += `<div align="center">\n\n`;
    readme += `![GitHub Streak](https://github-readme-streak-stats.herokuapp.com/?user=${user.username}&theme=tokyonight&hide_border=true)\n\n`;
    readme += `</div>\n\n`;
    
    // Featured Projects
    if (featuredRepos.length > 0) {
      readme += `## 🚀 Featured Projects\n\n`;
      readme += `<div align="center">\n\n`;
      
      for (const repo of featuredRepos.slice(0, 4)) {
        readme += `[![${repo.name}](https://github-readme-stats.vercel.app/api/pin/?username=${user.username}&repo=${repo.name}&theme=tokyonight&hide_border=true)](${repo.url})\n`;
      }
      
      readme += '\n</div>\n\n';
    }
    
    // Connect Section
    readme += `## 🤝 Let's Connect\n\n`;
    readme += `<div align="center">\n\n`;
    readme += `[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](${user.profileUrl})`;
    if (user.twitterUsername) {
      readme += `\n[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/${user.twitterUsername})`;
    }
    if (user.blog) {
      readme += `\n[![Website](https://img.shields.io/badge/Website-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](${user.blog})`;
    }
    readme += '\n\n</div>\n\n';
    
    // Activity Graph
    readme += `## 📈 Contribution Graph\n\n`;
    readme += `![Activity Graph](https://github-readme-activity-graph.vercel.app/graph?username=${user.username}&theme=tokyo-night&hide_border=true)\n\n`;
    
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
  
  generate(profile: GitHubProfile): string {
    const { user, repositories, topLanguages } = profile;
    const topRepos = repositories.filter(r => !r.isForked).slice(0, 4);
    
    let readme = '';
    
    // Animated Header
    readme += `<div align="center">\n\n`;
    readme += `![Header](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=${encodeURIComponent(user.name || user.username)}&fontSize=50&fontColor=fff&animation=twinkling&fontAlignY=35&desc=${encodeURIComponent(user.bio || 'Developer')}&descAlignY=55&descSize=18)\n\n`;
    readme += `</div>\n\n`;
    
    // Typing SVG
    readme += `<div align="center">\n\n`;
    const skills = topLanguages.slice(0, 5).map(l => l.language).join(';');
    readme += `[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=58A6FF&center=true&vCenter=true&random=false&width=600&lines=Welcome+to+my+GitHub+Profile!;${encodeURIComponent(skills.replace(';', '+%7C+'))})](https://git.io/typing-svg)\n\n`;
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
        const badges = techs.slice(0, 5).map(t => `![${t}](https://img.shields.io/badge/-${t}-05122A?style=flat&logo=${t.toLowerCase()})`).join(' ');
        readme += `| ${category} | ${badges} |\n`;
      }
    }
    readme += '\n</div>\n\n';
    
    // Stats with Trophy
    readme += `## 🏆 GitHub Trophies\n\n`;
    readme += `<div align="center">\n\n`;
    readme += `[![trophy](https://github-profile-trophy.vercel.app/?username=${user.username}&theme=tokyonight&no-frame=true&row=1&column=7)](https://github.com/ryo-ma/github-profile-trophy)\n\n`;
    readme += `</div>\n\n`;
    
    // Stats Grid
    readme += `## 📊 GitHub Stats\n\n`;
    readme += `<div align="center">\n`;
    readme += `<table>\n<tr>\n`;
    readme += `<td>\n\n`;
    readme += `![Stats](https://github-readme-stats.vercel.app/api?username=${user.username}&show_icons=true&theme=tokyonight&hide_border=true&count_private=true)\n\n`;
    readme += `</td>\n<td>\n\n`;
    readme += `![Streak](https://github-readme-streak-stats.herokuapp.com/?user=${user.username}&theme=tokyonight&hide_border=true)\n\n`;
    readme += `</td>\n</tr>\n</table>\n`;
    readme += `</div>\n\n`;
    
    // Projects as Cards
    if (topRepos.length > 0) {
      readme += `## 🌟 Featured Repositories\n\n`;
      readme += `<div align="center">\n\n`;
      
      for (const repo of topRepos) {
        readme += `[![${repo.name}](https://github-readme-stats.vercel.app/api/pin/?username=${user.username}&repo=${repo.name}&theme=tokyonight&hide_border=true&show_owner=true)](${repo.url})\n`;
      }
      
      readme += '\n</div>\n\n';
    }
    
    // Activity Snake
    readme += `## 🐍 Contribution Snake\n\n`;
    readme += `<div align="center">\n\n`;
    readme += `![Snake animation](https://raw.githubusercontent.com/${user.username}/${user.username}/output/github-contribution-grid-snake-dark.svg)\n\n`;
    readme += `</div>\n\n`;
    
    // Connect
    readme += `## 🌐 Connect with Me\n\n`;
    readme += `<div align="center">\n\n`;
    readme += `[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github)](${user.profileUrl})\n`;
    if (user.twitterUsername) {
      readme += `[![Twitter](https://img.shields.io/badge/-Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/${user.twitterUsername})\n`;
    }
    if (user.blog) {
      readme += `[![Website](https://img.shields.io/badge/-Website-FF7139?style=for-the-badge&logo=firefox&logoColor=white)](${user.blog})\n`;
    }
    readme += '\n</div>\n\n';
    
    // Footer Wave
    readme += `![Footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer)\n`;
    
    return readme;
  }
}

// Plantilla Estilo Terminal/Hacker
export class TerminalStrategy implements IReadmeStrategy {
  id = 'terminal';
  name = 'Terminal';
  description = 'Estética de terminal estilo hacker con fuentes monoespaciadas';
  
  generate(profile: GitHubProfile): string {
    const { user, repositories, topLanguages } = profile;
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
    readme += `total ${topLanguages.length}\n`;
    for (const lang of topLanguages.slice(0, 8)) {
      const bar = '█'.repeat(Math.ceil(lang.percentage / 10)) + '░'.repeat(10 - Math.ceil(lang.percentage / 10));
      readme += `drwxr-xr-x  ${lang.language.padEnd(15)} ${bar} ${lang.percentage}%\n`;
    }
    readme += `\`\`\`\n\n`;
    
    // Stats
    readme += `## 📊 System Metrics\n\n`;
    readme += `<div align="center">\n\n`;
    readme += `![Stats](https://github-readme-stats.vercel.app/api?username=${user.username}&show_icons=true&theme=chartreuse-dark&hide_border=true&bg_color=0D1117)\n\n`;
    readme += `![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=${user.username}&layout=compact&theme=chartreuse-dark&hide_border=true&bg_color=0D1117)\n\n`;
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
    if (user.twitterUsername) readme += `[Twitter]    https://twitter.com/${user.twitterUsername}\n`;
    if (user.blog) readme += `[Website]    ${user.blog}\n`;
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
  
  build(profile: GitHubProfile, templateId: string = 'portfolio'): GeneratedReadme {
    const strategy = this.strategies.get(templateId);
    if (!strategy) {
      throw new Error(`Plantilla no encontrada: ${templateId}`);
    }
    
    return {
      markdown: strategy.generate(profile),
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
