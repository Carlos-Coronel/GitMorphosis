'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { 
  Copy, 
  Download, 
  Check, 
  Eye, 
  Code2, 
  Maximize2, 
  Minimize2,
  X,
  Share2,
  Printer,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { GitHubProfile } from '@/lib/domain/types';
import { statsDataUri } from '@/lib/client/svg/stats-card';
import { topLangsDataUri } from '@/lib/client/svg/top-langs-card';
import { pinDataUri } from '@/lib/client/svg/pin-card';
import { snakeDataUri } from '@/lib/client/svg/snake-card';

interface ReadmePreviewProps {
  markdown: string;
  username: string;
  isLoading?: boolean;
  /** When provided, the preview uses client-side generated SVGs instead of external URLs */
  profile?: GitHubProfile | null;
}

export function ReadmePreview({ markdown, username, isLoading, profile }: ReadmePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  // previewTheme drives which variant of the adaptive images to show
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }, [markdown]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}-README.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown, username]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `README de ${username}`,
          text: markdown,
        });
      } catch (err) {
        // Usuario canceló el share
      }
    } else {
      handleCopy();
    }
  }, [markdown, username, handleCopy]);

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>README - ${username}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 2rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
            h2 { font-size: 1.5rem; margin-top: 2rem; }
            h3 { font-size: 1.25rem; }
            code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace; }
            pre { background: #f4f4f4; padding: 1rem; border-radius: 5px; overflow-x: auto; }
            img { max-width: 100%; }
            a { color: #0366d6; }
            blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
          </style>
        </head>
        <body>
          ${renderMarkdown(markdown, previewTheme)}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [markdown, username, previewTheme]);

  // ── Core Markdown → HTML converter ──────────────────────────────────────────
  const renderMarkdown = (md: string, theme: 'dark' | 'light'): string => {
    const isDark = theme === 'dark';
    const svgTheme = isDark ? 'tokyonight' : 'flat';

    // ── 0. Pre-generate local SVG data URIs from profile ────────────────────
    // Build a map: external URL pattern → local data:URI
    // This makes the preview work instantly without any network requests.
    const localUriMap = new Map<string, string>();

    if (profile) {
      const totalStars = profile.repositories.reduce((s, r) => s + (r.stars || 0), 0);

      // Stats card
      const statsUri = statsDataUri({
        username: profile.user.username,
        theme: svgTheme,
        stars: totalStars,
        followers: profile.user.followers,
        repos: profile.user.publicRepos,
        showIcons: true,
        hideBorder: true,
      });
      localUriMap.set('stats', statsUri);

      // Top langs card
      if (profile.topLanguages.length > 0) {
        const langsUri = topLangsDataUri({
          username: profile.user.username,
          languages: profile.topLanguages,
          theme: svgTheme,
          hideBorder: true,
          layout: 'compact',
        });
        localUriMap.set('top-langs', langsUri);
      }

      // Snake
      const snake = snakeDataUri({
        username: profile.user.username,
        theme: svgTheme,
        hideBorder: true,
      });
      localUriMap.set('snake', snake);

      // Pin cards — one per pinned repo
      for (const repo of profile.pinnedRepos.slice(0, 6)) {
        const uri = pinDataUri({
          username: profile.user.username,
          repo: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
          forks: repo.forks,
          theme: svgTheme,
          hideBorder: true,
          showOwner: true,
        });
        localUriMap.set(`pin:${repo.name}`, uri);
      }
    }

    // Helper: swap an external URL to a local data URI if we have one
    const resolveUrl = (url: string): string => {
      if (url.includes('/api/stats') || url.includes('github-readme-stats.vercel.app/api?')) {
        return localUriMap.get('stats') || url;
      }
      if (url.includes('/api/top-langs') || url.includes('github-readme-stats.vercel.app/api/top-langs')) {
        return localUriMap.get('top-langs') || url;
      }
      if (url.includes('/api/snake') || url.includes('github-contribution-grid-snake')) {
        return localUriMap.get('snake') || url;
      }
      // Pin: match repo name from URL
      const pinMatch = url.match(/[?&]repo=([^&]+)/);
      if (pinMatch && (url.includes('/api/pin') || url.includes('github-readme-stats.vercel.app/api/pin'))) {
        return localUriMap.get(`pin:${pinMatch[1]}`) || url;
      }
      return url;
    };

    // ── 1. Adaptive <picture> tags ───────────────────────────────────────────
    let processed = md.replace(
      /<picture>\s*<source[^>]*media="[^"]*dark[^"]*"[^>]*srcset="([^"]+)"[^>]*>\s*<source[^>]*media="[^"]*light[^"]*"[^>]*srcset="([^"]+)"[^>]*>\s*<img[^>]*alt="([^"]*)"[^>]*(?:height="([^"]*)")?[^>]*\/>\s*<\/picture>/gi,
      (_match, darkSrc, lightSrc, alt, height) => {
        const rawSrc = isDark ? darkSrc : lightSrc;
        const src = resolveUrl(rawSrc);
        const isCard = src.startsWith('data:') || rawSrc.includes('/api/')
          || rawSrc.includes('github-readme-stats') || rawSrc.includes('streak-stats')
          || rawSrc.includes('capsule-render') || rawSrc.includes('readme-typing-svg');
        const heightAttr = height ? ` height="${height}"` : '';
        const classAttr = isCard ? ' class="stats-card"' : '';
        return `<img src="${src}" alt="${alt || ''}"${heightAttr}${classAttr} loading="lazy" onerror="this.style.opacity='0.3'" />`;
      }
    );

    // ── 2. Remaining Markdown ────────────────────────────────────────────────
    let html = processed
      // Fenced code blocks (must come before inline code)
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold & italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Stand-alone plain ![]() images (not already inside a <picture>)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => {
        const isStatsCard = src.includes('/api/') || src.includes('github-readme-stats')
          || src.includes('streak-stats') || src.includes('capsule-render')
          || src.includes('shields.io') || src.includes('komarev');
        const classAttr = isStatsCard ? ' class="stats-card"' : '';
        return `<img src="${src}" alt="${alt}"${classAttr} loading="lazy" onerror="this.style.opacity='0.3'" />`;
      })
      // [![badge](img)](url) — badge links
      .replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g,
        '<a href="$3" target="_blank" rel="noopener noreferrer"><img src="$2" alt="$1" loading="lazy" /></a>')
      // Regular links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr />')
      // Unordered list items
      .replace(/^[*-] (.*$)/gm, '<li>$1</li>')
      // Tables
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        if (cells.every(c => /^[-:\s]+$/.test(c))) return '';
        const tag = 'td';
        return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
      })
      // Paragraphs & line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');

    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }

    return html;
  };

  // Memoize the rendered HTML so it only recomputes when markdown or theme changes
  const renderedHtml = useMemo(
    () => renderMarkdown(markdown, previewTheme),
    [markdown, previewTheme]
  );

  // ── Preview background & text color per theme ────────────────────────────
  const previewBg  = previewTheme === 'dark'  ? 'bg-[#0d1117]' : 'bg-[#ffffff]';
  const previewText = previewTheme === 'dark' ? 'text-[#c9d1d9]' : 'text-[#24292f]';

  // ── Content ──────────────────────────────────────────────────────────────
  const PreviewContent = () => (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="preview" className="data-[state=active]:bg-card gap-2">
              <Eye className="h-4 w-4" />
              Vista Previa
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-card gap-2">
              <Code2 className="h-4 w-4" />
              Markdown
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2 flex-wrap items-center">
          {/* ── Dark / Light preview toggle ── */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-0.5">
            <button
              onClick={() => setPreviewTheme('dark')}
              title="Vista previa en modo oscuro"
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                previewTheme === 'dark'
                  ? 'bg-[#0d1117] text-[#c9d1d9] shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Moon className="h-3.5 w-3.5" />
              Oscuro
            </button>
            <button
              onClick={() => setPreviewTheme('light')}
              title="Vista previa en modo claro"
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                previewTheme === 'light'
                  ? 'bg-white text-[#24292f] shadow-sm ring-1 ring-border/40'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Sun className="h-3.5 w-3.5" />
              Claro
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2 hidden sm:flex"
            title="Copiar al portapapeles"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
            title="Descargar como archivo .md"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Descargar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2 hidden sm:flex"
            title="Compartir"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2 hidden sm:flex"
            title="Imprimir"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <div className="h-6 hidden sm:block border-r border-border/50" />
          <Button
            variant="default"
            size="sm"
            onClick={toggleFullscreen}
            className="gap-2 bg-primary hover:bg-primary/90 glow-primary"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Pantalla Completa</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className={cn(
        "relative rounded-lg border border-border/50 overflow-hidden shadow-lg shadow-primary/10",
        isFullscreen && "border-0 rounded-none shadow-none",
        isLoading && "opacity-60 transition-opacity duration-300"
      )}>
        {/* Header estilo Terminal */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-muted/70 to-muted/30 border-b border-border/50 backdrop-blur-sm">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer shadow-sm shadow-red-500/50" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer shadow-sm shadow-yellow-500/50" />
            <div className="h-3 w-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer shadow-sm shadow-green-500/50" />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-2 flex-1 tracking-wider">
            {username}-README.md
            {isLoading && (
              <span className="ml-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                Actualizando...
              </span>
            )}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {/* Theme badge */}
            <span className={cn(
              'px-2 py-0.5 rounded border text-[10px] font-medium',
              previewTheme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-white border-slate-200 text-slate-600'
            )}>
              {previewTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </span>
            <span className="px-2 py-0.5 rounded bg-muted/80 border border-border/30">{markdown.length} chars</span>
            <span className="px-2 py-0.5 rounded bg-muted/80 border border-border/30 hidden sm:block">{markdown.split('\n').length} líneas</span>
          </div>
        </div>

        <Tabs value={activeTab} className="w-full">
          <TabsContent value="preview" className="mt-0">
            {/* The preview area itself uses the previewTheme colours */}
            <div
              className={cn(
                'p-6 overflow-auto custom-scrollbar markdown-preview transition-colors duration-300',
                previewTheme === 'dark' ? 'bg-[#0d1117] text-[#c9d1d9]' : 'bg-[#ffffff] text-[#24292f]',
                isFullscreen ? 'max-h-[calc(100vh-180px)]' : 'max-h-[600px]'
              )}
              data-preview-theme={previewTheme}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </TabsContent>
          
          <TabsContent value="code" className="mt-0">
            <div className="relative">
              {/* Números de línea */}
              <pre className={cn(
                "p-6 overflow-auto custom-scrollbar flex",
                isFullscreen ? "max-h-[calc(100vh-180px)]" : "max-h-[600px]"
              )}>
                <div className="pr-4 border-r border-border/50 text-right select-none">
                  {markdown.split('\n').map((_, i) => (
                    <div key={i} className="text-xs text-muted-foreground/50 font-mono leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <code className="pl-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap break-words flex-1 leading-6">
                  {markdown}
                </code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );

  // Modal de pantalla completa
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="absolute inset-0 overflow-auto">
          <div className="container max-w-6xl mx-auto px-4 py-6">
            {/* Header de pantalla completa */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Vista Previa README</h2>
                  <p className="text-sm text-muted-foreground">@{username}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeFullscreen}
                className="h-10 w-10 rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <PreviewContent />
            
            {/* Instrucciones de teclado */}
            <div className="mt-4 text-center text-xs text-muted-foreground">
              Presiona <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">ESC</kbd> para salir de pantalla completa
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PreviewContent />
    </div>
  );
}
