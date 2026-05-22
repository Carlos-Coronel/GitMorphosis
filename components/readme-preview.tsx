'use client';

import { useState, useCallback } from 'react';
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
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ReadmePreviewProps {
  markdown: string;
  username: string;
  isLoading?: boolean;
}

export function ReadmePreview({ markdown, username, isLoading }: ReadmePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);

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
          ${renderMarkdown(markdown)}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [markdown, username]);

  // Convertidor simple de Markdown a HTML para preview
  const renderMarkdown = (md: string): string => {
    let html = md
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Images - manejar imágenes de GitHub stats con fallback
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        const isStatsCard = src.includes('github-readme-stats.vercel.app');
        return `<img src="${src}" alt="${alt}" loading="lazy" class="${isStatsCard ? 'stats-card' : ''}" onerror="this.classList.add('broken-image'); this.alt='Error al cargar stats'; console.warn('Falla al cargar imagen: ${src}');" />`;
      })
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr />')
      // List items
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      // Tablas
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        if (cells.every(c => /^[-:\s]+$/.test(c))) {
          return ''; // Línea separadora de tabla
        }
        const isHeader = cells.some(c => c.includes('---'));
        const tag = isHeader ? 'th' : 'td';
        return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
      })
      // Paragraphs and line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');

    // Wrap en paragraph si no comienza con elemento de bloque
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }

    return html;
  };

  // Contenido principal del preview
  const PreviewContent = () => (
    <>
      <div className="flex items-center justify-between mb-4">
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
        "relative rounded-lg border border-border/50 bg-card overflow-hidden shadow-lg shadow-primary/10",
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
            <span className="px-2 py-0.5 rounded bg-muted/80 border border-border/30">{markdown.length} caracteres</span>
            <span className="px-2 py-0.5 rounded bg-muted/80 border border-border/30">{markdown.split('\n').length} líneas</span>
          </div>
        </div>

        <Tabs value={activeTab} className="w-full">
          <TabsContent value="preview" className="mt-0">
            <div 
              className={cn(
                "p-6 overflow-auto custom-scrollbar markdown-preview",
                isFullscreen ? "max-h-[calc(100vh-180px)]" : "max-h-[600px]"
              )}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
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
