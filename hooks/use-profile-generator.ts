'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchGitHubProfile, getStoredToken } from '@/lib/infrastructure/github-api';
import { createReadmeBuilder } from '@/lib/application/readme-builder';
import { GitHubProfile, GeneratedReadme, GeneratorConfig } from '@/lib/domain/types';

export interface UseProfileGeneratorOptions {
  onGenerateSuccess?: () => void;
}

export function useProfileGenerator(options?: UseProfileGeneratorOptions) {
  const { onGenerateSuccess } = options || {};

  const [selectedTemplate, setSelectedTemplate] = useState('portfolio');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedReadme | null>(null);
  const currentUsernameRef = useRef<string | null>(null);

  const [config, setConfig] = useState<GeneratorConfig>({
    includeSnake: false,
    socialLinks: [],
  });

  const configRef = useRef<GeneratorConfig>({
    includeSnake: false,
    socialLinks: [],
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedTemplateRef = useRef('portfolio');
  const profileCacheRef = useRef<{ username: string; profile: GitHubProfile } | null>(null);

  const handleGenerate = useCallback(async (username: string, activeConfig?: GeneratorConfig) => {
    setIsLoading(true);
    setError(null);

    const isNewUsername = username !== currentUsernameRef.current;
    const currentConfig = isNewUsername
      ? { ...(activeConfig || configRef.current), socialLinks: [] }
      : (activeConfig || configRef.current);

    if (isNewUsername) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setConfig(currentConfig);
      configRef.current = currentConfig;
      profileCacheRef.current = null;
    }

    currentUsernameRef.current = username;

    try {
      // ── Step 1: Fetch profile (use cache if same username) ──────────────
      let profile: GitHubProfile;

      if (profileCacheRef.current?.username === username) {
        profile = profileCacheRef.current.profile;
      } else {
        const hasToken = !!getStoredToken();
        setLoadingStep(
          hasToken
            ? 'Cargando perfil con token (repos fijados reales + mayor límite)...'
            : 'Cargando perfil de GitHub...'
        );
        profile = await fetchGitHubProfile(username);
        profileCacheRef.current = { username, profile };
      }

      // ── Step 2: Merge social links ──────────────────────────────────────
      setLoadingStep('Procesando datos...');
      const linksToUse = currentConfig.socialLinks;
      if (linksToUse.length > 0) {
        profile = {
          ...profile,
          user: {
            ...profile.user,
            socialLinks: linksToUse.filter((l) => l.enabled && l.username),
          },
        };
      }
      // ── Step 3: Generate README ─────────────────────────────────────────
      setLoadingStep('Generando README...');
      const builder = createReadmeBuilder();

      const generatedResult = builder.build(profile, selectedTemplateRef.current, {
        includeSnake: currentConfig.includeSnake,
      });

      setResult(generatedResult);

      // Refresh rate limit after API calls
      onGenerateSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
      setResult(null);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [onGenerateSuccess]);

  const updateConfig = useCallback((newConfig: Partial<GeneratorConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      configRef.current = updated;

      if (currentUsernameRef.current) {
        const isSocialChanged = newConfig.socialLinks !== undefined;

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        if (isSocialChanged) {
          debounceTimerRef.current = setTimeout(() => {
            handleGenerate(currentUsernameRef.current!, updated);
          }, 800);
        } else {
          handleGenerate(currentUsernameRef.current!, updated);
        }
      }
      return updated;
    });
  }, [handleGenerate]);

  const handleTemplateChange = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    selectedTemplateRef.current = templateId;

    if (currentUsernameRef.current) {
      handleGenerate(currentUsernameRef.current!);
    }
  }, [handleGenerate]);

  const handleTokenChange = useCallback(() => {
    profileCacheRef.current = null;
    onGenerateSuccess?.();
    if (currentUsernameRef.current && result) {
      handleGenerate(currentUsernameRef.current);
    }
  }, [onGenerateSuccess, result, handleGenerate]);

  // Init
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
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
  };
}
