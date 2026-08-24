import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchGitHubProfile, isValidGitHubUsername, saveToken, getStoredToken, clearToken } from '@/lib/infrastructure/github-api';

const user = { login: 'octocat', name: 'Octocat', bio: null, avatar_url: '', location: null, company: null, blog: '', twitter_username: null, followers: 1, following: 2, public_repos: 1, html_url: 'https://github.com/octocat' };
const repos = [{ name: 'hello', description: null, language: 'TypeScript', stargazers_count: 3, forks_count: 1, html_url: 'https://github.com/octocat/hello', fork: false, updated_at: '2026-01-01', topics: [], archived: false, disabled: false, visibility: 'public', size: 1 }];

describe('cliente GitHub', () => {
  beforeEach(() => { vi.restoreAllMocks(); sessionStorage.clear(); });

  it.each(['octocat', 'a', 'name-with-dash'])('acepta el usuario %s', (name) => expect(isValidGitHubUsername(name)).toBe(true));
  it.each(['', '-bad', 'bad-', 'bad name', 'a'.repeat(40)])('rechaza el usuario %s', (name) => expect(isValidGitHubUsername(name)).toBe(false));

  it('transforma respuestas REST y calcula lenguajes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(user))).mockResolvedValueOnce(new Response(JSON.stringify(repos))));
    const profile = await fetchGitHubProfile(' octocat ');
    expect(profile.user.username).toBe('octocat');
    expect(profile.topLanguages[0]).toMatchObject({ language: 'TypeScript', percentage: 100 });
    expect(profile.pinnedRepos[0].name).toBe('hello');
  });

  it('no llama a la red para un usuario inválido', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    await expect(fetchGitHubProfile('-bad')).rejects.toThrow('Formato');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('explica usuario inexistente, token inválido y límite agotado', async () => {
    for (const [status, message, headers] of [[404, 'no encontrado', {}], [401, 'inválido', {}], [403, 'Límite', { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '2000000000' }]] as const) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status, statusText: 'error', headers })));
      await expect(fetchGitHubProfile('octocat')).rejects.toThrow(message);
    }
  });

  it('mantiene el token solo durante la sesión', () => {
    saveToken('secret'); expect(getStoredToken()).toBe('secret'); clearToken(); expect(getStoredToken()).toBeNull();
  });
});
