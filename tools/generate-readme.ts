#!/usr/bin/env npx ts-node

/**
 * GitHub Profile README Generator - CLI Script
 * 
 * Usage:
 *   npx ts-node scripts/generate-readme.ts <username> [templateId]
 * 
 * Examples:
 *   npx ts-node scripts/generate-readme.ts torvalds
 *   npx ts-node scripts/generate-readme.ts gaearon portfolio
 *   npx ts-node scripts/generate-readme.ts octocat terminal
 * 
 * Available templates:
 *   - minimalist: Clean and simple profile
 *   - portfolio: Professional portfolio showcase
 *   - creative: Eye-catching with animations
 *   - terminal: Hacker-style terminal aesthetic
 */

import { createProfileService } from '../lib/application/profile-service';
import { createReadmeBuilder } from '../lib/application/readme-builder';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: npx ts-node scripts/generate-readme.ts <username> [templateId]');
    console.error('');
    console.error('Available templates: minimalist, portfolio, creative, terminal');
    process.exit(1);
  }
  
  const username = args[0];
  const templateId = args[1] || 'portfolio';
  
  console.log(`\n🔍 Fetching GitHub profile for: ${username}`);
  console.log(`📝 Using template: ${templateId}\n`);
  
  try {
    const profileService = createProfileService();
    const readmeBuilder = createReadmeBuilder();
    
    // Validate template
    const templates = readmeBuilder.getAvailableTemplates();
    if (!templates.some(t => t.id === templateId)) {
      console.error(`❌ Invalid template: ${templateId}`);
      console.error('Available templates:', templates.map(t => t.id).join(', '));
      process.exit(1);
    }
    
    console.log('⏳ Scraping profile data...');
    const profile = await profileService.getProfile(username);
    
    console.log(`✅ Found profile: ${profile.user.name || profile.user.username}`);
    console.log(`   📦 Repositories: ${profile.repositories.length}`);
    console.log(`   💻 Top Languages: ${profile.topLanguages.slice(0, 3).map(l => l.language).join(', ')}`);
    console.log(`   👥 Followers: ${profile.user.followers}`);
    
    console.log('\n⏳ Generating README...');
    const result = readmeBuilder.build(profile, templateId);
    
    // Save to file
    const outputPath = join(process.cwd(), `${username}-README.md`);
    writeFileSync(outputPath, result.markdown, 'utf-8');
    
    console.log(`\n✅ README generated successfully!`);
    console.log(`📄 Saved to: ${outputPath}`);
    console.log(`📏 Size: ${result.markdown.length} characters`);
    
    // Print preview
    console.log('\n--- Preview (first 500 chars) ---\n');
    console.log(result.markdown.slice(0, 500) + '...');
    console.log('\n---------------------------------\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
