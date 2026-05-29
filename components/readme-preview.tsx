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
import { statsDataUri } from '@/lib/infrastructure/svg/stats-card';
import { topLangsDataUri } from '@/lib/infrastructure/svg/top-langs-card';
import { pinDataUri } from '@/lib/infrastructure/svg/pin-card';
import { snakeDataUri } from '@/lib/infrastructure/svg/snake-card';
import { trophyDataUri } from '@/lib/infrastructure/svg/trophy-card';

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
  const [isFaithfulPreview, setIsFaithfulPreview] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(markdown);
      } else {
        // Fallback para contextos no seguros o navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = markdown;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback de copia falló:', err);
        }
        document.body.removeChild(textArea);
      }
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

    // ── 0. localUriMap no longer pre-generated to support multiple themes ──

    const resolveUrl = (url: string): string => {
      if (isFaithfulPreview || !profile) return url;

      // Extract theme from URL to match the template's specified theme
      const themeMatch = url.match(/[?&]theme=([^&]+)/);
      const urlTheme = themeMatch ? themeMatch[1] : svgTheme;
      
      const isStats = url.includes('/api/stats') || url.includes('github-readme-stats.vercel.app/api?') || url.includes('github-readme-stats-sigma-five.vercel.app/api?');
      const isLangs = url.includes('/api/top-langs') || url.includes('github-readme-stats.vercel.app/api/top-langs') || url.includes('github-readme-stats-sigma-five.vercel.app/api/top-langs');
      const isTrophy = url.includes('github-profile-trophy.vercel.app') || url.includes('github-profile-trophy-one.vercel.app') || url.includes('/api/trophies');
      const isSnake = url.includes('/api/snake') || url.includes('github-contribution-grid-snake') || url.includes('snake.svg');
      const isPin = url.includes('/api/pin') || url.includes('github-readme-stats.vercel.app/api/pin') || url.includes('github-readme-stats-sigma-five.vercel.app/api/pin');

      if (isStats) {
        const totalStars = profile.repositories.reduce((s, r) => s + (r.stars || 0), 0);
        return statsDataUri({
          username: profile.user.username,
          theme: urlTheme,
          stars: totalStars,
          followers: profile.user.followers,
          repos: profile.user.publicRepos,
          showIcons: true,
          hideBorder: true,
        });
      }
      
      if (isLangs) {
        return topLangsDataUri({
          username: profile.user.username,
          languages: profile.topLanguages,
          theme: urlTheme,
          hideBorder: true,
          layout: 'compact',
        });
      }

      if (isTrophy) {
        const totalStars = profile.repositories.reduce((s, r) => s + (r.stars || 0), 0);
        return trophyDataUri({
          username: profile.user.username,
          theme: urlTheme,
          stats: {
            stars: totalStars,
            commits: profile.user.publicRepos * 30,
            prs: profile.user.publicRepos * 5,
            issues: profile.user.publicRepos * 2,
            followers: profile.user.followers,
            repos: profile.user.publicRepos,
          },
          hideBorder: url.includes('no-frame=true') || url.includes('hide_border=true'),
        });
      }
      
      if (isSnake) {
        return snakeDataUri({
          username: profile.user.username,
          theme: urlTheme,
          hideBorder: true,
        });
      }

      if (isPin) {
        const pinMatch = url.match(/[?&]repo=([^&]+)/);
        if (pinMatch) {
          const repoName = pinMatch[1];
          const repo = profile.repositories.find(r => r.name === repoName) || profile.pinnedRepos.find(r => r.name === repoName);
          if (repo) {
            return pinDataUri({
              username: profile.user.username,
              repo: repo.name,
              description: repo.description,
              language: repo.language,
              stars: repo.stars,
              forks: repo.forks,
              theme: urlTheme,
              hideBorder: true,
              showOwner: true,
            });
          }
        }
      }
      
      return url;
    };

    function inline(text: string): string {
      return text
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g,
          (_match, alt, src, href) => `<a href="${href}" target="_blank" rel="noopener noreferrer"><img src="${resolveUrl(src)}" alt="${alt}" loading="lazy" onerror="this.style.opacity='0.3'" /></a>`)
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => {
          const resolvedSrc = resolveUrl(src);
          const isStatsCard = src.includes('/api/') || src.includes('github-readme-stats') || src.includes('github-readme-stats-sigma-five')
            || src.includes('github-profile-trophy') || src.includes('streak-stats') || src.includes('capsule-render')
            || src.includes('shields.io') || src.includes('komarev');
          const classAttr = isStatsCard ? ' class="stats-card"' : '';
          return `<img src="${resolvedSrc}" alt="${alt}"${classAttr} loading="lazy" onerror="this.style.opacity='0.3'" />`;
        })
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    // ── 1. Adaptive <picture> tags ───────────────────────────────────────────
    let processed = md.replace(/<picture>([\s\S]*?)<\/picture>/gi, (match) => {
      const darkMatch = match.match(/<source[^>]*media="[^"]*dark[^"]*"[^>]*srcset="([^"]+)"/i);
      const lightMatch = match.match(/<source[^>]*media="[^"]*light[^"]*"[^>]*srcset="([^"]+)"/i);
      const imgMatch = match.match(/<img[^>]*src="([^"]+)"/i);
      const altMatch = match.match(/alt="([^"]*)"/i);
      const heightMatch = match.match(/height="([^"]*)"/i);

      const darkSrc = darkMatch ? darkMatch[1] : (imgMatch ? imgMatch[1] : '');
      const lightSrc = lightMatch ? lightMatch[1] : (imgMatch ? imgMatch[1] : '');
      const alt = altMatch ? altMatch[1] : '';
      const height = heightMatch ? heightMatch[1] : '';

      const rawSrc = isDark ? darkSrc : lightSrc;
      const src = resolveUrl(rawSrc);
      
      const isCard = src.startsWith('data:') || rawSrc.includes('/api/')
        || rawSrc.includes('github-readme-stats') || rawSrc.includes('github-readme-stats-sigma-five')
        || rawSrc.includes('github-profile-trophy') || rawSrc.includes('streak-stats')
        || rawSrc.includes('capsule-render') || rawSrc.includes('readme-typing-svg');
        
      const heightAttr = height ? ` height="${height}"` : '';
      const classAttr = isCard ? ' class="stats-card"' : '';
      
      return `<img src="${src}" alt="${alt}"${heightAttr}${classAttr} loading="lazy" onerror="this.style.opacity='0.3'" />`;
    });

    // ── 2. Block processing ────────────────────────────────────────────────
    const blocks = processed.trim().split(/\n\n+/);
    const htmlBlocks = blocks.map(block => {
      if (block.startsWith('```')) {
        return block.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
      }
      if (block.startsWith('#')) {
        return block
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/\n/g, '');
      }
      if (block === '---') {
        return '<hr />';
      }
      if (block.startsWith('>')) {
        return `<blockquote>${inline(block.replace(/^> /gm, '')).replace(/\n/g, '<br />')}</blockquote>`;
      }
      if (block.match(/^[*-] /m)) {
        const items = block.split('\n')
          .filter(line => line.trim())
          .map(line => `<li>${inline(line.replace(/^[*-] /, ''))}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }
      if (block.includes('|') && block.includes('\n')) {
        const lines = block.split('\n').filter(l => l.trim());
        const rows = lines.filter(l => !l.match(/^\|?[-:\s|]+\|?$/)).map(line => {
          const cells = line.split('|').filter((c, i, a) => {
            if (i === 0 && c.trim() === '') return false;
            if (i === a.length - 1 && c.trim() === '') return false;
            return true;
          });
          return `<tr>${cells.map(c => `<td>${inline(c.trim())}</td>`).join('')}</tr>`;
        }).join('');
        return `<table>${rows}</table>`;
      }

      // ── Handle HTML blocks (div, p align) often used for centering
      if (block.trim().startsWith('<div') || block.trim().startsWith('<p align')) {
        const content = block.replace(/<(img|source)[^>]+>/gi, (tag) => {
          if (tag.toLowerCase().startsWith('<img')) {
            return tag.replace(/src="([^"]+)"/i, (_m, src) => `src="${resolveUrl(src)}"`);
          }
          if (tag.toLowerCase().startsWith('<source')) {
            return tag.replace(/srcset="([^"]+)"/i, (_m, src) => `srcset="${resolveUrl(src)}"`);
          }
          return tag;
        });
        return `<div class="flex flex-col items-center justify-center gap-2 my-4 text-center">${inline(content)}</div>`;
      }

      return `<p>${inline(block).replace(/\n/g, '<br />')}</p>`;
    });

    return htmlBlocks.join('\n');
  };

  // Memoize the rendered HTML so it only recomputes when markdown or theme changes
  const renderedHtml = useMemo(
    () => renderMarkdown(markdown, previewTheme),
    [markdown, previewTheme, isFaithfulPreview]
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

          <div className="flex items-center space-x-2 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60">
            <label htmlFor="faithful-preview" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
              Preview Real
            </label>
            <button
              id="faithful-preview"
              onClick={() => setIsFaithfulPreview(!isFaithfulPreview)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                isFaithfulPreview ? "bg-primary" : "bg-input"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                  isFaithfulPreview ? "translate-x-4" : "translate-x-0"
                )}
              />
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

      {!isFaithfulPreview && activeTab === 'preview' && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-500 text-xs font-bold">i</span>
          </div>
          <div className="flex-1">
            <p className="text-xs text-blue-400 leading-relaxed">
              <span className="font-semibold text-blue-300">Optimización de vista previa activa:</span> Se están usando SVGs locales. El README final usará URLs públicas de GitHub.
              <button 
                onClick={() => setIsFaithfulPreview(true)}
                className="ml-2 underline hover:text-blue-300 transition-colors"
              >
                Cambiar a Preview Real
              </button>
            </p>
          </div>
        </div>
      )}

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
