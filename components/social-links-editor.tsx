'use client';

import { useState } from 'react';
import { 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Globe, 
  Mail,
  Plus,
  Check,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Tipos de redes sociales soportadas
export interface SocialLink {
  platform: string;
  url: string;
  username: string;
  icon: string;
  color: string;
  enabled: boolean;
}

// Plataformas predefinidas
const SOCIAL_PLATFORMS = [
  { id: 'twitter', name: 'Twitter / X', icon: 'twitter', color: '#1DA1F2', placeholder: 'usuario' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', placeholder: 'in/usuario' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E4405F', placeholder: 'usuario' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', color: '#FF0000', placeholder: '@canal' },
  { id: 'discord', name: 'Discord', icon: 'discord', color: '#5865F2', placeholder: 'usuario#0000' },
  { id: 'twitch', name: 'Twitch', icon: 'twitch', color: '#9146FF', placeholder: 'canal' },
  { id: 'dev', name: 'Dev.to', icon: 'dev-dot-to', color: '#0A0A0A', placeholder: 'usuario' },
  { id: 'medium', name: 'Medium', icon: 'medium', color: '#000000', placeholder: '@usuario' },
  { id: 'hashnode', name: 'Hashnode', icon: 'hashnode', color: '#2962FF', placeholder: '@usuario' },
  { id: 'stackoverflow', name: 'Stack Overflow', icon: 'stackoverflow', color: '#F48024', placeholder: 'user/id' },
  { id: 'email', name: 'Email', icon: 'gmail', color: '#EA4335', placeholder: 'correo@ejemplo.com' },
  { id: 'website', name: 'Sitio Web', icon: 'google-chrome', color: '#4285F4', placeholder: 'https://mi-sitio.com' },
];

function createDefaultLinks(
  detectedTwitter?: string | null, 
  detectedBlog?: string | null,
  detectedSocialLinks?: { platform: string; url: string; username: string }[]
): SocialLink[] {
  const defaultLinks: SocialLink[] = SOCIAL_PLATFORMS.map(platform => ({
    platform: platform.id,
    url: '',
    username: '',
    icon: platform.icon,
    color: platform.color,
    enabled: false,
  }));

  // Primero aplicar enlaces sociales detectados (más específicos)
  if (detectedSocialLinks && detectedSocialLinks.length > 0) {
    for (const detected of detectedSocialLinks) {
      const idx = defaultLinks.findIndex(l => l.platform === detected.platform);
      if (idx >= 0) {
        defaultLinks[idx].username = detected.username;
        defaultLinks[idx].url = detected.url;
        defaultLinks[idx].enabled = true;
      }
    }
  }

  // Fallback para Twitter y Blog si no estaban en detectedSocialLinks
  if (detectedTwitter) {
    const twitterIdx = defaultLinks.findIndex(l => l.platform === 'twitter');
    if (twitterIdx >= 0 && !defaultLinks[twitterIdx].enabled) {
      defaultLinks[twitterIdx].username = detectedTwitter;
      defaultLinks[twitterIdx].url = `https://twitter.com/${detectedTwitter}`;
      defaultLinks[twitterIdx].enabled = true;
    }
  }

  if (detectedBlog) {
    const websiteIdx = defaultLinks.findIndex(l => l.platform === 'website');
    if (websiteIdx >= 0 && !defaultLinks[websiteIdx].enabled) {
      defaultLinks[websiteIdx].url = detectedBlog.startsWith('http') ? detectedBlog : `https://${detectedBlog}`;
      defaultLinks[websiteIdx].username = detectedBlog;
      defaultLinks[websiteIdx].enabled = true;
    }
  }

  return defaultLinks;
}

interface SocialLinksEditorProps {
  detectedTwitter?: string | null;
  detectedBlog?: string | null;
  detectedSocialLinks?: { platform: string; url: string; username: string }[];
  onChange: (links: SocialLink[]) => void;
}

export function SocialLinksEditor({ 
  detectedTwitter,
  detectedBlog,
  detectedSocialLinks,
  onChange 
}: SocialLinksEditorProps) {
  const [links, setLinks] = useState<SocialLink[]>(() => 
    createDefaultLinks(detectedTwitter, detectedBlog, detectedSocialLinks)
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const updateLinks = (newLinks: SocialLink[]) => {
    setLinks(newLinks);
    // Llamar onChange directamente, sin useEffect
    onChange(newLinks.filter(l => l.enabled && l.username));
  };

  const handleToggle = (platform: string) => {
    const newLinks = links.map(link => 
      link.platform === platform 
        ? { ...link, enabled: !link.enabled }
        : link
    );
    updateLinks(newLinks);
  };

  const handleUsernameChange = (platform: string, username: string) => {
    const newLinks = links.map(link => {
      if (link.platform !== platform) return link;
      
      let url = '';
      switch (platform) {
        case 'twitter':
          url = username ? `https://twitter.com/${username}` : '';
          break;
        case 'linkedin':
          url = username ? `https://linkedin.com/${username}` : '';
          break;
        case 'instagram':
          url = username ? `https://instagram.com/${username}` : '';
          break;
        case 'youtube':
          url = username ? `https://youtube.com/${username}` : '';
          break;
        case 'discord':
          url = username ? `https://discord.com/users/${username}` : '';
          break;
        case 'twitch':
          url = username ? `https://twitch.tv/${username}` : '';
          break;
        case 'dev':
          url = username ? `https://dev.to/${username}` : '';
          break;
        case 'medium':
          url = username ? `https://medium.com/${username}` : '';
          break;
        case 'hashnode':
          url = username ? `https://hashnode.com/${username}` : '';
          break;
        case 'stackoverflow':
          url = username ? `https://stackoverflow.com/${username}` : '';
          break;
        case 'email':
          url = username ? `mailto:${username}` : '';
          break;
        case 'website':
          url = username.startsWith('http') ? username : `https://${username}`;
          break;
        default:
          url = username;
      }
      
      return { ...link, username, url };
    });
    updateLinks(newLinks);
  };

  const enabledCount = links.filter(l => l.enabled && l.username).length;
  const visibleLinks = isExpanded ? links : links.slice(0, 6);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return Twitter;
      case 'linkedin': return Linkedin;
      case 'instagram': return Instagram;
      case 'youtube': return Youtube;
      case 'website': return Globe;
      case 'email': return Mail;
      default: return ExternalLink;
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">Redes Sociales</h3>
          {enabledCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
              {enabledCount} activas
            </span>
          )}
        </div>
        {detectedTwitter || detectedBlog ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" />
            Auto-detectado
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleLinks.map((link) => {
          const platformInfo = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
          const Icon = getPlatformIcon(link.platform);
          
          return (
            <div
              key={link.platform}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                link.enabled 
                  ? "bg-card border-primary/50 shadow-sm" 
                  : "bg-card/50 border-border/50 opacity-60 hover:opacity-100"
              )}
            >
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ backgroundColor: `${link.color}20` }}
              >
                <Icon 
                  className="h-4 w-4" 
                  style={{ color: link.color }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs font-medium text-foreground">
                    {platformInfo?.name}
                  </Label>
                  <Switch
                    checked={link.enabled}
                    onCheckedChange={() => handleToggle(link.platform)}
                    className="scale-75"
                  />
                </div>
                <Input
                  type="text"
                  placeholder={platformInfo?.placeholder}
                  value={link.username}
                  onChange={(e) => handleUsernameChange(link.platform, e.target.value)}
                  disabled={!link.enabled}
                  className="h-7 text-xs bg-background/50 border-border/50"
                />
              </div>
            </div>
          );
        })}
      </div>

      {links.length > 6 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? 'Mostrar menos' : `Mostrar ${links.length - 6} más`}
          <Plus className={cn("h-4 w-4 ml-1 transition-transform", isExpanded && "rotate-45")} />
        </Button>
      )}

      {enabledCount > 0 && (
        <div className="pt-3 border-t border-border/50">
          <Label className="text-xs text-muted-foreground mb-2 block">Vista previa de badges</Label>
          <div className="flex flex-wrap gap-2">
            {links.filter(l => l.enabled && l.username).map((link) => {
              const platformInfo = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: `${link.color}20`,
                    color: link.color,
                    border: `1px solid ${link.color}40`
                  }}
                >
                  <img 
                    src={`https://img.shields.io/badge/-${encodeURIComponent(platformInfo?.name || link.platform)}-${link.color.replace('#', '')}?style=flat&logo=${link.icon}&logoColor=white`}
                    alt={platformInfo?.name}
                    className="h-5"
                  />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
