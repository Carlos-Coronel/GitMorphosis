import { describe, expect, it } from 'vitest';
import { renderReadmePreview } from '@/lib/application/markdown-preview';
import type { GeneratedAsset } from '@/lib/domain/types';

const assets: GeneratedAsset[] = [
  { path: 'assets/card-dark.svg', content: '<svg><title>desktop dark</title></svg>', mimeType: 'image/svg+xml' },
  { path: 'assets/card-light.svg', content: '<svg><title>desktop light</title></svg>', mimeType: 'image/svg+xml' },
  { path: 'assets/card-mobile-dark.svg', content: '<svg><title>mobile dark</title></svg>', mimeType: 'image/svg+xml' },
  { path: 'assets/card-mobile-light.svg', content: '<svg><title>mobile light</title></svg>', mimeType: 'image/svg+xml' },
];

const adaptive = `<picture>
  <source media="(max-width: 480px) and (prefers-color-scheme: dark)" srcset="assets/card-mobile-dark.svg">
  <source media="(max-width: 480px) and (prefers-color-scheme: light)" srcset="assets/card-mobile-light.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/card-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/card-light.svg">
  <img alt="Card" src="assets/card-dark.svg">
</picture>`;

describe('renderReadmePreview', () => {
  it('selecciona las variantes oscura y móvil que seleccionaría GitHub', () => {
    const html = renderReadmePreview(adaptive, 'dark', assets);
    expect(html).toContain('media="(max-width: 480px)"');
    expect(html).toContain('<themed-picture data-catalyst-inline="true">');
    expect(decodeURIComponent(html)).toContain('desktop dark');
    expect(decodeURIComponent(html)).toContain('mobile dark');
    expect(decodeURIComponent(html)).not.toContain('desktop light');
    expect(decodeURIComponent(html)).not.toContain('mobile light');
  });

  it('selecciona las variantes claras sin depender del tema del sistema', () => {
    const html = renderReadmePreview(adaptive, 'light', assets);
    expect(decodeURIComponent(html)).toContain('desktop light');
    expect(decodeURIComponent(html)).toContain('mobile light');
    expect(decodeURIComponent(html)).not.toContain('desktop dark');
  });

  it('reproduce GFM para títulos, bloques centrados, código y enlaces', () => {
    const markdown = `<div align="center">\n\n# Profile\n\n${adaptive}\n\n</div>\n\n## Stats\n\n\`\`\`text\n$ whoami\n\`\`\`\n\n[GitHub](https://github.com)`;
    const html = renderReadmePreview(markdown, 'dark', assets);
    expect(html).toContain('<div align="center"><h1>Profile</h1>');
    expect(html).toContain('<h2>Stats</h2>');
    expect(html).toContain('<pre><code class="language-text">$ whoami');
    expect(html).toContain('<div class="github-plain-code"><pre>');
    expect(html).toContain('<a href="https://github.com">GitHub</a>');
  });
});
