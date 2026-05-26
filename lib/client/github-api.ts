/**
 * lib/client/github-api.ts
 *
 * Client-side GitHub REST API client.
 * Runs entirely in the browser — no server, no API key required.
 * Public endpoints have CORS enabled by GitHub.
 *
 * Rate limits (unauthenticated): 60 requests / hour / IP
 * Rate limits (with token):     5,000 requests / hour
 */

import {
  GitHubUser,
  Repository,
  LanguageStats,
  ContributionStats,
  GitHubProfile,
  LANGUAGE_COLORS,
} from '@/lib/domain/types';

const GH_API = 'https://api.github.com';

// ── Raw GitHub API shapes ────────────────────────────────────────────────────

interface GHUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
}

interface GHRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  fork: boolean;
  updated_at: string;
  topics: string[];
  archived: boolean;
  disabled: boolean;
  visibility: string;
  size: number;
}

// ── Fetch helper ─────────────────────────────────────────────────────────────

async function ghFetch<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${GH_API}${path}`, { headers });

  if (res.status === 404) {
    throw new Error(`Perfil de GitHub no encontrado`);
  }

  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('X-RateLimit-Reset');
    const resetTime = reset
      ? new Date(parseInt(reset) * 1000).toLocaleTimeString()
      : 'unos minutos';
    throw new Error(
      `Límite de la API de GitHub alcanzado. Vuelve a intentarlo a las ${resetTime}.`
    );
  }

  if (!res.ok) {
    throw new Error(`Error de GitHub API: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ── Language aggregation ─────────────────────────────────────────────────────

function aggregateLanguages(repos: GHRepo[]): LanguageStats[] {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const repo of repos) {
    if (repo.language && !repo.fork && !repo.archived) {
      counts[repo.language] = (counts[repo.language] ?? 0) + 1;
      total++;
    }
  }

  if (total === 0) return [];

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([language, count]) => ({
      language,
      percentage: Math.round((count / total) * 1000) / 10,
      color: LANGUAGE_COLORS[language] ?? '#8b949e',
    }));
}

// ── Main public function ─────────────────────────────────────────────────────

/**
 * Fetches a complete GitHub profile using only public REST API endpoints.
 * Works from the browser without any backend.
 *
 * @param username - GitHub username
 * @param token    - Optional personal access token to increase rate limits
 */
export async function fetchGitHubProfile(
  username: string,
  token?: string
): Promise<GitHubProfile> {
  const cleanUsername = username.trim();

  // Parallel fetch: user profile + repos
  const [ghUser, ghRepos] = await Promise.all([
    ghFetch<GHUser>(`/users/${cleanUsername}`, token),
    ghFetch<GHRepo[]>(
      `/users/${cleanUsername}/repos?per_page=100&sort=stars&type=public`,
      token
    ),
  ]);

  // ── Map to domain GitHubUser ──────────────────────────────────────────────
  const user: GitHubUser = {
    username: ghUser.login,
    name: ghUser.name,
    bio: ghUser.bio,
    avatarUrl: ghUser.avatar_url,
    location: ghUser.location,
    company: ghUser.company ? ghUser.company.replace(/^@/, '') : null,
    blog: ghUser.blog || null,
    twitterUsername: ghUser.twitter_username,
    followers: ghUser.followers,
    following: ghUser.following,
    publicRepos: ghUser.public_repos,
    profileUrl: ghUser.html_url,
  };

  // ── Map to domain Repositories ────────────────────────────────────────────
  const repositories: Repository[] = ghRepos
    .filter((r) => !r.archived && !r.disabled)
    .map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      url: r.html_url,
      isForked: r.fork,
      updatedAt: r.updated_at,
      topics: r.topics ?? [],
    }));

  // ── Language stats ────────────────────────────────────────────────────────
  const topLanguages = aggregateLanguages(ghRepos);

  // ── Pinned repos: use top-starred non-fork repos (REST API has no pinned) ─
  const pinnedRepos = repositories
    .filter((r) => !r.isForked)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 6);

  // ── Contribution stats: approximated (requires GraphQL + token for real data)
  const contributionStats: ContributionStats = {
    totalContributions: 0,
    currentStreak: 0,
    longestStreak: 0,
    contributionsByDay: {},
  };

  return {
    user,
    repositories,
    topLanguages,
    pinnedRepos,
    projectAnalyses: [],
    contributionStats,
  };
}

/** Returns remaining API requests and reset time from the rate limit endpoint */
export async function checkRateLimit(token?: string): Promise<{
  remaining: number;
  limit: number;
  resetAt: Date;
}> {
  const data = await ghFetch<{
    rate: { remaining: number; limit: number; reset: number };
  }>('/rate_limit', token);

  return {
    remaining: data.rate.remaining,
    limit: data.rate.limit,
    resetAt: new Date(data.rate.reset * 1000),
  };
}
