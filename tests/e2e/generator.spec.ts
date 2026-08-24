import { expect, test } from '@playwright/test';

const githubUser = { login: 'octocat', name: 'The Octocat', bio: 'Open source developer', avatar_url: 'https://avatars.githubusercontent.com/u/1', location: 'GitHub', company: 'GitHub', blog: 'https://github.blog', twitter_username: null, followers: 42, following: 3, public_repos: 1, html_url: 'https://github.com/octocat' };
const githubRepos = [{ name: 'hello-world', description: 'First repository', language: 'TypeScript', stargazers_count: 10, forks_count: 2, html_url: 'https://github.com/octocat/hello-world', fork: false, updated_at: '2026-01-01T00:00:00Z', topics: ['demo'], archived: false, disabled: false, visibility: 'public', size: 10 }];

test.beforeEach(async ({ page }) => {
  await page.route('https://api.github.com/**', async (route) => {
    const url = route.request().url();
    if (url.endsWith('/rate_limit')) return route.fulfill({ json: { rate: { remaining: 59, limit: 60, reset: 2_000_000_000, used: 1 } } });
    if (url.endsWith('/users/network-error')) return route.abort('failed');
    if (url.endsWith('/users/missing')) return route.fulfill({ status: 404, json: {} });
    if (url.endsWith('/user')) return route.fulfill({ status: 401, json: {} });
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
  await expect(page.getByText(/^Incluye README\.md, \d+ SVG locales/)).toBeVisible();
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

test('recorre guía, personalización, plantillas y vista previa', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');

  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByRole('heading', { name: 'Elige el diseño' })).toBeVisible();
  await page.getByRole('button', { name: /Guía interactiva para crear tu perfil/ }).click();
  await expect(page.getByRole('heading', { name: 'Elige el diseño' })).toBeHidden();

  await page.getByRole('button', { name: 'Seleccionar plantilla Creativa' }).click();
  await expect(page.getByRole('button', { name: 'Seleccionar plantilla Creativa' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Opciones Avanzadas' }).click();
  await page.getByRole('button', { name: 'Mostrar 6 más' }).click();
  await page.getByRole('switch', { name: 'Activar LinkedIn' }).click();
  await page.getByRole('textbox', { name: 'Usuario o dirección de LinkedIn' }).fill('in/octocat');
  await page.getByRole('switch', { name: '🐍 Incluir Contribution Snake' }).click();

  await page.getByLabel('Nombre de usuario de GitHub').fill('octocat');
  await page.getByRole('button', { name: 'Generar' }).click();
  await expect(page.getByText(/^Incluye README\.md, \d+ SVG locales/)).toBeVisible();
  await page.getByRole('button', { name: /Guía interactiva para crear tu perfil/ }).click();
  await expect(page.getByText('octocat/octocat')).toBeVisible();

  await page.getByRole('tab', { name: 'Markdown' }).click();
  await expect(page.getByText('const developer = {')).toBeVisible();
  await page.getByTitle('Vista previa en modo claro').click();
  await page.getByRole('button', { name: 'Pantalla Completa' }).click();
  await expect(page.getByRole('heading', { name: 'Vista Previa README' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Vista Previa README' })).toBeHidden();

  await page.getByRole('button', { name: 'Copiar Markdown' }).click();
  await expect(page.getByRole('button', { name: '¡Copiado!' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('octocat');

  await page.getByRole('button', { name: 'Seleccionar plantilla Terminal' }).click();
  await expect(page.locator('[data-slot="tabs-content"][data-state="active"] code')).toContainText('$ whoami');
});

test('explica validación, usuario inexistente, red y token inválido', async ({ page }) => {
  await page.goto('./');

  await page.getByLabel('Nombre de usuario de GitHub').fill('-usuario');
  await page.getByRole('button', { name: 'Generar' }).click();
  await expect(page.getByText('Formato de nombre de usuario inválido')).toBeVisible();

  await page.getByLabel('Nombre de usuario de GitHub').fill('missing');
  await page.getByRole('button', { name: 'Generar' }).click();
  await expect(page.getByText('Perfil de GitHub no encontrado')).toBeVisible();

  await page.getByLabel('Nombre de usuario de GitHub').fill('network-error');
  await page.getByRole('button', { name: 'Generar' }).click();
  await expect(page.getByText(/No se pudo conectar con GitHub/)).toBeVisible();

  await page.getByRole('button', { name: 'Opciones Avanzadas' }).click();
  await page.getByPlaceholder('ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx').fill('ghp_token_de_prueba');
  await page.getByRole('button', { name: 'Verificar' }).click();
  await expect(page.getByText('Token inválido o sin permisos.')).toBeVisible();
  await expect(page.getByRole('link', { name: /solo lectura: read:user/ })).toHaveAttribute('href', /scopes=read%3Auser$/);
});
