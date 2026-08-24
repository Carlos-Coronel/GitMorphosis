import { strToU8, zipSync } from 'fflate';
import type { GenerateResult, GeneratedAsset } from '@/lib/domain/types';

const encoder = (value: string) => strToU8(value);

export function safeBundleName(username: string): string {
  const safe = username.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${safe || 'github-profile'}-readme.zip`;
}

export function createReadmeBundle(result: Pick<GenerateResult, 'markdown' | 'assets'>): Uint8Array {
  const files: Record<string, Uint8Array> = {
    'README.md': encoder(result.markdown),
    'INSTALACION.txt': encoder('GitMorphosis — paquete autocontenido\n\n1. Copia README.md y la carpeta assets/ a la raíz de tu repositorio de perfil.\n2. Confirma que ambas rutas se suban en el mismo commit.\n3. GitHub renderizará los SVG mediante rutas relativas, sin servicios gráficos externos.\n'),
  };
  for (const asset of result.assets) {
    if (!isSafeAsset(asset)) throw new Error(`Ruta de recurso no válida: ${asset.path}`);
    files[asset.path] = encoder(asset.content);
  }
  return zipSync(files, { level: 6 });
}

function isSafeAsset(asset: GeneratedAsset): boolean {
  return /^assets\/[a-z0-9-]+\.svg$/.test(asset.path) && asset.mimeType === 'image/svg+xml' && asset.content.trimStart().startsWith('<svg');
}

export function downloadReadmeBundle(result: GenerateResult): void {
  const bytes = createReadmeBundle(result);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = safeBundleName(result.profile.user.username);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
