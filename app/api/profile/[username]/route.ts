import { NextRequest, NextResponse } from 'next/server';
import { createProfileService } from '@/lib/application/profile-service';
import { ProfileNotFoundError } from '@/lib/domain/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  
  if (!username || username.length < 1 || username.length > 39) {
    return NextResponse.json(
      { error: 'Invalid username' },
      { status: 400 }
    );
  }
  
  try {
    const profileService = createProfileService();
    const profile = await profileService.getProfile(username);
    
    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('[v0] Profile fetch error:', error);
    
    if (error instanceof ProfileNotFoundError) {
      return NextResponse.json(
        { error: 'GitHub profile not found', success: false },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profile', success: false },
      { status: 500 }
    );
  }
}
