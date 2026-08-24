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
    expect(result.assets.length).toBeGreaterThan(20);
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
    expect(createLocalAssets(malicious).map((asset) => asset.content).join('')).not.toContain('<script>');
  });
});
