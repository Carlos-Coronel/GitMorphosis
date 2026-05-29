import { Github } from 'lucide-react';

interface LoadingStateProps {
  loadingStep?: string;
}

export function LoadingState({ loadingStep }: LoadingStateProps) {
  return (
    <div className="text-center py-20 animate-in fade-in duration-500">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" />
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border border-primary/30">
          <Github className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Analizando Perfil GitHub<span className="cursor-blink"></span>
      </h3>
      <p className="text-muted-foreground">{loadingStep || 'Conectando con la API de GitHub...'}</p>
      <div className="mt-6 flex justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="w-2 h-2 rounded-full bg-primary animate-bounce" 
            style={{ animationDelay: `${i * 0.15}s` }} 
          />
        ))}
      </div>
    </div>
  );
}
