import { NextResponse } from 'next/server';
import { createReadmeBuilder } from '@/lib/application/readme-builder';

export async function GET() {
  const readmeBuilder = createReadmeBuilder();
  const templates = readmeBuilder.getAvailableTemplates();
  
  return NextResponse.json({
    success: true,
    data: templates,
  });
}
