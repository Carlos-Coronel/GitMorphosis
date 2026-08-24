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
});
