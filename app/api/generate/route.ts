import { NextRequest, NextResponse } from 'next/server';
import { createProfileService } from '@/lib/application/profile-service';
import { createReadmeBuilder } from '@/lib/application/readme-builder';
import { ProfileNotFoundError } from '@/lib/domain/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for scraping

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, templateId = 'portfolio', socialLinks, statsUrl, streakUrl, siteUrl: bodySiteUrl } = body;
    
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required', success: false },
        { status: 400 }
      );
    }
    
    const cleanUsername = username.trim();
    if (cleanUsername.length < 1 || cleanUsername.length > 39) {
      return NextResponse.json(
        { error: 'Invalid username length', success: false },
        { status: 400 }
      );
    }
    
    // Validate username format
    if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(cleanUsername)) {
      return NextResponse.json(
        { error: 'Invalid GitHub username format', success: false },
        { status: 400 }
      );
    }

    // Validate custom endpoints if provided
    if (statsUrl && typeof statsUrl === 'string' && !/^https?:\/\//i.test(statsUrl)) {
      return NextResponse.json(
        { error: 'Invalid stats URL format', success: false },
        { status: 400 }
      );
    }
    if (streakUrl && typeof streakUrl === 'string' && !/^https?:\/\//i.test(streakUrl)) {
      return NextResponse.json(
        { error: 'Invalid streak URL format', success: false },
        { status: 400 }
      );
    }
    
    const profileService = createProfileService();
    const readmeBuilder = createReadmeBuilder();
    
    // Validate template
    const templates = readmeBuilder.getAvailableTemplates();
    if (!templates.some(t => t.id === templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID', success: false },
        { status: 400 }
      );
    }
    
    // Get profile and generate README
    const profile = await profileService.getProfile(cleanUsername);
    
    // Merge manual social links if provided
    if (socialLinks && Array.isArray(socialLinks)) {
      profile.user.socialLinks = socialLinks;
    }

    // Use siteUrl from client if provided, otherwise derive from request headers
    const origin = bodySiteUrl || (
      request.headers.get('x-forwarded-proto')
        ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('host')}`
        : `http://${request.headers.get('host') || 'localhost:3000'}`
    );

    const result = readmeBuilder.build(profile, templateId, {
      statsUrl: statsUrl || undefined,
      streakUrl: streakUrl || undefined,
      siteUrl: origin,
    });

    
    return NextResponse.json({
      success: true,
      data: {
        markdown: result.markdown,
        templateId: result.templateId,
        generatedAt: result.generatedAt.toISOString(),
        profile: {
          user: profile.user,
          topLanguages: profile.topLanguages,
          repositoryCount: profile.repositories.length,
          pinnedCount: profile.pinnedRepos.length,
        },
      },
    });
  } catch (error) {
    console.error('[v0] README generation error:', error);
    
    if (error instanceof ProfileNotFoundError) {
      return NextResponse.json(
        { error: 'GitHub profile not found', success: false },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate README', success: false },
      { status: 500 }
    );
  }
}
