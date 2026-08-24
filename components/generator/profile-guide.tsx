'use client';

import { useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Github,
  LayoutTemplate,
  Settings2,
  UserRoundSearch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfileGuideProps {
  generatedUsername?: string;
  assetCount?: number;
}

const STEPS = [
  {
    title: 'Busca tu perfil',
    shortTitle: 'Usuario',
    description: 'Escribe un usuario público de GitHub. El token es opcional y solo amplía el límite de la API.',
    target: 'profile-username',
    action: 'Ir al usuario',
    icon: UserRoundSearch,
  },
  {
    title: 'Elige el diseño',
    shortTitle: 'Plantilla',
    description: 'Compara las cuatro plantillas. Puedes cambiar de diseño después de generar sin repetir la consulta.',
    target: 'profile-templates',
    action: 'Ver plantillas',
    icon: LayoutTemplate,
  },
  {
    title: 'Personaliza',
    shortTitle: 'Opciones',
    description: 'Añade enlaces, activa el snake local o usa un token de sesión para obtener datos ampliados.',
    target: 'profile-settings',
    action: 'Ir a opciones',
    icon: Settings2,
  },
  {
    title: 'Descarga e instala',
    shortTitle: 'Instalación',
    description: 'Descarga el ZIP y sube juntos README.md y assets/ al repositorio especial de tu perfil.',
    target: 'profile-result',
    action: 'Ir al resultado',
    icon: Download,
  },
] as const;

function scrollToSection(target: string) {
  document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function ProfileGuide({ generatedUsername, assetCount }: ProfileGuideProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (generatedUsername) setActiveStep(3);
  }, [generatedUsername]);

  const step = STEPS[activeStep];
  const StepIcon = step.icon;

  return (
    <section className="glass-card rounded-xl overflow-hidden" aria-labelledby="profile-guide-title">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={isOpen}
        aria-controls="profile-guide-content"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>
          <span id="profile-guide-title" className="block font-semibold text-foreground">
            Guía interactiva para crear tu perfil
          </span>
          <span className="block text-xs text-muted-foreground mt-1">
            De tu usuario de GitHub a un README autocontenido en cuatro pasos.
          </span>
        </span>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-primary transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div id="profile-guide-content" className="border-t border-border/50 p-4 md:p-5 space-y-5">
          <ol className="grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Pasos de la guía">
            {STEPS.map((item, index) => {
              const Icon = item.icon;
              const isComplete = generatedUsername ? index < 3 : index < activeStep;
              return (
                <li key={item.shortTitle}>
                  <button
                    type="button"
                    onClick={() => setActiveStep(index)}
                    aria-current={activeStep === index ? 'step' : undefined}
                    className={cn(
                      'w-full rounded-lg border p-3 text-left transition-colors',
                      activeStep === index
                        ? 'border-primary/60 bg-primary/10 text-foreground'
                        : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/30'
                    )}
                  >
                    <span className="flex items-center gap-2 text-xs font-medium">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/70 text-primary">
                        {isComplete ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                      </span>
                      {index + 1}. {item.shortTitle}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 md:p-5" aria-live="polite">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/15 p-2 text-primary"><StepIcon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">Paso {activeStep + 1} de {STEPS.length}</p>
                <h3 className="mt-1 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>

                {activeStep === 3 && generatedUsername && (
                  <div className="mt-3 rounded-lg border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground space-y-2">
                    <p><strong className="text-foreground">Destino:</strong> {generatedUsername}/{generatedUsername}</p>
                    <p><strong className="text-foreground">Contenido:</strong> README.md + carpeta assets/{assetCount !== undefined ? ` (${assetCount} SVG)` : ''}</p>
                    <a
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      href={`https://github.com/new?name=${encodeURIComponent(generatedUsername)}&description=Mi+perfil+de+GitHub`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-3.5 w-3.5" /> Crear el repositorio de perfil
                    </a>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={activeStep === 3 && !generatedUsername}
                    onClick={() => scrollToSection(step.target)}
                  >
                    {activeStep === 3 && !generatedUsername ? 'Genera primero tu perfil' : step.action}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
                  >
                    <ChevronLeft /> Anterior
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={activeStep === STEPS.length - 1}
                    onClick={() => setActiveStep((current) => Math.min(STEPS.length - 1, current + 1))}
                  >
                    Siguiente <ChevronRight />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
