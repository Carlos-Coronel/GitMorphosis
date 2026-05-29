// Profile Service - Application Layer
// Thin orchestration layer over the GitHub REST/GraphQL API client.
// The HTML scraper has been removed — all data comes from the official GitHub API.

import {
  GitHubProfile,
} from '@/lib/domain/types';
import { fetchGitHubProfile } from '@/lib/infrastructure/github-api';
import { ReadmeBuilder, createReadmeBuilder } from './readme-builder';

export interface IProfileService {
  getProfile(username: string, token?: string | null): Promise<GitHubProfile>;
  generateReadme(username: string, templateId?: string, token?: string | null): Promise<string>;
  getAvailableTemplates(): { id: string; name: string; description: string }[];
}

export class ProfileService implements IProfileService {
  private readmeBuilder: ReadmeBuilder;

  constructor(readmeBuilder?: ReadmeBuilder) {
    this.readmeBuilder = readmeBuilder || createReadmeBuilder();
  }

  async getProfile(username: string, token?: string | null): Promise<GitHubProfile> {
    // Validate username format
    const cleanUsername = username.trim();
    if (!cleanUsername || !/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(cleanUsername)) {
      throw new Error('Formato de nombre de usuario de GitHub inválido');
    }

    return fetchGitHubProfile(cleanUsername, token);
  }

  async generateReadme(
    username: string,
    templateId: string = 'portfolio',
    token?: string | null
  ): Promise<string> {
    const profile = await this.getProfile(username, token);
    const result = this.readmeBuilder.build(profile, templateId);
    return result.markdown;
  }

  getAvailableTemplates() {
    return this.readmeBuilder.getAvailableTemplates().map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
    }));
  }
}

// Factory function (Dependency Injection ready)
export function createProfileService(readmeBuilder?: ReadmeBuilder): IProfileService {
  return new ProfileService(readmeBuilder);
}
