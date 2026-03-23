'use client';

import { cn } from '@/lib/utils';
import { Palette, Code2, Sparkles, Terminal } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
}

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  minimalist: Palette,
  portfolio: Sparkles,
  creative: Sparkles,
  terminal: Terminal,
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
    <div className="w-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Select Template</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {templates.map((template) => {
          const Icon = TEMPLATE_ICONS[template.id] || Code2;
          const isSelected = selectedId === template.id;
          
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              disabled={disabled}
              className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200',
                'hover:border-primary/50 hover:bg-card/80',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected 
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                  : 'border-border bg-card'
              )}
              aria-pressed={isSelected}
              aria-label={`Select ${template.name} template`}
            >
              {isSelected && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
              )}
              <Icon className={cn(
                'h-6 w-6 transition-colors',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'text-sm font-medium transition-colors',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {template.name}
              </span>
              <span className="text-xs text-muted-foreground text-center line-clamp-2">
                {template.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
