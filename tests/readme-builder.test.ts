import { describe, expect, it } from 'vitest';
import { createReadmeBuilder } from '@/lib/application/readme-builder';
import { createLocalAssets, escapeXml } from '@/lib/application/local-assets';
import { profileFixture } from './fixtures/profile';

const forbidden = /(shields\.io|vercel\.app|demolab\.com|komarev\.com|raw\.githubusercontent)/;

describe('motor autocontenido', () => {
  it.each(['minimalist', 'portfolio', 'creative', 'terminal'])('genera la plantilla %s sin recursos externos', (template) => {
    const result = createReadmeBuilder().build(profileFixture, template, { includeSnake: true });
    expect(result.markdown).toContain('assets/');
    expect(result.markdown).not.toMatch(forbidden);
    expect(result.assets.length).toBeGreaterThan(0);
    expect(result.assets.every((asset) => result.markdown.includes(asset.path))).toBe(true);
    expect(result.assets.every((asset) => asset.content.startsWith('<svg'))).toBe(true);
    expect(result.assets.every((asset) => !forbidden.test(asset.content))).toBe(true);
  });

  it('rechaza plantillas inexistentes', () => {
    expect(() => createReadmeBuilder().build(profileFixture, 'missing')).toThrow('Plantilla no encontrada');
  });

  it('escapa contenido no confiable en SVG', () => {
    expect(escapeXml('<script>"x" & y</script>')).toBe('&lt;script&gt;&quot;x&quot; &amp; y&lt;/script&gt;');
    const malicious = structuredClone(profileFixture);
    malicious.repositories[0].description = '<script>alert(1)</script>';
    const markdown = createReadmeBuilder().build(malicious, 'portfolio').markdown;
    expect(createLocalAssets(malicious, markdown).map((asset) => asset.content).join('')).not.toContain('<script>');
  });

  it('neutraliza atributos y protocolos peligrosos en Markdown', () => {
    const malicious = structuredClone(profileFixture);
    malicious.user.name = 'Octo" onerror="alert(1)';
    malicious.user.socialLinks = [{ platform: 'Website', username: 'bad', url: 'javascript:alert(1)' }];
    const result = createReadmeBuilder().build(malicious, 'creative');
    expect(result.markdown).toContain('Octo&quot; onerror=&quot;alert(1)');
    expect(result.markdown).not.toContain('javascript:');
    expect(result.markdown).toContain('[Website](#)');
  });

  it('envuelve las tarjetas de proyecto con HTML compatible con GitHub', () => {
    const result = createReadmeBuilder().build(profileFixture, 'portfolio');
    expect(result.markdown).toContain('<a href="https://github.com/octocat/hello-world">');
    expect(result.markdown).not.toContain('[<picture>');
  });

  it('omite secciones vacías y actividad desconocida', () => {
    const sparse = structuredClone(profileFixture);
    sparse.user.bio = null;
    sparse.user.location = null;
    sparse.user.company = null;
    sparse.user.blog = null;
    sparse.contributionStats = { totalContributions: 0, currentStreak: 0, longestStreak: 0, contributionsByDay: {} };

    const minimalist = createReadmeBuilder().build(sparse, 'minimalist');
    const portfolio = createReadmeBuilder().build(sparse, 'portfolio');
    const creative = createReadmeBuilder().build(sparse, 'creative');

    expect(minimalist.markdown).not.toContain('## About me');
    expect(portfolio.markdown).not.toContain('Contribution streak');
    expect(portfolio.markdown).not.toContain('Contribution activity');
    expect(creative.markdown).not.toContain('Contribution streak');
    expect(creative.markdown).not.toContain('location:');
    expect(creative.markdown).not.toContain('location: "Earth"');
    expect(createReadmeBuilder().build(sparse, 'terminal').markdown).not.toContain('Location: Unknown');
    expect([...portfolio.assets, ...creative.assets].some((asset) => asset.path.includes('streak-'))).toBe(false);
  });

  it('incluye variantes móviles claras y oscuras para cada tarjeta', () => {
    const result = createReadmeBuilder().build(profileFixture, 'creative');
    expect(result.markdown).toContain('assets/stats-mobile-dark.svg');
    expect(result.markdown).toContain('assets/stats-mobile-light.svg');
    expect(result.markdown).toContain('assets/project-1-mobile-dark.svg');
    expect(result.assets.some((asset) => asset.path === 'assets/trophies-mobile-light.svg')).toBe(true);
  });
});
