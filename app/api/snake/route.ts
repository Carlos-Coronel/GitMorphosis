import { NextRequest, NextResponse } from 'next/server';
import { generateSnakeSvg } from '@/lib/client/svg/snake-card';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const theme = searchParams.get('theme') || 'tokyonight';
  
  if (!username) {
    return new NextResponse('Username is required', { status: 400 });
  }

  try {
    const svg = generateSnakeSvg({
      username,
      theme,
      hideBorder: searchParams.get('hide_border') === 'true'
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating snake:', error);
    return new NextResponse('Error generating snake', { status: 500 });
  }
}
