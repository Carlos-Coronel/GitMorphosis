'use client';

import { Github, Zap, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GeneratorHero() {
  return (
    <>
      {/* Encabezado */}
      <header className="text-center mb-12 fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl animate-pulse" />
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 glow-primary-subtle">
              <Github className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
          <span className="text-gradient-animated">Generador de Perfil</span>
          <br />
          <span className="text-foreground">GitHub</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
          Genera perfiles README impresionantes automáticamente usando la{' '}
          <span className="text-primary font-medium">GitHub REST & GraphQL API</span>.
          <br className="hidden md:block" />
          Múltiples plantillas profesionales. Descarga tu README listo para usar.
        </p>
      </header>

      {/* Características */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
        {[
          { icon: Zap, title: 'GitHub REST API', desc: 'Datos precisos y actualizados', delay: 'stagger-1' },
          { icon: Shield, title: 'GraphQL para Pinned Repos', desc: 'Repos fijados reales con token PAT', delay: 'stagger-2' },
          { icon: Sparkles, title: '4 Plantillas Pro', desc: 'Descarga como archivo .md', delay: 'stagger-3' },
        ].map(({ icon: Icon, title, desc, delay }) => (
          <div
            key={title}
            className={cn(
              'flex items-center gap-4 p-5 rounded-xl glass-card card-hover opacity-0 fade-in-up',
              delay
            )}
          >
            <div className="p-3 rounded-xl bg-primary/15 border border-primary/20">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
