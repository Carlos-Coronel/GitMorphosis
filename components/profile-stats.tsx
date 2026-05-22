'use client';

import { GitFork, Star, Users, FolderGit2, MapPin, Building2, Globe, Twitter, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileStatsProps {
  user: {
    name: string | null;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    location: string | null;
    company: string | null;
    blog: string | null;
    twitterUsername?: string | null;
    followers: number;
    following: number;
    publicRepos: number;
  };
  topLanguages: {
    language: string;
    percentage: number;
    color: string;
  }[];
}

export function ProfileStats({ user, topLanguages }: ProfileStatsProps) {
  const stats = [
    { label: 'Repos', value: user.publicRepos, icon: FolderGit2 },
    { label: 'Seguidores', value: user.followers, icon: Users },
    { label: 'Siguiendo', value: user.following, icon: Users },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <div className="w-full space-y-6">
      {/* Tarjeta de Info del Usuario */}
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Header con gradiente */}
        <div className="h-16 bg-gradient-to-r from-primary/20 via-chart-2/20 to-chart-4/20 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
        </div>
        
        <div className="px-4 pb-4 -mt-8 relative">
          {/* Avatar */}
          {user.avatarUrl && (
            <div className="relative inline-block mb-3">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-md" />
              <img
                src={user.avatarUrl}
                alt={`Avatar de ${user.username}`}
                className="relative h-20 w-20 rounded-full ring-4 ring-card object-cover"
              />
              <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-green-500 ring-2 ring-card" />
            </div>
          )}
          
          {/* Nombre y username */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-foreground truncate">
              {user.name || user.username}
            </h3>
            <a 
              href={`https://github.com/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              @{user.username}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          
          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
              {user.bio}
            </p>
          )}
          
          {/* Meta información */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {user.location && (
              <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <MapPin className="h-3.5 w-3.5 text-primary/70" />
                {user.location}
              </span>
            )}
            {user.company && (
              <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Building2 className="h-3.5 w-3.5 text-primary/70" />
                {user.company.replace('@', '')}
              </span>
            )}
            {user.blog && (
              <a 
                href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                Sitio web
              </a>
            )}
            {user.twitterUsername && (
              <a 
                href={`https://twitter.com/${user.twitterUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#1DA1F2] hover:underline"
              >
                <Twitter className="h-3.5 w-3.5" />
                @{user.twitterUsername}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }, index) => (
          <div
            key={label}
            className={cn(
              "glass-card flex flex-col items-center gap-1.5 p-4 rounded-xl card-hover",
              "opacity-0 fade-in-up",
              index === 0 && "stagger-1",
              index === 1 && "stagger-2",
              index === 2 && "stagger-3"
            )}
          >
            <Icon className="h-5 w-5 text-primary/70" />
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {formatNumber(value)}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Lenguajes Principales */}
      {topLanguages.length > 0 && (
        <div className="glass-card p-4 rounded-xl space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Lenguajes Principales
          </h4>
          
          {/* Barra de distribución visual */}
          <div className="h-3 rounded-full overflow-hidden flex bg-muted/50">
            {topLanguages.slice(0, 5).map((lang, index) => (
              <div
                key={lang.language}
                className="h-full transition-all duration-500 hover:opacity-80"
                style={{
                  width: `${lang.percentage}%`,
                  backgroundColor: lang.color,
                  marginLeft: index > 0 ? '2px' : '0',
                }}
                title={`${lang.language}: ${lang.percentage}%`}
              />
            ))}
          </div>
          
          {/* Lista detallada */}
          <div className="space-y-3">
            {topLanguages.slice(0, 5).map((lang, index) => (
              <div 
                key={lang.language} 
                className={cn(
                  "space-y-1.5 opacity-0 fade-in-up",
                  `stagger-${index + 1}`
                )}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground font-medium">
                    <span
                      className="h-3 w-3 rounded-full ring-2 ring-offset-1 ring-offset-card"
                      style={{ 
                        backgroundColor: lang.color,
                        boxShadow: `0 0 8px ${lang.color}50`
                      }}
                    />
                    {lang.language}
                  </span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {lang.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                      boxShadow: `0 0 10px ${lang.color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Ver más lenguajes */}
          {topLanguages.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
              +{topLanguages.length - 5} lenguajes más
            </p>
          )}
        </div>
      )}
    </div>
  );
}
