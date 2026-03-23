import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { markdown, username } = body;
    
    if (!markdown || typeof markdown !== 'string') {
      return NextResponse.json(
        { error: 'Markdown content is required', success: false },
        { status: 400 }
      );
    }
    
    const filename = `${username || 'profile'}-README.md`;
    
    // Return the markdown as a downloadable file
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[v0] Download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download', success: false },
      { status: 500 }
    );
  }
}
