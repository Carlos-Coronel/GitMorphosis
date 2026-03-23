'use client';

import { useState, useCallback, useEffect } from 'react';
import { UsernameInput } from '@/components/username-input';
import { TemplateSelector } from '@/components/template-selector';
import { ReadmePreview } from '@/components/readme-preview';
import { ProfileStats } from '@/components/profile-stats';
import { Github, Sparkles, Zap, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Template {
  id: string;
  name: string;
  description: string;
}

interface ProfileData {
  user: {
    username: string;
    name: string | null;
    bio: string | null;
    avatarUrl: string | null;
    location: string | null;
    company: string | null;
    blog: string | null;
    followers: number;
    following: number;
    publicRepos: number;
  };
  topLanguages: {
    language: string;
    percentage: number;
    color: string;
  }[];
  repositoryCount: number;
  pinnedCount: number;
}

interface GenerateResult {
  markdown: string;
  templateId: string;
  generatedAt: string;
  profile: ProfileData;
}

const DEFAULT_TEMPLATES: Template[] = [
  { id: 'minimalist', name: 'Minimalista', description: 'Perfil limpio y simple' },
  { id: 'portfolio', name: 'Portafolio', description: 'Exhibición de portafolio profesional' },
  { id: 'creative', name: 'Creativa', description: 'Llamativo con animaciones' },
  { id: 'terminal', name: 'Terminal', description: 'Estética de terminal estilo hacker' },
];

export function ProfileGenerator() {
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState('portfolio');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');

  // Obtener plantillas al montarse el componente
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/templates');
        const data = await response.json();
        if (data.success && data.data) {
          setTemplates(data.data);
        }
      } catch (err) {
        console.error('[v0] Error al obtener plantillas:', err);
      }
    }
    fetchTemplates();
  }, []);

  const handleGenerate = useCallback(async (username: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentUsername(username);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, templateId: selectedTemplate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate README');
      }

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTemplate]);

  const handleTemplateChange = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    // Re-generate if we have a current username
    if (result && currentUsername) {
      handleGenerate(currentUsername);
    }
  }, [result, currentUsername, handleGenerate]);

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Encabezado */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/20 glow-primary">
              <Github className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 text-balance">
            Generador de Perfil GitHub
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Genera perfiles README impresionantes automáticamente usando extracción web.
            Sin API key requerida. Múltiples plantillas profesionales disponibles.
          </p>
        </header>

        {/* Características */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Generación Instantánea</h3>
              <p className="text-sm text-muted-foreground">Resultados en segundos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Sin API Key Requerida</h3>
              <p className="text-sm text-muted-foreground">Usa extracción web</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">4 Plantillas</h3>
              <p className="text-sm text-muted-foreground">Diseños profesionales</p>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Entrada de Usuario */}
          <UsernameInput onSubmit={handleGenerate} isLoading={isLoading} />

          {/* Selector de Plantilla */}
          <TemplateSelector
            templates={templates}
            selectedId={selectedTemplate}
            onSelect={handleTemplateChange}
            disabled={isLoading}
          />

          {/* Alerta de Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Resultados */}
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar - Profile Stats */}
              <aside className="lg:col-span-1">
                <ProfileStats
                  user={result.profile.user}
                  topLanguages={result.profile.topLanguages}
                />
              </aside>

              {/* Main - README Preview */}
              <main className="lg:col-span-2">
                <ReadmePreview
                  markdown={result.markdown}
                  username={result.profile.user.username}
                />
              </main>
            </div>
          )}

          {/* Estado Vacío */}
          {!result && !isLoading && !error && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Github className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Listo para generar tu perfil
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ingresa un nombre de usuario de GitHub arriba para generar un perfil README profesional.
                Intenta con nombres de usuario como <code className="px-1 py-0.5 bg-muted rounded text-primary font-mono text-sm">torvalds</code>, <code className="px-1 py-0.5 bg-muted rounded text-primary font-mono text-sm">gaearon</code>, ¡o el tuyo!
              </p>
            </div>
          )}

          {/* Estado de Carga */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-pulse">
                <Github className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Analizando Perfil GitHub<span className="cursor-blink"></span>
              </h3>
              <p className="text-muted-foreground">
                Extrayendo datos del perfil, repositorios e idiomas...
              </p>
            </div>
          )}
        </div>

        {/* Pie de Página */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Construido con Next.js, TypeScript y Arquitectura Limpia.
            <br />
            Usa extracción web para obtener datos públicos de GitHub sin API keys.
          </p>
        </footer>
      </div>
    </div>
  );
}
