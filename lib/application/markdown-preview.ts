import { marked } from 'marked';
import type { GeneratedAsset } from '@/lib/domain/types';

export type PreviewTheme = 'dark' | 'light';

function assetDataUrl(path: string, assets: GeneratedAsset[]): string {
  const asset = assets.find((item) => item.path === path);
  return asset
    ? `data:${asset.mimeType};charset=utf-8,${encodeURIComponent(asset.content)}`
    : path;
}

function attribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`${name}="([^"]*)"`, 'i'))?.[1];
}

function selectAdaptivePictures(markdown: string, theme: PreviewTheme): string {
  return markdown.replace(/<picture>([\s\S]*?)<\/picture>/gi, (picture) => {
    const sourceTags = picture.match(/<source\b[^>]*>/gi) ?? [];
    const imageTag = picture.match(/<img\b[^>]*>/i)?.[0] ?? '';
    const themed = sourceTags.filter((tag) => attribute(tag, 'media')?.includes(`prefers-color-scheme: ${theme}`));
    const mobile = themed.find((tag) => attribute(tag, 'media')?.includes('max-width'));
    const desktop = themed.find((tag) => !attribute(tag, 'media')?.includes('max-width'));
    const fallback = attribute(imageTag, 'src') ?? '';
    const desktopPath = attribute(desktop ?? '', 'srcset') ?? fallback;
    const mobilePath = attribute(mobile ?? '', 'srcset');
    const alt = attribute(imageTag, 'alt') ?? '';
    const height = attribute(imageTag, 'height');
    const mobileSource = mobilePath
      ? `<source media="(max-width: 480px)" srcset="${mobilePath}">\n  `
      : '';
    const heightAttribute = height ? ` height="${height}"` : '';

    return `<picture>\n  ${mobileSource}<img alt="${alt}" src="${desktopPath}"${heightAttribute}>\n</picture>`;
  });
}

function resolveAssetAttributes(html: string, assets: GeneratedAsset[]): string {
  return html.replace(/\b(src|srcset)="([^"]+)"/gi, (_match, name: string, path: string) =>
    `${name}="${assetDataUrl(path, assets)}"`
  );
}

/**
 * Renders the generated Markdown with GFM semantics, while choosing the same
 * responsive SVG variant that GitHub would select for the requested theme.
 */
export function renderReadmePreview(
  markdown: string,
  theme: PreviewTheme,
  assets: GeneratedAsset[],
): string {
  const adaptiveMarkdown = selectAdaptivePictures(markdown, theme);
  const html = marked.parse(adaptiveMarkdown, { async: false, gfm: true, breaks: false });
  return resolveAssetAttributes(html, assets);
}
