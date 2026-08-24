import { describe, expect, it } from 'vitest';
import { generateStatsCardSvg } from '@/lib/application/svg/stats-card';
import { generateTopLangsCardSvg } from '@/lib/application/svg/top-langs-card';
import { generatePinCardSvg } from '@/lib/application/svg/pin-card';
import { generateTrophyCardSvg } from '@/lib/application/svg/trophy-card';
import { generateSnakeSvg } from '@/lib/application/svg/snake-card';

describe('generadores SVG', () => {
  it.each([
    ['stats', () => generateStatsCardSvg({ username: 'octocat', stars: 1 })],
    ['languages', () => generateTopLangsCardSvg({ languages: [{ language: 'TypeScript', percentage: 100, color: '#3178c6' }] })],
    ['project', () => generatePinCardSvg({ username: 'octocat', repo: 'hello', description: 'Demo' })],
    ['trophies', () => generateTrophyCardSvg({ stats: { stars: 1, forks: 2, followers: 3, repos: 4, languages: 5, featured: 6 } })],
    ['snake', () => generateSnakeSvg({ username: 'octocat' })],
  ])('produce un documento válido para %s', (_name, generate) => {
    const result = generate();
    expect(result.startsWith('<svg')).toBe(true);
    expect(result).toContain('</svg>');
    expect(result).not.toMatch(/<script|https?:\/\/(?!www\.w3\.org)/);
  });
});
