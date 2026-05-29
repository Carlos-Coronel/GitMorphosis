'use client';

import { UsernameInput } from '@/components/username-input';
import { TemplateSelector } from '@/components/template-selector';
import { ReadmePreview } from '@/components/readme-preview';
import { ProfileStats } from '@/components/profile-stats';
import { useProfileGenerator } from '@/hooks/use-profile-generator';
import { useRateLimit } from '@/hooks/use-rate-limit';
import { GeneratorHero } from '@/components/generator/generator-hero';
import { ServiceStatus } from '@/components/generator/service-status';
import { AdvancedSettings } from '@/components/generator/advanced-settings';
import { ActionButtons } from '@/components/generator/action-buttons';
import { LoadingState } from '@/components/generator/loading-state';
import { EmptyState } from '@/components/generator/empty-state';
import { DEFAULT_TEMPLATES, EXAMPLE_USERS } from '@/components/generator/constants';
import { Code2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function ProfileGenerator() {
  const { rateLimit, refreshRateLimit } = useRateLimit();
  const {
    selectedTemplate,
    isLoading,
    loadingStep,
    error,
    result,
    currentProfile,
    serviceHealth,
    isGitHubPages,
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
        <div className="max-w-5xl mx-auto space-y-8">
          <ServiceStatus serviceHealth={serviceHealth} rateLimit={rateLimit} />

          <div className="fade-in-up stagger-4 opacity-0">
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

          <TemplateSelector
            templates={DEFAULT_TEMPLATES}
            selectedId={selectedTemplate}
            onSelect={handleTemplateChange}
            disabled={isLoading}
          />

          <AdvancedSettings
            result={result}
            config={config}
            isGitHubPages={isGitHubPages}
            onTokenChange={handleTokenChange}
            updateConfig={updateConfig}
          />

          {error && (
            <Alert variant="destructive" className="animate-in shake duration-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <aside className="lg:col-span-1 space-y-6">
                <ProfileStats user={result.profile.user} topLanguages={result.profile.topLanguages} />
                <ActionButtons result={result} />
              </aside>
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
