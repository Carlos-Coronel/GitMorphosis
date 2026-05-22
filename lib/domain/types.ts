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
  updatedAt: string | null;
  topics: string[];
}

export interface LanguageStats {
  language: string;
  percentage: number;
  color: string;
}

export interface ProjectAnalysis {
  repositoryName: string;
  technologies: string[];
  frameworks: string[];
  hasTests: boolean;
  hasCI: boolean;
  hasDocker: boolean;
  hasDocumentation: boolean;
  projectType: ProjectType;
  fileTypes: Record<string, number>;
}

export type ProjectType = 
  | 'web-frontend'
  | 'web-backend'
  | 'fullstack'
  | 'mobile'
  | 'library'
  | 'cli'
  | 'api'
  | 'data-science'
  | 'devops'
  | 'unknown';

export interface GitHubProfile {
  user: GitHubUser;
  repositories: Repository[];
  topLanguages: LanguageStats[];
  pinnedRepos: Repository[];
  projectAnalyses: ProjectAnalysis[];
  contributionStats: ContributionStats;
}

export interface ContributionStats {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  contributionsByDay: Record<string, number>;
}

export interface ReadmeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export interface GeneratedReadme {
  markdown: string;
  templateId: string;
  generatedAt: Date;
  profile: GitHubProfile;
}

// Tipos de error para mejor manejo de errores
export class ScrapingError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly url?: string
  ) {
    super(message);
    this.name = 'ScrapingError';
  }
}

export class GitAnalysisError extends Error {
  constructor(
    message: string,
    public readonly repository?: string
  ) {
    super(message);
    this.name = 'GitAnalysisError';
  }
}

export class ProfileNotFoundError extends Error {
  constructor(username: string) {
    super(`Perfil de GitHub no encontrado: ${username}`);
    this.name = 'ProfileNotFoundError';
  }
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

// Patrones de detección de tecnologías
export const TECH_PATTERNS: Record<string, string[]> = {
  React: ['package.json:react', 'jsx', 'tsx'],
  Vue: ['package.json:vue', '.vue'],
  Angular: ['package.json:@angular', 'angular.json'],
  Svelte: ['package.json:svelte', '.svelte'],
  'Next.js': ['package.json:next', 'next.config'],
  'Nuxt.js': ['package.json:nuxt', 'nuxt.config'],
  Express: ['package.json:express'],
  Fastify: ['package.json:fastify'],
  NestJS: ['package.json:@nestjs'],
  Django: ['requirements.txt:django', 'manage.py'],
  Flask: ['requirements.txt:flask'],
  FastAPI: ['requirements.txt:fastapi'],
  'Spring Boot': ['pom.xml:spring-boot', 'build.gradle:spring-boot'],
  Rails: ['Gemfile:rails'],
  Laravel: ['composer.json:laravel'],
  Docker: ['Dockerfile', 'docker-compose'],
  Kubernetes: ['k8s/', '.yaml:kind:'],
  Terraform: ['.tf'],
  'GitHub Actions': ['.github/workflows'],
  Jest: ['package.json:jest'],
  Pytest: ['pytest.ini', 'requirements.txt:pytest'],
  PostgreSQL: ['package.json:pg', 'requirements.txt:psycopg'],
  MongoDB: ['package.json:mongoose', 'package.json:mongodb'],
  Redis: ['package.json:redis', 'requirements.txt:redis'],
  GraphQL: ['package.json:graphql', '.graphql'],
  Prisma: ['prisma/schema.prisma'],
  Tailwind: ['tailwind.config'],
};
