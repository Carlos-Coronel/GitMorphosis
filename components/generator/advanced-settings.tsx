'use client';

import { useState } from 'react';
import { Settings2, CheckCircle2, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GitHubTokenInput } from '@/components/github-token-input';
import { SocialLinksEditor } from '@/components/social-links-editor';
import { getStoredToken } from '@/lib/infrastructure/github-api';
import { cn } from '@/lib/utils';
import { type GenerateResult, type GeneratorConfig } from '@/lib/domain/types';

interface AdvancedSettingsProps {
  result: GenerateResult | null;
  config: GeneratorConfig;
  onTokenChange: (token: string | null) => void;
  updateConfig: (newConfig: Partial<GeneratorConfig>) => void;
}

export function AdvancedSettings({
  result,
  config,
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
          </div>
        </div>
      )}
    </div>
  );
}
