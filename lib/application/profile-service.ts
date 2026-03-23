// Profile Service - Application Layer
// Implements Service Layer Pattern for orchestrating profile generation

import {
  GitHubProfile,
  GitHubUser,
  Repository,
  LanguageStats,
  ProjectAnalysis,
  ContributionStats,
  ProfileNotFoundError,
  ScrapingError,
} from '@/lib/domain/types';
import { IGitHubScraper, createGitHubScraper } from '@/lib/infrastructure/scraping/github-scraper';
import { ReadmeBuilder, createReadmeBuilder } from './readme-builder';

export interface IProfileService {
  getProfile(username: string): Promise<GitHubProfile>;
  generateReadme(username: string, templateId?: string): Promise<string>;
  getAvailableTemplates(): { id: string; name: string; description: string }[];
}

export class ProfileService implements IProfileService {
  private scraper: IGitHubScraper;
  private readmeBuilder: ReadmeBuilder;
  
  constructor(
    scraper?: IGitHubScraper,
    readmeBuilder?: ReadmeBuilder
  ) {
    this.scraper = scraper || createGitHubScraper();
    this.readmeBuilder = readmeBuilder || createReadmeBuilder();
  }
  
  async getProfile(username: string): Promise<GitHubProfile> {
    // Validate username
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(cleanUsername)) {
      throw new Error('Invalid GitHub username format');
    }
    
    try {
      // Fetch all data in parallel for better performance
      const [user, repositories, topLanguages, pinnedRepos, contributionStats] = await Promise.all([
        this.scraper.scrapeUserProfile(cleanUsername),
        this.scraper.scrapeRepositories(cleanUsername, 30),
        this.scraper.scrapeLanguageStats(cleanUsername),
        this.scraper.scrapePinnedRepos(cleanUsername),
        this.scraper.scrapeContributions(cleanUsername),
      ]);
      
      // Analyze top repositories
      const projectAnalyses = this.analyzeRepositories(repositories.slice(0, 10));
      
      return {
        user,
        repositories,
        topLanguages,
        pinnedRepos: pinnedRepos.length > 0 ? pinnedRepos : repositories.slice(0, 6),
        projectAnalyses,
        contributionStats,
      };
    } catch (error) {
      if (error instanceof ProfileNotFoundError) {
        throw error;
      }
      if (error instanceof ScrapingError) {
        throw new Error(`Failed to fetch GitHub profile: ${error.message}`);
      }
      throw new Error(`Unexpected error fetching profile: ${error}`);
    }
  }
  
  async generateReadme(username: string, templateId: string = 'portfolio'): Promise<string> {
    const profile = await this.getProfile(username);
    const result = this.readmeBuilder.build(profile, templateId);
    return result.markdown;
  }
  
  getAvailableTemplates() {
    return this.readmeBuilder.getAvailableTemplates().map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
    }));
  }
  
  private analyzeRepositories(repositories: Repository[]): ProjectAnalysis[] {
    return repositories.map(repo => this.analyzeRepository(repo));
  }
  
  private analyzeRepository(repo: Repository): ProjectAnalysis {
    // Basic analysis based on available data
    const technologies: string[] = [];
    const frameworks: string[] = [];
    
    // Detect from language
    if (repo.language) {
      technologies.push(repo.language);
    }
    
    // Detect from topics
    const topicMapping: Record<string, { tech?: string; framework?: string }> = {
      'react': { framework: 'React' },
      'vue': { framework: 'Vue.js' },
      'angular': { framework: 'Angular' },
      'nextjs': { framework: 'Next.js' },
      'nodejs': { tech: 'Node.js' },
      'python': { tech: 'Python' },
      'django': { framework: 'Django' },
      'flask': { framework: 'Flask' },
      'typescript': { tech: 'TypeScript' },
      'docker': { tech: 'Docker' },
      'kubernetes': { tech: 'Kubernetes' },
      'graphql': { tech: 'GraphQL' },
      'mongodb': { tech: 'MongoDB' },
      'postgresql': { tech: 'PostgreSQL' },
      'redis': { tech: 'Redis' },
      'aws': { tech: 'AWS' },
      'tailwindcss': { tech: 'Tailwind CSS' },
    };
    
    for (const topic of repo.topics) {
      const mapping = topicMapping[topic.toLowerCase()];
      if (mapping) {
        if (mapping.tech && !technologies.includes(mapping.tech)) {
          technologies.push(mapping.tech);
        }
        if (mapping.framework && !frameworks.includes(mapping.framework)) {
          frameworks.push(mapping.framework);
        }
      }
    }
    
    // Determine project type
    let projectType: ProjectAnalysis['projectType'] = 'unknown';
    
    if (repo.topics.some(t => ['frontend', 'react', 'vue', 'angular', 'ui'].includes(t.toLowerCase()))) {
      projectType = 'web-frontend';
    } else if (repo.topics.some(t => ['backend', 'api', 'server'].includes(t.toLowerCase()))) {
      projectType = 'web-backend';
    } else if (repo.topics.some(t => ['fullstack', 'webapp'].includes(t.toLowerCase()))) {
      projectType = 'fullstack';
    } else if (repo.topics.some(t => ['mobile', 'ios', 'android', 'react-native', 'flutter'].includes(t.toLowerCase()))) {
      projectType = 'mobile';
    } else if (repo.topics.some(t => ['library', 'package', 'npm'].includes(t.toLowerCase()))) {
      projectType = 'library';
    } else if (repo.topics.some(t => ['cli', 'command-line'].includes(t.toLowerCase()))) {
      projectType = 'cli';
    } else if (repo.topics.some(t => ['ml', 'machine-learning', 'data-science', 'ai'].includes(t.toLowerCase()))) {
      projectType = 'data-science';
    } else if (repo.topics.some(t => ['devops', 'infrastructure', 'terraform', 'ansible'].includes(t.toLowerCase()))) {
      projectType = 'devops';
    } else if (repo.language === 'TypeScript' || repo.language === 'JavaScript') {
      projectType = 'web-frontend';
    } else if (repo.language === 'Python') {
      projectType = 'web-backend';
    }
    
    return {
      repositoryName: repo.name,
      technologies,
      frameworks,
      hasTests: repo.topics.some(t => ['testing', 'jest', 'pytest', 'test'].includes(t.toLowerCase())),
      hasCI: repo.topics.some(t => ['ci', 'github-actions', 'ci-cd'].includes(t.toLowerCase())),
      hasDocker: repo.topics.includes('docker'),
      hasDocumentation: false, // Would need repo content analysis
      projectType,
      fileTypes: {},
    };
  }
}

// Factory function (Dependency Injection ready)
export function createProfileService(
  scraper?: IGitHubScraper,
  readmeBuilder?: ReadmeBuilder
): IProfileService {
  return new ProfileService(scraper, readmeBuilder);
}
