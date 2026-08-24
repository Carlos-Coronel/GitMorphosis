import type { GeneratedReadme, GitHubProfile, Template } from '@/lib/domain/types';
import { createLocalAssets } from './local-assets';

export interface ReadmeOptions { includeSnake?: boolean; }

function text(value: unknown): string {
  return String(value ?? '').replace(/[<>]/g, '').trim();
}

function attribute(value: unknown): string {
  return text(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function safeUrl(value: string): string {
  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.toString() : '#';
  } catch {
    return '#';
  }
}

function adaptive(name: string, alt: string, responsive = true): string {
  const mobile = responsive
    ? `  <source media="(max-width: 480px) and (prefers-color-scheme: dark)" srcset="assets/${name}-mobile-dark.svg">\n  <source media="(max-width: 480px) and (prefers-color-scheme: light)" srcset="assets/${name}-mobile-light.svg">\n`
    : '';
  return `<picture>\n${mobile}  <source media="(prefers-color-scheme: dark)" srcset="assets/${name}-dark.svg">\n  <source media="(prefers-color-scheme: light)" srcset="assets/${name}-light.svg">\n  <img alt="${attribute(alt)}" src="assets/${name}-dark.svg">\n</picture>`;
}

function centered(content: string): string {
  return `<div align="center">\n\n${content}\n\n</div>`;
}

function links(profile: GitHubProfile): string {
  const { user } = profile;
  const entries = [{ label: 'GitHub', url: safeUrl(user.profileUrl) }];
  if (user.socialLinks?.length) entries.push(...user.socialLinks.map((link) => ({ label: text(link.platform), url: safeUrl(link.url) })));
  else {
    if (user.twitterUsername) entries.push({ label: 'Twitter', url: safeUrl(`https://twitter.com/${user.twitterUsername}`) });
    if (user.blog) entries.push({ label: 'Website', url: safeUrl(user.blog) });
  }
  return entries.map(({ label, url }) => `[${label}](${url})`).join(' · ');
}

function projects(profile: GitHubProfile, cards = false): string {
  const repos = (profile.pinnedRepos.length ? profile.pinnedRepos : profile.repositories.filter((repo) => !repo.isForked)).slice(0, 4);
  if (!repos.length) return '';
  if (cards) return repos.map((repo, index) => `<a href="${attribute(safeUrl(repo.url))}">\n${adaptive(`project-${index + 1}`, repo.name)}\n</a>`).join('\n\n');
  return repos.map((repo) => `### [${text(repo.name)}](${safeUrl(repo.url)})\n${text(repo.description || 'Proyecto destacado')}\n\n⭐ ${repo.stars} · 🍴 ${repo.forks}${repo.language ? ` · ${text(repo.language)}` : ''}`).join('\n\n');
}

function about(profile: GitHubProfile): string {
  const { user } = profile;
  const details = [
    user.location ? `📍 ${text(user.location)}  ` : '',
    user.company ? `💼 ${text(user.company)}  ` : '',
    user.blog ? `🌐 [Website](${safeUrl(user.blog)})  ` : '',
  ].filter(Boolean);
  return details.length ? `## About me\n\n${details.join('\n')}\n\n` : '';
}

function contributionCards(profile: GitHubProfile, includeActivity = false): string {
  if (!Object.keys(profile.contributionStats.contributionsByDay).length) return '';
  const cards = [adaptive('streak', 'Contribution streak')];
  if (includeActivity) cards.push(adaptive('contributions', 'Contribution activity'));
  return `${cards.join('\n\n')}\n\n`;
}

function snake(options?: ReadmeOptions): string { return options?.includeSnake ? `\n\n## Contribution Snake\n\n${adaptive('snake', 'Contribution snake', false)}` : ''; }

export interface IReadmeStrategy {
  id: string;
  name: string;
  description: string;
  generate(profile: GitHubProfile, options?: ReadmeOptions): string;
}

class MinimalistStrategy implements IReadmeStrategy {
  id = 'minimalist'; name = 'Minimalista'; description = 'Perfil limpio y simple con información esencial';
  generate(profile: GitHubProfile, options?: ReadmeOptions): string {
    const { user } = profile;
    return `# Hi, I'm ${text(user.name || user.username)} 👋\n\n${user.bio ? `> ${text(user.bio)}\n\n` : ''}${about(profile)}## GitHub stats\n\n${adaptive('stats', 'GitHub stats')}\n\n## Top languages\n\n${adaptive('languages', 'Top languages')}\n\n## Featured projects\n\n${projects(profile)}${snake(options)}\n\n---\n\n${links(profile)}\n`;
  }
}

class PortfolioStrategy implements IReadmeStrategy {
  id = 'portfolio'; name = 'Portafolio Desarrollador'; description = 'Portafolio profesional con habilidades y proyectos destacados';
  generate(profile: GitHubProfile, options?: ReadmeOptions): string {
    const { user } = profile;
    const analytics = [adaptive('stats', 'GitHub stats'), adaptive('languages', 'Top languages'), contributionCards(profile, true).trim()].filter(Boolean).join('\n\n');
    return `<div align="center">\n\n# ${text(user.name || user.username)}\n\n${user.bio ? `### ${text(user.bio)}\n\n` : ''}${adaptive('stack', 'Technology stack')}\n\n</div>\n\n## 🛠️ Tech stack\n\n${profile.topLanguages.map((language) => `- ${text(language.language)} — ${language.percentage}%`).join('\n')}\n\n## 📊 GitHub analytics\n\n${centered(analytics)}\n\n## 🚀 Featured projects\n\n${projects(profile, true)}${snake(options)}\n\n## 🤝 Let's connect\n\n${links(profile)}\n`;
  }
}

class CreativeStrategy implements IReadmeStrategy {
  id = 'creative'; name = 'Creativa'; description = 'Diseño visual con recursos SVG locales';
  generate(profile: GitHubProfile, options?: ReadmeOptions): string {
    const { user } = profile;
    const location = user.location ? `  location: ${JSON.stringify(user.location)},\n` : '';
    return `<div align="center">\n\n${adaptive('header', user.name || user.username)}\n\n${adaptive('stack', 'Technology stack')}\n\n</div>\n\n## 💫 About me\n\n\`\`\`javascript\nconst developer = {\n  name: ${JSON.stringify(user.name || user.username)},\n${location}  languages: ${JSON.stringify(profile.topLanguages.slice(0, 5).map((item) => item.language))},\n  followers: ${user.followers},\n  publicRepos: ${user.publicRepos}\n};\n\`\`\`\n\n## 🏆 GitHub trophies\n\n${centered(adaptive('trophies', 'GitHub trophies'))}\n\n## 📊 GitHub stats\n\n${centered(`${adaptive('stats', 'GitHub stats')}\n\n${contributionCards(profile).trim()}`.trim())}\n\n## 🌟 Featured repositories\n\n${projects(profile, true)}${snake(options)}\n\n## 🌐 Connect\n\n${links(profile)}\n\n${centered(adaptive('footer', 'Footer'))}\n`;
  }
}

class TerminalStrategy implements IReadmeStrategy {
  id = 'terminal'; name = 'Terminal'; description = 'Estética de terminal con fuentes monoespaciadas';
  generate(profile: GitHubProfile, options?: ReadmeOptions): string {
    const { user } = profile;
    const skills = profile.topLanguages.slice(0, 8).map((language) => `${language.language.padEnd(15)} ${'█'.repeat(Math.min(10, Math.ceil(language.percentage / 10))).padEnd(10, '░')} ${language.percentage}%`).join('\n');
    return `\`\`\`text\n$ whoami\n${text(user.name || user.username)}\n\n$ cat profile.txt\n${text(user.bio || 'Developer')}\n${user.location ? `Location: ${text(user.location)}\n` : ''}Public repos: ${user.publicRepos}\nFollowers: ${user.followers}\n\n$ ls skills/\n${skills}\n\`\`\`\n\n## System metrics\n\n${adaptive('stats', 'GitHub stats')}\n\n${adaptive('languages', 'Top languages')}\n\n## Repositories\n\n${projects(profile)}${snake(options)}\n\n\`\`\`text\n$ echo "Thanks for visiting!"\n\`\`\`\n\n## Links\n\n${links(profile)}\n`;
  }
}

export class ReadmeBuilder {
  private strategies = new Map<string, IReadmeStrategy>();
  constructor() { [new MinimalistStrategy(), new PortfolioStrategy(), new CreativeStrategy(), new TerminalStrategy()].forEach((strategy) => this.registerStrategy(strategy)); }
  registerStrategy(strategy: IReadmeStrategy): void { this.strategies.set(strategy.id, strategy); }
  getAvailableTemplates(): Template[] { return [...this.strategies.values()].map(({ id, name, description }) => ({ id, name, description })); }
  build(profile: GitHubProfile, templateId = 'portfolio', options?: ReadmeOptions): GeneratedReadme {
    const strategy = this.strategies.get(templateId);
    if (!strategy) throw new Error(`Plantilla no encontrada: ${templateId}`);
    const markdown = strategy.generate(profile, options);
    const assets = createLocalAssets(profile, markdown, options?.includeSnake);
    return { markdown, templateId, generatedAt: new Date(), profile, assets };
  }
}

export function createReadmeBuilder(): ReadmeBuilder { return new ReadmeBuilder(); }
