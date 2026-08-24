import { expect, test } from '@playwright/test';

const githubUser = { login: 'octocat', name: 'The Octocat', bio: 'Open source developer', avatar_url: 'https://avatars.githubusercontent.com/u/1', location: 'GitHub', company: 'GitHub', blog: 'https://github.blog', twitter_username: null, followers: 42, following: 3, public_repos: 1, html_url: 'https://github.com/octocat' };
const githubRepos = [{ name: 'hello-world', description: 'First repository', language: 'TypeScript', stargazers_count: 10, forks_count: 2, html_url: 'https://github.com/octocat/hello-world', fork: false, updated_at: '2026-01-01T00:00:00Z', topics: ['demo'], archived: false, disabled: false, visibility: 'public', size: 10 }];

test.beforeEach(async ({ page }) => {
  await page.route('https://api.github.com/**', async (route) => {
    const url = route.request().url();
    if (url.endsWith('/rate_limit')) return route.fulfill({ json: { rate: { remaining: 59, limit: 60, reset: 2_000_000_000, used: 1 } } });
    if (url.includes('/repos?')) return route.fulfill({ json: githubRepos });
    if (url.endsWith('/users/octocat')) return route.fulfill({ json: githubUser });
    return route.fulfill({ status: 404, json: {} });
  });
});

test('genera y descarga un paquete autocontenido sin errores de consola', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByLabel('Nombre de usuario de GitHub').fill('octocat');
  await page.getByRole('button', { name: 'Generar' }).click();
  await expect(page.getByText('Acciones')).toBeVisible();
  await expect(page.getByText(/SVG locales/)).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar ZIP completo' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('octocat-readme.zip');
  expect(errors).toEqual([]);
});

test('mantiene el flujo usable en viewport móvil', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel('Nombre de usuario de GitHub').fill('octocat');
  await page.getByRole('button', { name: 'Generar' }).click();
  await expect(page.getByRole('button', { name: 'Descargar ZIP completo' })).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
});
