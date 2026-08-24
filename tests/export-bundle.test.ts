import { describe, expect, it } from 'vitest';
import { strFromU8, unzipSync } from 'fflate';
import { createReadmeBuilder } from '@/lib/application/readme-builder';
import { createReadmeBundle, safeBundleName } from '@/lib/utils/export-bundle';
import { profileFixture } from './fixtures/profile';

describe('exportación ZIP', () => {
  it('incluye Markdown, guía y todos los SVG con rutas relativas', () => {
    const result = createReadmeBuilder().build(profileFixture, 'portfolio');
    const files = unzipSync(createReadmeBundle({ markdown: result.markdown, assets: result.assets }));
    expect(strFromU8(files['README.md'])).toBe(result.markdown);
    expect(strFromU8(files['INSTALACION.md'])).toContain('carpeta completa `assets/`');
    expect(Object.keys(files).filter((path) => path.endsWith('.svg'))).toHaveLength(result.assets.length);
  });

  it('normaliza el nombre del paquete', () => expect(safeBundleName(' Octo Cat!! ')).toBe('octo-cat-readme.zip'));

  it('rechaza rutas que puedan escapar del ZIP', () => {
    expect(() => createReadmeBundle({ markdown: '# test', assets: [{ path: 'assets/../bad.svg', content: '<svg/>', mimeType: 'image/svg+xml' }] })).toThrow('Ruta de recurso no válida');
  });
});
