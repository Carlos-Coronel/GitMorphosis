'use client';

import { useState } from 'react';
import { Copy, Download, Check, Eye, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ReadmePreviewProps {
  markdown: string;
  username: string;
}

export function ReadmePreview({ markdown, username }: ReadmePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}-README.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simple markdown to HTML converter for preview
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
      // Images - handle GitHub stats images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr />')
      // List items
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      // Paragraphs and line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');

    // Wrap in paragraph if not starting with block element
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }

    return html;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="preview" className="data-[state=active]:bg-card gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-card gap-2">
              <Code2 className="h-4 w-4" />
              Markdown
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="relative rounded-lg border border-border bg-card overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-2">
            {username}-README.md
          </span>
        </div>

        <Tabs value={activeTab} className="w-full">
          <TabsContent value="preview" className="mt-0">
            <div 
              className="p-6 overflow-auto max-h-[600px] custom-scrollbar markdown-preview"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
            />
          </TabsContent>
          
          <TabsContent value="code" className="mt-0">
            <pre className="p-6 overflow-auto max-h-[600px] custom-scrollbar">
              <code className="text-sm font-mono text-muted-foreground whitespace-pre-wrap break-words">
                {markdown}
              </code>
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
