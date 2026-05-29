'use client';

import { useState } from 'react';
import { Settings2, CheckCircle2, ChevronDown, Server, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GitHubTokenInput } from '@/components/github-token-input';
import { SocialLinksEditor } from '@/components/social-links-editor';
import { getStoredToken } from '@/lib/infrastructure/github-api';
import { cn } from '@/lib/utils';
import { type GenerateResult, type GeneratorConfig } from '@/lib/domain/types';

interface AdvancedSettingsProps {
  result: GenerateResult | null;
  config: GeneratorConfig;
  isGitHubPages: boolean;
  onTokenChange: (token: string | null) => void;
  updateConfig: (newConfig: Partial<GeneratorConfig>) => void;
}

export function AdvancedSettings({
  result,
  config,
  isGitHubPages,
  onTokenChange,
  updateConfig,
}: AdvancedSettingsProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Settings2 className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">Opciones Avanzadas</span>
          {getStoredToken() && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/40 text-emerald-600 bg-emerald-500/5 gap-1">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Token activo
            </Badge>
          )}
        </div>
        <ChevronDown className={cn(
          'h-5 w-5 text-muted-foreground transition-transform duration-200',
          showAdvancedOptions && 'rotate-180'
        )} />
      </button>

      {showAdvancedOptions && (
        <div className="p-5 border-t border-border/50 animate-in slide-in-from-top-2 duration-200 space-y-6">
          {/* GitHub PAT Token */}
          <div className="p-4 rounded-lg border border-primary/10 bg-primary/5">
            <GitHubTokenInput onTokenChange={onTokenChange} />
          </div>

          <SocialLinksEditor
            key={result?.profile.user.username || 'new'}
            detectedTwitter={result?.profile.user.twitterUsername}
            detectedBlog={result?.profile.user.blog}
            detectedSocialLinks={result?.profile.user.socialLinks}
            onChange={(links) => updateConfig({ socialLinks: links })}
          />

          <div className="border-t border-border/40 pt-5 space-y-4">
            <div className={cn(
              'flex flex-col gap-3 p-4 rounded-lg border',
              isGitHubPages
                ? 'bg-amber-500/5 border-amber-500/20'
                : 'bg-primary/5 border-primary/10'
            )}>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="force-self-hosted" className="text-sm font-semibold flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    Usar Endpoints Propios
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isGitHubPages
                      ? 'No disponible en GitHub Pages (no soporta ejecución de /api en runtime).'
                      : 'Ignora servicios externos inestables y usa la infraestructura local.'}
                  </p>
                </div>
                <Switch
                  id="force-self-hosted"
                  checked={config.forceSelfHosted && !isGitHubPages}
                  disabled={isGitHubPages}
                  onCheckedChange={(val) => updateConfig({ forceSelfHosted: val })}
                />
              </div>
              {isGitHubPages && (
                <div className="flex items-start gap-2 text-[10px] text-amber-600 dark:text-amber-400 leading-tight">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>
                    Para usar endpoints propios, despliega GitMorphosis en Vercel o un servidor con soporte Node.js.
                  </span>
                </div>
              )}
            </div>

            {/* Snake toggle */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30 border-border/50">
              <div className="space-y-0.5">
                <Label htmlFor="include-snake" className="text-sm font-semibold flex items-center gap-2">
                  🐍 Incluir Contribution Snake
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Requiere configurar un <strong>GitHub Action</strong> en tu repo una sola vez.
                  Si no lo has hecho, dejarlo desactivado evita imágenes rotas (404) en el README.
                </p>
              </div>
              <Switch
                id="include-snake"
                checked={config.includeSnake}
                onCheckedChange={(val) => updateConfig({ includeSnake: val })}
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
                <Settings2 className="h-4 w-4 text-primary" />
                Configuración de Servidores de Estadísticas
              </h4>
              <p className="text-xs text-muted-foreground leading-normal">
                Si las instancias públicas de{' '}
                <code className="text-primary font-mono bg-primary/5 px-1 py-0.5 rounded">
                  github-readme-stats
                </code>{' '}
                están congestionadas o caídas (error 503), puedes especificar tus propias instancias aquí.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="stats-url-input" className="text-xs font-medium text-muted-foreground">
                  Servidor de Estadísticas (Stats & Top Languages)
                </label>
                <Input
                  id="stats-url-input"
                  type="url"
                  placeholder="https://github-readme-stats-sigma-five.vercel.app"
                  value={config.statsUrl}
                  onChange={(e) => updateConfig({ statsUrl: e.target.value })}
                  className="h-10 bg-card/50 border-border/70 focus:ring-primary/50 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="streak-url-input" className="text-xs font-medium text-muted-foreground">
                  Servidor de Streak Stats
                </label>
                <Input
                  id="streak-url-input"
                  type="url"
                  placeholder="https://streak-stats.demolab.com"
                  value={config.streakUrl}
                  onChange={(e) => updateConfig({ streakUrl: e.target.value })}
                  className="h-10 bg-card/50 border-border/70 focus:ring-primary/50 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
