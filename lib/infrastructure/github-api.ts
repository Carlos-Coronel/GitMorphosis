/**
 * lib/client/github-api.ts
 *
 * Client-side GitHub REST + GraphQL API client.
 * Runs entirely in the browser — no server required.
 * Public REST endpoints have CORS enabled by GitHub.
 *
 * Rate limits (unauthenticated): 60 requests / hour / IP
 * Rate limits (with PAT token): 5,000 requests / hour
 *
 * GraphQL pinned repos: requires a PAT token (any read:user scope)
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
const GH_GRAPHQL = 'https://api.github.com/graphql';

// ── Token management (session-only, never persisted to server) ───────────────

const TOKEN_SESSION_KEY = 'gitmorphosis_pat';

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem(TOKEN_SESSION_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_SESSION_KEY);
    }
  }
}

export function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(TOKEN_SESSION_KEY) || null;
  }
  return null;
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
  }
}

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

interface GHRateLimit {
  rate: {
    remaining: number;
    limit: number;
    reset: number;
    used: number;
  };
}

// ── GraphQL response shapes ──────────────────────────────────────────────────

interface GQLPinnedRepo {
  name: string;
  description: string | null;
  primaryLanguage: { name: string; color: string } | null;
  stargazerCount: number;
  forkCount: number;
  url: string;
  isFork: boolean;
  updatedAt: string;
  repositoryTopics: {
    nodes: { topic: { name: string } }[];
  };
}

interface GQLPinnedReposResponse {
  data?: {
    user?: {
      pinnedItems?: {
        nodes: GQLPinnedRepo[];
      };
    };
  };
  errors?: { message: string }[];
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function ghFetch<T>(path: string, token?: string | null): Promise<T> {
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

  if (res.status === 401) {
    throw new Error(
      `Token de GitHub inválido o expirado. Verifica tu PAT en las Opciones Avanzadas.`
    );
  }

  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get('X-RateLimit-Remaining');
    const reset = res.headers.get('X-RateLimit-Reset');
    const resetTime = reset
      ? new Date(parseInt(reset) * 1000).toLocaleTimeString('es', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'unos minutos';

    if (remaining === '0') {
      throw new Error(
        `Límite de la API de GitHub alcanzado. Se reinicia a las ${resetTime}. ` +
          `Agrega un token PAT en las Opciones Avanzadas para obtener 5,000 requests/hora.`
      );
    }
    throw new Error(`Error de acceso a GitHub API: ${res.status} ${res.statusText}`);
  }

  if (!res.ok) {
    throw new Error(`Error de GitHub API: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

async function ghGraphQL(query: string, variables: Record<string, unknown>, token: string): Promise<GQLPinnedReposResponse> {
  const res = await fetch(GH_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status}`);
  }

  return res.json() as Promise<GQLPinnedReposResponse>;
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

// ── GraphQL: real pinned repositories ───────────────────────────────────────

const PINNED_REPOS_QUERY = `
  query GetPinnedRepos($username: String!) {
    user(login: $username) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            primaryLanguage {
              name
              color
            }
            stargazerCount
            forkCount
            url
            isFork
            updatedAt
            repositoryTopics(first: 10) {
              nodes {
                topic {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchPinnedRepos(username: string, token: string): Promise<Repository[]> {
  try {
    const response = await ghGraphQL(PINNED_REPOS_QUERY, { username }, token);

    if (response.errors?.length) {
      // GraphQL errors are non-fatal — fall back to top starred repos
      return [];
    }

    const nodes = response.data?.user?.pinnedItems?.nodes ?? [];
    return nodes.map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.primaryLanguage?.name ?? null,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      url: repo.url,
      isForked: repo.isFork,
      updatedAt: repo.updatedAt,
      topics: repo.repositoryTopics.nodes.map((n) => n.topic.name),
    }));
  } catch {
    // GraphQL is best-effort; REST fallback handles this
    return [];
  }
}

// ── Main public function ─────────────────────────────────────────────────────

/**
 * Fetches a complete GitHub profile using public REST API endpoints.
 * Optionally uses GraphQL for real pinned repos (requires PAT token).
 *
 * @param username - GitHub username
 * @param token    - Optional personal access token (PAT) to increase rate limits and get pinned repos
 */
export async function fetchGitHubProfile(
  username: string,
  token?: string | null
): Promise<GitHubProfile> {
  const cleanUsername = username.trim();
  const effectiveToken = token ?? getStoredToken();

  // Parallel fetch: user profile + repos
  const [ghUser, ghRepos] = await Promise.all([
    ghFetch<GHUser>(`/users/${cleanUsername}`, effectiveToken),
    ghFetch<GHRepo[]>(
      `/users/${cleanUsername}/repos?per_page=100&sort=stars&type=public`,
      effectiveToken
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

  // ── Pinned repos: try GraphQL first (requires token), fall back to top starred ─
  let pinnedRepos: Repository[] = [];
  if (effectiveToken) {
    pinnedRepos = await fetchPinnedRepos(cleanUsername, effectiveToken);
  }

  // Fallback: top-starred non-fork repos if no pinned data
  if (pinnedRepos.length === 0) {
    pinnedRepos = repositories
      .filter((r) => !r.isForked)
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 6);
  }

  // ── Contribution stats: approximated (requires GraphQL + token for real data) ─
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

// ── Rate limit check ─────────────────────────────────────────────────────────

/** Returns remaining API requests and reset time from the rate limit endpoint */
export async function checkRateLimit(token?: string | null): Promise<{
  remaining: number;
  limit: number;
  resetAt: Date;
  used: number;
  isAuthenticated: boolean;
}> {
  const effectiveToken = token ?? getStoredToken();
  const data = await ghFetch<GHRateLimit>('/rate_limit', effectiveToken);

  return {
    remaining: data.rate.remaining,
    limit: data.rate.limit,
    resetAt: new Date(data.rate.reset * 1000),
    used: data.rate.used,
    isAuthenticated: !!effectiveToken,
  };
}

/** Validates a PAT token by checking the rate limit endpoint */
export async function validateToken(token: string): Promise<{
  valid: boolean;
  remaining: number;
  limit: number;
  login?: string;
}> {
  try {
    const [rateData, userData] = await Promise.all([
      ghFetch<GHRateLimit>('/rate_limit', token),
      ghFetch<{ login: string }>('/user', token),
    ]);
    return {
      valid: true,
      remaining: rateData.rate.remaining,
      limit: rateData.rate.limit,
      login: userData.login,
    };
  } catch {
    return { valid: false, remaining: 0, limit: 0 };
  }
}
