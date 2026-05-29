'use client';

import { useState, useCallback } from 'react';
import { Key, CheckCircle2, XCircle, Loader2, ExternalLink, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { validateToken, saveToken, clearToken, getStoredToken } from '@/lib/infrastructure/github-api';
import { cn } from '@/lib/utils';

interface TokenStatus {
  state: 'idle' | 'loading' | 'valid' | 'invalid';
  remaining?: number;
  limit?: number;
  login?: string;
  error?: string;
}

interface GitHubTokenInputProps {
  onTokenChange?: (token: string | null) => void;
}

export function GitHubTokenInput({ onTokenChange }: GitHubTokenInputProps) {
  const [tokenValue, setTokenValue] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<TokenStatus>({
    state: getStoredToken() ? 'valid' : 'idle',
  });

  const handleVerify = useCallback(async () => {
    const t = tokenValue.trim();
    if (!t) return;

    setStatus({ state: 'loading' });

    try {
      const result = await validateToken(t);
      if (result.valid) {
        saveToken(t);
        setStatus({
          state: 'valid',
          remaining: result.remaining,
          limit: result.limit,
          login: result.login,
        });
        setTokenValue('');
        onTokenChange?.(t);
      } else {
        setStatus({ state: 'invalid', error: 'Token inválido o sin permisos.' });
      }
    } catch {
      setStatus({ state: 'invalid', error: 'No se pudo verificar el token.' });
    }
  }, [tokenValue, onTokenChange]);

  const handleClear = useCallback(() => {
    clearToken();
    setTokenValue('');
    setStatus({ state: 'idle' });
    onTokenChange?.(null);
  }, [onTokenChange]);

  const storedToken = getStoredToken();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4 text-primary" />
        <Label className="text-sm font-semibold">
          GitHub Personal Access Token (PAT)
        </Label>
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-600 bg-amber-500/5"
        >
          Opcional
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Sin token: <span className="text-foreground font-medium">60 requests/hora</span>. Con token:{' '}
        <span className="text-emerald-600 font-medium">5,000 requests/hora</span> + repos
        fijados reales via GraphQL. El token solo se guarda en la sesión del navegador.
      </p>

      {/* Active token indicator */}
      {storedToken && status.state === 'valid' && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <div className="text-xs">
              <span className="font-medium text-emerald-600">Token activo</span>
              {status.login && (
                <span className="text-muted-foreground ml-1">(@{status.login})</span>
              )}
              {status.remaining !== undefined && (
                <span className="text-muted-foreground ml-1">
                  · {status.remaining.toLocaleString()} requests restantes
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 px-2 text-xs text-rose-600 hover:text-rose-500 hover:bg-rose-500/10"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar
          </Button>
        </div>
      )}

      {/* Token input */}
      {(!storedToken || status.state !== 'valid') && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="pat-token-input"
              type={showToken ? 'text' : 'password'}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={tokenValue}
              onChange={(e) => {
                setTokenValue(e.target.value);
                if (status.state === 'invalid') setStatus({ state: 'idle' });
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className={cn(
                'pr-10 h-10 bg-card/50 border-border/70 text-xs font-mono',
                status.state === 'invalid' && 'border-rose-500/50 focus:ring-rose-500/30'
              )}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Button
            onClick={handleVerify}
            disabled={!tokenValue.trim() || status.state === 'loading'}
            size="sm"
            className="h-10 px-4 shrink-0"
          >
            {status.state === 'loading' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              'Verificar'
            )}
          </Button>
        </div>
      )}

      {/* Error state */}
      {status.state === 'invalid' && (
        <div className="flex items-center gap-2 text-xs text-rose-600">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{status.error}</span>
        </div>
      )}

      {/* Create token link */}
      {status.state !== 'valid' && (
        <a
          href="https://github.com/settings/tokens/new?description=GitMorphosis&scopes=read%3Auser%2Cpublic_repo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Crear token en GitHub (scope: read:user, public_repo)
        </a>
      )}
    </div>
  );
}
