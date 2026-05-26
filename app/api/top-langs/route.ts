import { NextRequest, NextResponse } from 'next/server';
import { createGitHubScraper } from '@/lib/infrastructure/scraping/github-scraper';
import { generateTopLangsCardSvg } from '@/lib/client/svg/top-langs-card';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const theme = searchParams.get('theme') || 'tokyonight';
  const layout = searchParams.get('layout') || 'compact';
  
  if (!username) {
    return new NextResponse('Username is required', { status: 400 });
  }

  try {
    const scraper = createGitHubScraper();
    const langs = await scraper.scrapeLanguageStats(username);

    const svg = generateTopLangsCardSvg({
      username,
      theme,
      languages: langs,
      layout: layout as 'compact' | 'normal',
      hideBorder: searchParams.get('hide_border') === 'true'
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating top langs:', error);
    return new NextResponse('Error generating top langs', { status: 500 });
  }
}
