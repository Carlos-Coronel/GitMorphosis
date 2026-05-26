// Extractor GitHub - Capa de Infraestructura
// Implementa Patrón Adapter para extraer perfiles de GitHub sin usar la API oficial

import {
  GitHubUser,
  Repository,
  LanguageStats,
  ContributionStats,
  ScrapingError,
  ProfileNotFoundError,
  LANGUAGE_COLORS,
} from '@/lib/domain/types';

// Interfaz del Extractor (Puerto)
export interface IGitHubScraper {
  scrapeUserProfile(username: string): Promise<GitHubUser>;
  scrapeRepositories(username: string, limit?: number): Promise<Repository[]>;
  scrapeLanguageStats(username: string): Promise<LanguageStats[]>;
  scrapePinnedRepos(username: string): Promise<Repository[]>;
  scrapeContributions(username: string): Promise<ContributionStats>;
}

// Utilidades de análisis HTML
function extractText(html: string, selector: string): string | null {
  // Extracción simple basada en regex para análisis del lado del servidor
  const patterns: Record<string, RegExp> = {
    'name': /<span[^>]*itemprop="name"[^>]*>([^<]+)<\/span>/i,
    'bio': /<div[^>]*class="[^"]*user-profile-bio[^"]*"[^>]*>([^<]+)<\/div>/i,
    'location': /<span[^>]*itemprop="homeLocation"[^>]*>([^<]+)<\/span>/i,
    'company': /<span[^>]*itemprop="worksFor"[^>]*>([^<]+)<\/span>/i,
    'blog': /<a[^>]*itemprop="url"[^>]*href="([^"]+)"[^>]*>/i,
    'twitter': /<a[^>]*href="https:\/\/twitter\.com\/([^"]+)"[^>]*>/i,
  };
  
  const pattern = patterns[selector];
  if (!pattern) return null;
  
  const match = html.match(pattern);
  return match ? match[1].trim() : null;
}

function extractNumber(text: string): number {
  if (!text) return 0;
  const cleaned = text.replace(/,/g, '').trim();
  const match = cleaned.match(/(\d+(?:\.\d+)?)(k|m)?/i);
  if (!match) return 0;
  
  let num = parseFloat(match[1]);
  const suffix = match[2]?.toLowerCase();
  if (suffix === 'k') num *= 1000;
  if (suffix === 'm') num *= 1000000;
  return Math.round(num);
}

// Implementación del Extractor GitHub (Adapter)
export class GitHubScraper implements IGitHubScraper {
  private baseUrl = 'https://github.com';
  
  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
        },
        next: { revalidate: 300 }, // Caché por 5 minutos
      });
      
      if (response.status === 404) {
        throw new ProfileNotFoundError(url);
      }
      
      if (!response.ok) {
        throw new ScrapingError(
          `Failed to fetch page: ${response.statusText}`,
          response.status,
          url
        );
      }
      
      return response.text();
    } catch (error) {
      if (error instanceof ProfileNotFoundError || error instanceof ScrapingError) {
        throw error;
      }
      throw new ScrapingError(`Network error fetching ${url}: ${error}`, undefined, url);
    }
  }
  
  async scrapeUserProfile(username: string): Promise<GitHubUser> {
    const url = `${this.baseUrl}/${username}`;
    const html = await this.fetchPage(url);
    
    // Extract avatar URL
    const avatarMatch = html.match(/<img[^>]*class="[^"]*avatar[^"]*"[^>]*src="([^"]+)"/i);
    const avatarUrl = avatarMatch ? avatarMatch[1].split('?')[0] : null;
    
    // Extract name
    const nameMatch = html.match(/<span[^>]*class="[^"]*vcard-fullname[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                      html.match(/<span[^>]*itemprop="name"[^>]*>([^<]+)<\/span>/i);
    const name = nameMatch ? nameMatch[1].trim() : null;
    
    // Extract bio
    let bio: string | null = null;
    const dataBioMatch = html.match(/data-bio-text="([^"]*)"/i);
    if (dataBioMatch) {
      bio = dataBioMatch[1].trim() || null;
    } else {
      const bioBlockMatch = html.match(/<div[^>]*class="[^"]*user-profile-bio[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      if (bioBlockMatch) {
        bio = bioBlockMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || null;
      }
    }
    
    // Extract location
    let location: string | null = null;
    const locationBlockMatch = html.match(/<li[^>]*itemprop="homeLocation"[^>]*>([\s\S]*?)<\/li>/i);
    if (locationBlockMatch) {
      location = locationBlockMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || null;
    }
    
    // Extract company
    let company: string | null = null;
    const companyBlockMatch = html.match(/<li[^>]*itemprop="worksFor"[^>]*>([\s\S]*?)<\/li>/i);
    if (companyBlockMatch) {
      company = companyBlockMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || null;
    }
    
    // Extract social links
    const socialLinks: { platform: string; url: string; username: string }[] = [];
    
    // Pattern for social links in the vcard
    const socialPattern = /<li[^>]*itemprop="social"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let socialMatch;
    
    while ((socialMatch = socialPattern.exec(html)) !== null) {
      const href = socialMatch[1];
      const text = socialMatch[2].replace(/<[^>]*>/g, '').trim();
      
      let platform = 'website';
      let socialUsername = text || href;
      
      const lowerHref = href.toLowerCase();
      if (lowerHref.includes('twitter.com') || lowerHref.includes('x.com')) {
        platform = 'twitter';
        socialUsername = href.split('/').filter(Boolean).pop()?.split('?')[0] || text;
      } else if (lowerHref.includes('linkedin.com')) {
        platform = 'linkedin';
        socialUsername = href.split('/').filter(Boolean).pop()?.split('?')[0] || text;
      } else if (lowerHref.includes('instagram.com')) {
        platform = 'instagram';
        socialUsername = href.split('/').filter(Boolean).pop()?.split('?')[0] || text;
      } else if (lowerHref.includes('youtube.com')) {
        platform = 'youtube';
        socialUsername = href.split('/').filter(Boolean).pop()?.split('?')[0] || text;
      } else if (lowerHref.includes('twitch.tv')) {
        platform = 'twitch';
        socialUsername = href.split('/').filter(Boolean).pop()?.split('?')[0] || text;
      } else if (lowerHref.includes('dev.to')) {
        platform = 'dev';
        socialUsername = href.split('/').filter(Boolean).pop()?.split('?')[0] || text;
      } else if (lowerHref.includes('medium.com')) {
        platform = 'medium';
        socialUsername = href.split('/').filter(Boolean).pop()?.split('?')[0] || text;
      } else if (lowerHref.includes('facebook.com')) {
        platform = 'facebook';
        socialUsername = href.split('/').filter(Boolean).pop()?.split('?')[0] || text;
      }
      
      if (!socialLinks.find(l => l.url === href)) {
        socialLinks.push({ platform, url: href, username: socialUsername });
      }
    }
    
    // Fallback for blog/website if not caught by itemprop="social"
    if (!socialLinks.find(l => l.platform === 'website')) {
      const blogMatch = html.match(/<li[^>]*itemprop="url"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/i) ||
                        html.match(/<a[^>]*rel="nofollow me"[^>]*href="([^"]+)"[^>]*>/i);
      if (blogMatch) {
        socialLinks.push({ platform: 'website', url: blogMatch[1], username: blogMatch[1] });
      }
    }
    
    const blog = socialLinks.find(l => l.platform === 'website')?.url || null;
    const twitterUsername = socialLinks.find(l => l.platform === 'twitter')?.username || null;
    
    // Extract follower/following counts
    const followersMatch = html.match(/<a[^>]*href="[^"]*followers[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i) ||
                          html.match(/(\d+(?:\.\d+)?[km]?)\s*followers/i);
    const followers = followersMatch ? extractNumber(followersMatch[1]) : 0;
    
    const followingMatch = html.match(/<a[^>]*href="[^"]*following[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i) ||
                          html.match(/(\d+(?:\.\d+)?[km]?)\s*following/i);
    const following = followingMatch ? extractNumber(followingMatch[1]) : 0;
    
    // Extract public repos count
    const reposMatch = html.match(/Repositories\s*<span[^>]*title="(\d+)"/i) ||
                       html.match(/Repositories\s*<span[^>]*class="[^"]*Counter[^"]*"[^>]*>(\d+)<\/span>/i) ||
                       html.match(/href="[^"]*tab=repositories"[^>]*>[\s\S]*?<span[^>]*class="[^"]*Counter[^"]*"[^>]*>(\d+)<\/span>/i) ||
                       html.match(/<span[^>]*class="[^"]*Counter[^"]*"[^>]*title="(\d+)"[^>]*>/i);
    const publicRepos = reposMatch ? parseInt(reposMatch[1], 10) : 0;
    
    return {
      username,
      name,
      bio,
      avatarUrl,
      location,
      company,
      blog,
      twitterUsername,
      followers,
      following,
      publicRepos,
      profileUrl: url,
      socialLinks,
    };
  }
  
  async scrapeRepositories(username: string, limit: number = 30): Promise<Repository[]> {
    const url = `${this.baseUrl}/${username}?tab=repositories&sort=stargazers`;
    const html = await this.fetchPage(url);
    
    const repositories: Repository[] = [];
    
    // Match repository items
    const repoPattern = /<li[^>]*itemprop="owns"[^>]*>[\s\S]*?<\/li>/gi;
    const repoMatches = html.match(repoPattern) || [];
    
    for (const repoHtml of repoMatches.slice(0, limit)) {
      // Extract repo name
      const nameMatch = repoHtml.match(/<a[^>]*itemprop="name codeRepository"[^>]*>([^<]+)<\/a>/i) ||
                        repoHtml.match(/<a[^>]*href="\/[^\/]+\/([^"\/]+)"[^>]*itemprop/i);
      if (!nameMatch) continue;
      
      const name = nameMatch[1].trim();
      
      // Extract description
      const descMatch = repoHtml.match(/<p[^>]*itemprop="description"[^>]*>([^<]+)<\/p>/i);
      const description = descMatch ? descMatch[1].trim() : null;
      
      // Extract language
      const langMatch = repoHtml.match(/<span[^>]*itemprop="programmingLanguage"[^>]*>([^<]+)<\/span>/i);
      const language = langMatch ? langMatch[1].trim() : null;
      
      // Extract stars
      const starsAnchorMatch = repoHtml.match(/<a[^>]*href="[^"]*\/stargazers"[^>]*>([\s\S]*?)<\/a>/i);
      const stars = starsAnchorMatch ? extractNumber(starsAnchorMatch[1].replace(/<[^>]*>/g, '')) : 0;
      
      // Extract forks
      const forksAnchorMatch = repoHtml.match(/<a[^>]*href="[^"]*\/forks"[^>]*>([\s\S]*?)<\/a>/i);
      const forks = forksAnchorMatch ? extractNumber(forksAnchorMatch[1].replace(/<[^>]*>/g, '')) : 0;
      
      // Check if forked
      const isForked = repoHtml.includes('Forked from');
      
      // Extract topics
      const topicsPattern = /topic-tag[^>]*>([^<]+)<\/a>/gi;
      const topics: string[] = [];
      let topicMatch;
      while ((topicMatch = topicsPattern.exec(repoHtml)) !== null) {
        topics.push(topicMatch[1].trim());
      }
      
      // Extract updated date
      const updatedMatch = repoHtml.match(/<relative-time[^>]*datetime="([^"]+)"/i);
      const updatedAt = updatedMatch ? updatedMatch[1] : null;
      
      repositories.push({
        name,
        description,
        language,
        stars,
        forks,
        url: `${this.baseUrl}/${username}/${name}`,
        isForked,
        updatedAt,
        topics,
      });
    }
    
    return repositories;
  }
  
  async scrapeLanguageStats(username: string): Promise<LanguageStats[]> {
    // Scrape from repositories to aggregate language stats
    const repos = await this.scrapeRepositories(username, 100);
    
    const languageCounts: Record<string, number> = {};
    let totalRepos = 0;
    
    for (const repo of repos) {
      if (repo.language && !repo.isForked) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        totalRepos++;
      }
    }
    
    if (totalRepos === 0) return [];
    
    return Object.entries(languageCounts)
      .map(([language, count]) => ({
        language,
        percentage: Math.round((count / totalRepos) * 100),
        color: LANGUAGE_COLORS[language] || '#858585',
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10);
  }
  
  async scrapePinnedRepos(username: string): Promise<Repository[]> {
    const url = `${this.baseUrl}/${username}`;
    const html = await this.fetchPage(url);
    
    const pinnedRepos: Repository[] = [];
    
    // Match pinned items section
    const pinnedPattern = /<div[^>]*class="[^"]*pinned-item-list-item[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi;
    const pinnedMatches = html.match(pinnedPattern) || [];
    
    for (const pinnedHtml of pinnedMatches) {
      // Extract repo name
      const nameMatch = pinnedHtml.match(/<span[^>]*class="[^"]*repo[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                        pinnedHtml.match(/<a[^>]*href="\/[^\/]+\/([^"\/]+)"[^>]*>/i);
      if (!nameMatch) continue;
      
      const name = nameMatch[1].trim();
      
      // Extract description
      const descMatch = pinnedHtml.match(/<p[^>]*class="[^"]*pinned-item-desc[^"]*"[^>]*>([^<]+)<\/p>/i);
      const description = descMatch ? descMatch[1].trim() : null;
      
      // Extract language
      const langMatch = pinnedHtml.match(/<span[^>]*itemprop="programmingLanguage"[^>]*>([^<]+)<\/span>/i);
      const language = langMatch ? langMatch[1].trim() : null;
      
      // Extract stars
      const starsAnchorMatch = pinnedHtml.match(/<a[^>]*href="[^"]*\/stargazers"[^>]*>([\s\S]*?)<\/a>/i);
      const stars = starsAnchorMatch ? extractNumber(starsAnchorMatch[1].replace(/<[^>]*>/g, '')) : 0;
      
      // Extract forks
      const forksAnchorMatch = pinnedHtml.match(/<a[^>]*href="[^"]*\/forks"[^>]*>([\s\S]*?)<\/a>/i);
      const forks = forksAnchorMatch ? extractNumber(forksAnchorMatch[1].replace(/<[^>]*>/g, '')) : 0;
      
      pinnedRepos.push({
        name,
        description,
        language,
        stars,
        forks,
        url: `${this.baseUrl}/${username}/${name}`,
        isForked: false,
        updatedAt: null,
        topics: [],
      });
    }
    
    return pinnedRepos;
  }
  
  async scrapeContributions(username: string): Promise<ContributionStats> {
    // Nota: Los datos del calendario de contribuciones requieren renderización JavaScript
    // Por ahora, devolvemos estadísticas estimadas basadas en la actividad del repositorio
    const repos = await this.scrapeRepositories(username, 50);
    
    // Estimar contribuciones basado en actividad reciente
    const recentRepos = repos.filter(r => {
      if (!r.updatedAt) return false;
      const updated = new Date(r.updatedAt);
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return updated > yearAgo;
    });
    
    return {
      totalContributions: recentRepos.length * 50, // Estimación aproximada
      currentStreak: Math.min(recentRepos.length * 5, 30),
      longestStreak: Math.min(recentRepos.length * 10, 100),
      contributionsByDay: {},
    };
  }
}

// Fábrica para crear extractores (Patrón Factory)
export function createGitHubScraper(): IGitHubScraper {
  return new GitHubScraper();
}
