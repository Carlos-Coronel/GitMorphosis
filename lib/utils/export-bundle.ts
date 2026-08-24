import { strToU8, zipSync } from 'fflate';
import type { GeneratedReadme, GeneratedAsset } from '@/lib/domain/types';

const encoder = (value: string) => strToU8(value);

export function safeBundleName(username: string): string {
  const safe = username.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${safe || 'github-profile'}-readme.zip`;
}

export function createReadmeBundle(result: Pick<GeneratedReadme, 'markdown' | 'assets'>): Uint8Array {
  const files: Record<string, Uint8Array> = {
    'README.md': encoder(result.markdown),
    'INSTALACION.md': encoder('# Instalar tu perfil generado con GitMorphosis\n\n1. Crea un repositorio público con el mismo nombre que tu usuario de GitHub.\n2. Copia `README.md` y la carpeta completa `assets/` a la raíz del repositorio.\n3. Conserva los nombres y las rutas de todos los SVG.\n4. Confirma `README.md` y `assets/` en el mismo commit.\n5. Abre tu perfil de GitHub y comprueba el resultado.\n\n> No copies únicamente el Markdown: sus imágenes usan rutas relativas a `assets/`.\n\n## Actualizar los datos\n\nLos datos del ZIP son estáticos. Genera un paquete nuevo cuando cambie tu perfil, elimina la carpeta `assets/` anterior y reemplaza juntos `README.md` y `assets/`. Usa `git add -A` para que el commit también retire SVG obsoletos.\n'),
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

export function downloadReadmeBundle(result: GeneratedReadme): void {
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
