import { Wand2 } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="text-center py-20 fade-in-up">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 rounded-full bg-muted blur-2xl opacity-50" />
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/80 border border-border">
          <Wand2 className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">Listo para generar tu perfil</h3>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
        Ingresa un nombre de usuario de GitHub arriba para generar un perfil README profesional con estadísticas, badges y más.
      </p>
    </div>
  );
}
