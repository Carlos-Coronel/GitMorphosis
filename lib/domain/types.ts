// Tipos de Dominio - Generador de Perfil GitHub
// Siguiendo principios de Arquitectura Limpia

export interface GitHubUser {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitterUsername: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  profileUrl: string;
  socialLinks?: {
    platform: string;
    url: string;
    username: string;
  }[];
}

export interface Repository {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  isForked: boolean;
}

export interface LanguageStats {
  language: string;
  percentage: number;
  color: string;
}

export interface GitHubProfile {
  user: GitHubUser;
  repositories: Repository[];
  topLanguages: LanguageStats[];
  pinnedRepos: Repository[];
  contributionStats: ContributionStats;
}

export interface ContributionStats {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  contributionsByDay: Record<string, number>;
}

export interface Template {
  id: string;
  name: string;
  description: string;
}

export interface GeneratedReadme {
  markdown: string;
  templateId: string;
  generatedAt: Date;
  profile: GitHubProfile;
  assets: GeneratedAsset[];
}

export interface GeneratedAsset {
  path: `assets/${string}`;
  content: string;
  mimeType: 'image/svg+xml' | 'text/plain';
}

// Mapeo de colores para insignias por lenguaje
export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  R: '#198CE7',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
  Haskell: '#5e5086',
  Lua: '#000080',
  Perl: '#0298c3',
  Julia: '#a270ba',
  OCaml: '#3be133',
  Zig: '#ec915c',
};

export interface SocialLink {
  platform: string;
  url: string;
  username: string;
  color: string;
  enabled: boolean;
}

export interface GeneratorConfig {
  includeSnake: boolean;
  socialLinks: SocialLink[];
}
