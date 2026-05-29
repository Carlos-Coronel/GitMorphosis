'use client';

import { Activity, ShieldCheck, ShieldAlert, Key, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { type ServiceStatus as ServiceStatusType } from '@/lib/infrastructure/service-health';
import { type RateLimitInfo } from '@/hooks/use-rate-limit';

interface ServiceStatusProps {
  serviceHealth: ServiceStatusType[];
  rateLimit: RateLimitInfo | null;
}

export function ServiceStatus({ serviceHealth, rateLimit }: ServiceStatusProps) {
  // Rate limit badge color
  const rateLimitColor = rateLimit
    ? rateLimit.remaining > 30
      ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5'
      : rateLimit.remaining > 10
      ? 'border-amber-500/30 text-amber-600 bg-amber-500/5'
      : 'border-rose-500/30 text-rose-600 bg-rose-500/5'
    : '';

  return (
    <div className="fade-in-up stagger-3 opacity-0 space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3 w-3" /> Servicios:
        </span>
        {serviceHealth.length === 0 ? (
          <Badge variant="outline" className="text-[10px] animate-pulse">Verificando...</Badge>
        ) : (
          serviceHealth.map((s) => (
            <Badge
              key={s.name}
              variant="outline"
              className={cn(
                'text-[10px] gap-1 px-2 py-0',
                s.isUp
                  ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5'
                  : 'border-rose-500/30 text-rose-600 bg-rose-500/5'
              )}
            >
              {s.isUp ? <ShieldCheck className="h-2.5 w-2.5" /> : <ShieldAlert className="h-2.5 w-2.5" />}
              {s.name}
            </Badge>
          ))
        )}

        {/* Rate Limit Badge */}
        {rateLimit && (
          <Badge
            variant="outline"
            className={cn('text-[10px] gap-1 px-2 py-0', rateLimitColor)}
            title={`${rateLimit.remaining}/${rateLimit.limit} requests restantes`}
          >
            <Key className="h-2.5 w-2.5" />
            {rateLimit.isAuthenticated ? 'Con token' : 'Sin token'}: {rateLimit.remaining}/{rateLimit.limit} req
          </Badge>
        )}
      </div>

      {/* Low rate limit warning */}
      {rateLimit && !rateLimit.isAuthenticated && rateLimit.remaining <= 10 && (
        <Alert className="border-amber-500/30 bg-amber-500/5 max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700 text-sm">Rate limit bajo ({rateLimit.remaining} requests)</AlertTitle>
          <AlertDescription className="text-amber-600/80 text-xs">
            Agrega un token PAT en Opciones Avanzadas para obtener 5,000 requests/hora.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
