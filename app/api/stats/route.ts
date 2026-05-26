import { NextRequest, NextResponse } from 'next/server';
import { createGitHubScraper } from '@/lib/infrastructure/scraping/github-scraper';
import { generateStatsCardSvg } from '@/lib/client/svg/stats-card';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const theme = searchParams.get('theme') || 'tokyonight';
  
  if (!username) {
    return new NextResponse('Username is required', { status: 400 });
  }

  try {
    const scraper = createGitHubScraper();
    const user = await scraper.scrapeUserProfile(username);
    const repos = await scraper.scrapeRepositories(username, 100);
    
    const totalStars = repos.reduce((acc, r) => acc + r.stars, 0);

    const svg = generateStatsCardSvg({
      username,
      theme,
      stars: totalStars,
      commits: user.publicRepos * 30,
      prs: user.publicRepos * 5,
      issues: user.publicRepos * 2,
      followers: user.followers,
      repos: user.publicRepos,
      hideBorder: searchParams.get('hide_border') === 'true',
      showIcons: searchParams.get('show_icons') !== 'false'
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating stats:', error);
    return new NextResponse('Error generating stats', { status: 500 });
  }
}
