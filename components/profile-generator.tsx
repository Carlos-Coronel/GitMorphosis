'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { UsernameInput } from '@/components/username-input';
import { TemplateSelector } from '@/components/template-selector';
import { ReadmePreview } from '@/components/readme-preview';
import { ProfileStats } from '@/components/profile-stats';
import { SocialLinksEditor, type SocialLink } from '@/components/social-links-editor';
import { fetchGitHubProfile } from '@/lib/client/github-api';
import { createReadmeBuilder } from '@/lib/application/readme-builder';
import { GitHubProfile } from '@/lib/domain/types';
import { 
  Github, 
  Sparkles, 
  Zap, 
  Shield, 
  AlertCircle,
  ChevronDown,
  Settings2,
  Wand2,
  Rocket,
  Code2,
  ExternalLink
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
    twitterUsername?: string | null;
    socialLinks?: {
      platform: string;
      url: string;
      username: string;
    }[];
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

const EXAMPLE_USERS = [
  { username: 'torvalds', label: 'Linus Torvalds' },
  { username: 'gaearon', label: 'Dan Abramov' },
  { username: 'sindresorhus', label: 'Sindre Sorhus' },
  { username: 'yyx990803', label: 'Evan You' },
];

export function ProfileGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState('portfolio');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [currentProfile, setCurrentProfile] = useState<GitHubProfile | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const currentUsernameRef = useRef<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const socialLinksRef = useRef<SocialLink[]>([]);
  const [statsUrl, setStatsUrl] = useState('');
  const [streakUrl, setStreakUrl] = useState('https://streak-stats.demolab.com');
  const statsUrlRef = useRef('');
  const streakUrlRef = useRef('https://streak-stats.demolab.com');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const selectedTemplateRef = useRef('portfolio');
  // Cached profile to avoid re-fetching when only the template changes
  const profileCacheRef = useRef<{ username: string; profile: GitHubProfile } | null>(null);

  const handleGenerate = useCallback(async (username: string, currentSocialLinks?: SocialLink[]) => {
    setIsLoading(true);
    setError(null);

    if (username !== currentUsernameRef.current) {
      setSocialLinks([]);
      socialLinksRef.current = [];
      profileCacheRef.current = null;
    }

    setCurrentUsername(username);
    currentUsernameRef.current = username;

    try {
      // ── Step 1: Fetch profile (use cache if same username) ──────────────
      let profile: GitHubProfile;

      if (profileCacheRef.current?.username === username) {
        profile = profileCacheRef.current.profile;
      } else {
        setLoadingStep('Cargando perfil de GitHub...');
        profile = await fetchGitHubProfile(username);
        profileCacheRef.current = { username, profile };
      }

      // ── Step 2: Merge social links ──────────────────────────────────────
      setLoadingStep('Procesando datos...');
      const linksToUse = currentSocialLinks || socialLinksRef.current;
      if (linksToUse.length > 0) {
        profile = {
          ...profile,
          user: {
            ...profile.user,
            socialLinks: linksToUse.filter(l => l.enabled && l.username),
          },
        };
      }
      setCurrentProfile(profile);

      // ── Step 3: Generate README ─────────────────────────────────────────
      setLoadingStep('Generando README...');
      const builder = createReadmeBuilder();
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const generatedResult = builder.build(profile, selectedTemplateRef.current, {
        statsUrl: statsUrlRef.current || undefined,
        streakUrl: streakUrlRef.current,
        siteUrl,
      });

      setResult({
        markdown: generatedResult.markdown,
        templateId: generatedResult.templateId,
        generatedAt: generatedResult.generatedAt.toISOString(),
        profile: {
          user: profile.user,
          topLanguages: profile.topLanguages,
          repositoryCount: profile.repositories.length,
          pinnedCount: profile.pinnedRepos.length,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
      setResult(null);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, []);

  const handleTemplateChange = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    selectedTemplateRef.current = templateId;
    
    // Auto-update if result already exists
    if (currentUsernameRef.current) {
      handleGenerate(currentUsernameRef.current!);
    }
  }, [handleGenerate]);

  const handleSocialLinksChange = useCallback((links: SocialLink[]) => {
    setSocialLinks(links);
    socialLinksRef.current = links;
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Auto-update with debounce if result already exists
    if (currentUsernameRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        handleGenerate(currentUsernameRef.current!, links);
      }, 800);
    }
  }, [handleGenerate]);

  const handleStatsUrlChange = useCallback((value: string) => {
    setStatsUrl(value);
    statsUrlRef.current = value;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (currentUsernameRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        handleGenerate(currentUsernameRef.current!);
      }, 1000);
    }
  }, [handleGenerate]);

  const handleStreakUrlChange = useCallback((value: string) => {
    setStreakUrl(value);
    streakUrlRef.current = value;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (currentUsernameRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        handleGenerate(currentUsernameRef.current!);
      }, 1000);
    }
  }, [handleGenerate]);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-8 md:py-12">
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
            Genera perfiles README impresionantes automáticamente usando extracción web.
            <br className="hidden md:block" />
            <span className="text-primary font-medium">Sin API key requerida.</span> Múltiples plantillas profesionales disponibles.
          </p>
        </header>

        {/* Características */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
          {[
            { icon: Zap, title: 'Generación Instantánea', desc: 'Resultados en segundos', delay: 'stagger-1' },
            { icon: Shield, title: 'Sin API Key Requerida', desc: 'Usa extracción web', delay: 'stagger-2' },
            { icon: Sparkles, title: '4 Plantillas Pro', desc: 'Diseños profesionales', delay: 'stagger-3' },
          ].map(({ icon: Icon, title, desc, delay }) => (
            <div 
              key={title}
              className={cn(
                "flex items-center gap-4 p-5 rounded-xl glass-card card-hover opacity-0 fade-in-up",
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

        {/* Contenido Principal */}
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Entrada de Usuario */}
          <div className="fade-in-up stagger-4 opacity-0">
            <UsernameInput onSubmit={handleGenerate} isLoading={isLoading} />
          </div>

          {/* Usuarios de ejemplo */}
          {!result && !isLoading && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm fade-in-up stagger-5 opacity-0">
              <span className="text-muted-foreground">Prueba con:</span>
              {EXAMPLE_USERS.map(({ username, label }) => (
                <Button
                  key={username}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGenerate(username)}
                  className="h-8 px-3 text-xs hover:text-primary hover:bg-primary/10"
                >
                  <Code2 className="h-3 w-3 mr-1.5" />
                  {label}
                </Button>
              ))}
            </div>
          )}

          {/* Selector de Plantilla */}
          <div className="space-y-4">
            <TemplateSelector
              templates={DEFAULT_TEMPLATES}
              selectedId={selectedTemplate}
              onSelect={handleTemplateChange}
              disabled={isLoading}
            />
          </div>

          {/* Opciones Avanzadas */}
          <div className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings2 className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">Opciones Avanzadas</span>
              </div>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                showAdvancedOptions && "rotate-180"
              )} />
            </button>
            
            {showAdvancedOptions && (
              <div className="p-5 border-t border-border/50 animate-in slide-in-from-top-2 duration-200 space-y-6">
                <SocialLinksEditor
                  key={result?.profile.user.username || 'new'}
                  detectedTwitter={result?.profile.user.twitterUsername}
                  detectedBlog={result?.profile.user.blog}
                  detectedSocialLinks={result?.profile.user.socialLinks}
                  onChange={handleSocialLinksChange}
                />
                
                <div className="border-t border-border/40 pt-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
                      <Settings2 className="h-4 w-4 text-primary" />
                      Configuración de Servidores de Estadísticas
                    </h4>
                    <p className="text-xs text-muted-foreground leading-normal">
                      Si las instancias públicas de <code className="text-primary font-mono bg-primary/5 px-1 py-0.5 rounded">github-readme-stats</code> están congestionadas o caídas (error 503), puedes especificar tus propias instancias autohospedadas aquí.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="stats-url-input" className="text-xs font-medium text-muted-foreground">
                        Servidor de Estadísticas de GitHub (Stats & Top Languages)
                      </label>
                      <Input
                        id="stats-url-input"
                        type="url"
                        placeholder="https://github-readme-stats.vercel.app"
                        value={statsUrl}
                        onChange={(e) => handleStatsUrlChange(e.target.value)}
                        className="h-10 bg-card/50 border-border/70 focus:ring-primary/50 text-xs font-mono"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="streak-url-input" className="text-xs font-medium text-muted-foreground">
                        Servidor de Streak de GitHub (Streak Stats)
                      </label>
                      <Input
                        id="streak-url-input"
                        type="url"
                        placeholder="https://streak-stats.demolab.com"
                        value={streakUrl}
                        onChange={(e) => handleStreakUrlChange(e.target.value)}
                        className="h-10 bg-card/50 border-border/70 focus:ring-primary/50 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Alerta de Error */}
          {error && (
            <Alert variant="destructive" className="animate-in shake duration-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Resultados */}
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Sidebar - Profile Stats */}
              <aside className="lg:col-span-1 space-y-6">
                <ProfileStats
                  user={result.profile.user}
                  topLanguages={result.profile.topLanguages}
                />
                
                {/* Acciones rápidas */}
                <div className="glass-card p-4 rounded-xl space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-primary" />
                    Acciones Rápidas
                  </h4>
                  <div className="space-y-2">
                    <a
                      href={`https://github.com/${result.profile.user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver perfil en GitHub
                    </a>
                    <a
                      href={`https://github.com/${result.profile.user.username}/${result.profile.user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      Repo del perfil README
                    </a>
                  </div>
                </div>
              </aside>

              {/* Main - README Preview */}
              <main className="lg:col-span-2">
                <ReadmePreview
                  markdown={result.markdown}
                  username={result.profile.user.username}
                  isLoading={isLoading}
                  profile={currentProfile}
                />
              </main>
            </div>
          )}

          {/* Estado Vacío */}
          {!result && !isLoading && !error && (
            <div className="text-center py-20 fade-in-up">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-muted blur-2xl opacity-50" />
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/80 border border-border">
                  <Wand2 className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Listo para generar tu perfil
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                Ingresa un nombre de usuario de GitHub arriba para generar un perfil README profesional
                con estadísticas, badges y más.
              </p>
            </div>
          )}

          {/* Estado de Carga */}
          {isLoading && !result && (
            <div className="text-center py-20">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" />
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border border-primary/30">
                  <Github className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Analizando Perfil GitHub
                <span className="cursor-blink"></span>
              </h3>
              <p className="text-muted-foreground">
                {loadingStep || 'Conectando con la API de GitHub...'}
              </p>
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
          )}
        </div>

        {/* Pie de Página */}
        <footer className="mt-20 text-center">
          <div className="decorative-line w-24 mx-auto mb-6" />
          <p className="text-sm text-muted-foreground">
            Construido con <span className="text-primary">Next.js</span>, TypeScript y Arquitectura Limpia.
            <br />
            Usa extracción web para obtener datos públicos de GitHub sin API keys.
          </p>
          <p className="mt-4 text-xs text-muted-foreground/60">
            Hecho con cuidado para desarrolladores
          </p>
        </footer>
      </div>
    </div>
  );
}
