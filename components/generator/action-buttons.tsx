'use client';

import { useState, useCallback } from 'react';
import { Rocket, Download, CheckCircle2, ExternalLink, Github, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredToken } from '@/lib/infrastructure/github-api';
import { type GenerateResult } from '@/lib/domain/types';
import { downloadReadmeBundle } from '@/lib/utils/export-bundle';

interface ActionButtonsProps {
  result: GenerateResult;
}

export function ActionButtons({ result }: ActionButtonsProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDownload = useCallback(() => {
    if (!result) return;
    downloadReadmeBundle(result);
  }, [result]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback
    }
  }, [result]);

  return (
    <div className="glass-card p-4 rounded-xl space-y-3">
      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
        <Rocket className="h-4 w-4 text-primary" />
        Acciones
      </h4>
      <div className="space-y-2">
        {/* Download button */}
        <button
          onClick={handleDownload}
          className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
        >
          <Download className="h-4 w-4 text-primary" />
          Descargar ZIP completo
        </button>
        <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
          Incluye README.md, {result.assets.length} SVG locales y la guía de instalación.
        </p>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={cn(
            'w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors',
            copySuccess
              ? 'text-emerald-600 bg-emerald-500/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <CheckCircle2 className={cn('h-4 w-4', copySuccess ? 'text-emerald-500' : 'text-muted-foreground')} />
          {copySuccess ? '¡Copiado!' : 'Copiar Markdown'}
        </button>
        <p className="px-2 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
          El Markdown copiado necesita también la carpeta assets/ incluida en el ZIP.
        </p>

        <a
          href={`https://github.com/${result.profile.user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Ver perfil en GitHub
        </a>
        <a
          href={`https://github.com/${result.profile.user.username}/${result.profile.user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Github className="h-4 w-4" />
          Repo del perfil README
        </a>
      </div>

      {/* Pinned repos info */}
      {result.profile.pinnedCount > 0 && (
        <div className="pt-2 border-t border-border/40">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            {getStoredToken() ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {result.profile.pinnedCount} repos fijados reales (GraphQL)
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 text-amber-500" />
                {result.profile.pinnedCount} repos más populares (sin token)
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
