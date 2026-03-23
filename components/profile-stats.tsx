'use client';

import { GitFork, Star, Users, FolderGit2, MapPin, Building2, Globe } from 'lucide-react';
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
    { label: 'Repositories', value: user.publicRepos, icon: FolderGit2 },
    { label: 'Followers', value: user.followers, icon: Users },
    { label: 'Following', value: user.following, icon: Users },
  ];

  return (
    <div className="w-full space-y-6">
      {/* User Info Card */}
      <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
        {user.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={`${user.username}'s avatar`}
            className="h-16 w-16 rounded-full ring-2 ring-primary/20"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate">
            {user.name || user.username}
          </h3>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          {user.bio && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {user.location}
              </span>
            )}
            {user.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {user.company}
              </span>
            )}
            {user.blog && (
              <a 
                href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Globe className="h-3 w-3" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border border-border"
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xl font-bold text-foreground">{value.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Top Languages */}
      {topLanguages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Top Languages</h4>
          <div className="space-y-2">
            {topLanguages.slice(0, 5).map((lang) => (
              <div key={lang.language} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: lang.color }}
                    />
                    {lang.language}
                  </span>
                  <span className="text-muted-foreground">{lang.percentage}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
