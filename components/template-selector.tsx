'use client';

import { cn } from '@/lib/utils';
import { Palette, Code2, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
}

const TEMPLATE_CONFIG: Record<string, { 
  icon: React.ElementType; 
  gradient: string;
  preview: string;
}> = {
  minimalist: { 
    icon: Palette, 
    gradient: 'from-blue-500/20 to-cyan-500/20',
    preview: '# Hola 👋\n\n> Bio limpia y simple'
  },
  portfolio: { 
    icon: Code2, 
    gradient: 'from-primary/20 to-chart-2/20',
    preview: '## 🛠️ Tech Stack\n\n![Stats]()'
  },
  creative: { 
    icon: Sparkles, 
    gradient: 'from-pink-500/20 to-purple-500/20',
    preview: '🎨 Animaciones\n\n✨ Efectos'
  },
  terminal: { 
    icon: Terminal, 
    gradient: 'from-green-500/20 to-emerald-500/20',
    preview: '$ whoami\n> developer'
  },
};

interface TemplateSelectorProps {
  templates: Template[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function TemplateSelector({ 
  templates, 
  selectedId, 
  onSelect, 
  disabled = false 
}: TemplateSelectorProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          Selecciona Plantilla
        </h3>
        <span className="text-xs text-muted-foreground">
          {templates.length} disponibles
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {templates.map((template, index) => {
          const config = TEMPLATE_CONFIG[template.id] || { 
            icon: Code2, 
            gradient: 'from-gray-500/20 to-gray-600/20',
            preview: '# Preview'
          };
          const Icon = config.icon;
          const isSelected = selectedId === template.id;
          
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              disabled={disabled}
              className={cn(
                'group relative flex flex-col rounded-xl border transition-all duration-300',
                'hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20' 
                  : 'border-border/50 bg-card/50'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              aria-pressed={isSelected}
              aria-label={`Seleccionar plantilla ${template.name}`}
            >
              {/* Preview mini */}
              <div className={cn(
                'h-16 rounded-t-xl overflow-hidden relative',
                `bg-gradient-to-br ${config.gradient}`
              )}>
                <pre className="absolute inset-2 text-[8px] font-mono text-muted-foreground/60 overflow-hidden leading-tight">
                  {config.preview}
                </pre>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-primary fill-primary/20" />
                  </div>
                )}
              </div>
              
              {/* Contenido */}
              <div className="p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    isSelected ? 'bg-primary/20' : 'bg-muted/50 group-hover:bg-muted'
                  )}>
                    <Icon className={cn(
                      'h-4 w-4 transition-colors',
                      isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )} />
                  </div>
                  <span className={cn(
                    'text-sm font-semibold transition-colors truncate',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}>
                    {template.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </div>
              
              {/* Indicador de selección */}
              <div className={cn(
                'absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl transition-all duration-300',
                isSelected ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/30'
              )} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
