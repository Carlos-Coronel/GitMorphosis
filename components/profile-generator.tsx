'use client';

import { UsernameInput } from '@/components/username-input';
import { TemplateSelector } from '@/components/template-selector';
import { ReadmePreview } from '@/components/readme-preview';
import { ProfileStats } from '@/components/profile-stats';
import { useProfileGenerator } from '@/hooks/use-profile-generator';
import { useRateLimit } from '@/hooks/use-rate-limit';
import { GeneratorHero } from '@/components/generator/generator-hero';
import { AdvancedSettings } from '@/components/generator/advanced-settings';
import { ActionButtons } from '@/components/generator/action-buttons';
import { LoadingState } from '@/components/generator/loading-state';
import { EmptyState } from '@/components/generator/empty-state';
import { ProfileGuide } from '@/components/generator/profile-guide';
import { EXAMPLE_USERS } from '@/components/generator/constants';
import { createReadmeBuilder } from '@/lib/application/readme-builder';
import { Code2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const README_TEMPLATES = createReadmeBuilder().getAvailableTemplates();

export function ProfileGenerator() {
  const { rateLimit, refreshRateLimit } = useRateLimit();
  const {
    selectedTemplate,
    isLoading,
    loadingStep,
    error,
    result,
    config,
    updateConfig,
    handleGenerate,
    handleTemplateChange,
    handleTokenChange,
  } = useProfileGenerator({ onGenerateSuccess: refreshRateLimit });

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <GeneratorHero />
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="glass-card rounded-xl px-4 py-3 text-sm text-muted-foreground" role="status">
            Motor local activo · Solo se consulta la API oficial de GitHub
            {rateLimit && <span className="ml-2 text-primary">{rateLimit.remaining}/{rateLimit.limit} solicitudes disponibles</span>}
          </div>

          <ProfileGuide
            generatedUsername={result?.profile.user.username}
            assetCount={result?.assets.length}
          />

          <div id="profile-username" className="fade-in-up stagger-4 opacity-0 scroll-mt-4">
            <UsernameInput onSubmit={handleGenerate} isLoading={isLoading} />
          </div>

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

          <div id="profile-templates" className="scroll-mt-4">
            <TemplateSelector
              templates={README_TEMPLATES}
              selectedId={selectedTemplate}
              onSelect={handleTemplateChange}
              disabled={isLoading}
            />
          </div>

          <div id="profile-settings" className="scroll-mt-4">
            <AdvancedSettings
              result={result}
              config={config}
              onTokenChange={handleTokenChange}
              updateConfig={updateConfig}
            />
          </div>

          {error && (
            <Alert variant="destructive" className="animate-in shake duration-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div id="profile-result" className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,881px)] lg:justify-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-4">
              <aside className="space-y-6">
                <ProfileStats user={result.profile.user} topLanguages={result.profile.topLanguages} />
                <ActionButtons result={result} />
              </aside>
              <main className="min-w-0">
                <ReadmePreview
                  markdown={result.markdown}
                  username={result.profile.user.username}
                  isLoading={isLoading}
                  assets={result.assets}
                />
              </main>
            </div>
          )}

          {!result && !isLoading && !error && <EmptyState />}
          {isLoading && !result && <LoadingState loadingStep={loadingStep} />}
        </div>

        <footer className="mt-20 text-center">
          <div className="decorative-line w-24 mx-auto mb-6" />
          <p className="text-sm text-muted-foreground">
            Construido con <span className="text-primary">Next.js</span>, TypeScript y Arquitectura Limpia.
            <br />
            Usa la <span className="text-primary">GitHub REST & GraphQL API</span> oficial para datos precisos.
          </p>
        </footer>
      </div>
    </div>
  );
}
