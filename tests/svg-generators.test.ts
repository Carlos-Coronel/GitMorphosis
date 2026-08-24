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

  it('mantiene una altura uniforme para proyectos con y sin descripción', () => {
    const empty = generatePinCardSvg({ username: 'octocat', repo: 'empty' });
    const described = generatePinCardSvg({ username: 'octocat', repo: 'full', description: 'Una descripción suficientemente larga para ocupar dos líneas dentro de la tarjeta del repositorio' });
    expect(empty).toContain('height="162"');
    expect(described).toContain('height="162"');
  });

  it('genera layouts móviles legibles y sin emojis dependientes del sistema', () => {
    const stats = generateStatsCardSvg({ username: 'octocat', layout: 'mobile' });
    const trophies = generateTrophyCardSvg({ layout: 'mobile', stats: { stars: 1, forks: 2, followers: 3, repos: 4, languages: 5, featured: 6 } });
    const languages = generateTopLangsCardSvg({ width: 340, layout: 'compact', languages: [{ language: 'TypeScript', percentage: 100, color: '#3178c6' }] });
    expect(stats).toContain('width="340" height="300"');
    expect(trophies).toContain('width="340" height="316"');
    expect(languages).toContain('width="340" height="160"');
    expect(trophies).not.toMatch(/[⭐👥📁⌨️◆⑂]/u);
  });

  it('usa la paleta accesible de GitHub en el tema claro', () => {
    const stats = generateStatsCardSvg({ username: 'octocat', theme: 'flat' });
    const project = generatePinCardSvg({ username: 'octocat', repo: 'hello', theme: 'flat' });
    const trophies = generateTrophyCardSvg({ theme: 'flat', stats: { stars: 1, forks: 2, followers: 3, repos: 4, languages: 5, featured: 6 } });
    expect(`${stats}${project}${trophies}`).toContain('#0969da');
    expect(`${stats}${project}${trophies}`).not.toContain('#2f80ed');
    expect(trophies).toContain('#bc4c00');
  });
});
