import type { GitHubProfile } from '@/lib/domain/types';

export const profileFixture: GitHubProfile = {
  user: { username: 'octocat', name: 'The Octocat', bio: 'Open source developer', avatarUrl: 'https://avatars.githubusercontent.com/u/1', location: 'GitHub', company: 'GitHub', blog: 'https://github.blog', twitterUsername: null, followers: 42, following: 3, publicRepos: 2, profileUrl: 'https://github.com/octocat' },
  repositories: [
    { name: 'hello-world', description: 'A first repository', language: 'TypeScript', stars: 10, forks: 2, url: 'https://github.com/octocat/hello-world', isForked: false },
    { name: 'tools', description: 'Useful tools', language: 'JavaScript', stars: 5, forks: 1, url: 'https://github.com/octocat/tools', isForked: false },
  ],
  topLanguages: [{ language: 'TypeScript', percentage: 60, color: '#3178c6' }, { language: 'JavaScript', percentage: 40, color: '#f1e05a' }],
  pinnedRepos: [],
  contributionStats: { totalContributions: 123, currentStreak: 4, longestStreak: 12, contributionsByDay: { '2026-01-01': 2 } },
};
