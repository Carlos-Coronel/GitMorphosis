// Export utilities for README generation

/**
 * Convert markdown to plain text
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Convert links to just text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headers markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove horizontal rules
    .replace(/^---$/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generate badge markdown
 */
export function generateBadge(
  label: string,
  message: string,
  color: string,
  style: 'flat' | 'flat-square' | 'plastic' | 'for-the-badge' = 'for-the-badge'
): string {
  const encodedLabel = encodeURIComponent(label);
  const encodedMessage = encodeURIComponent(message);
  const cleanColor = color.replace('#', '');
  
  return `![${label}](https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${cleanColor}?style=${style})`;
}

/**
 * Generate GitHub stats card URL
 */
export function generateStatsUrl(
  username: string,
  options: {
    theme?: string;
    showIcons?: boolean;
    hideBorder?: boolean;
    countPrivate?: boolean;
  } = {}
): string {
  const {
    theme = 'dark',
    showIcons = true,
    hideBorder = true,
    countPrivate = false,
  } = options;
  
  const params = new URLSearchParams({
    username,
    theme,
    show_icons: String(showIcons),
    hide_border: String(hideBorder),
    count_private: String(countPrivate),
  });
  
  return `https://github-readme-stats.vercel.app/api?${params.toString()}`;
}

/**
 * Generate top languages card URL
 */
export function generateTopLangsUrl(
  username: string,
  options: {
    theme?: string;
    layout?: 'compact' | 'normal';
    hideBorder?: boolean;
    langsCount?: number;
  } = {}
): string {
  const {
    theme = 'dark',
    layout = 'compact',
    hideBorder = true,
    langsCount = 8,
  } = options;
  
  const params = new URLSearchParams({
    username,
    theme,
    layout,
    hide_border: String(hideBorder),
    langs_count: String(langsCount),
  });
  
  return `https://github-readme-stats.vercel.app/api/top-langs/?${params.toString()}`;
}

/**
 * Generate streak stats URL
 */
export function generateStreakUrl(
  username: string,
  options: {
    theme?: string;
    hideBorder?: boolean;
  } = {}
): string {
  const { theme = 'dark', hideBorder = true } = options;
  
  const params = new URLSearchParams({
    user: username,
    theme,
    hide_border: String(hideBorder),
  });
  
  return `https://github-readme-streak-stats.herokuapp.com/?${params.toString()}`;
}

/**
 * Generate repo card URL
 */
export function generateRepoCardUrl(
  username: string,
  repoName: string,
  options: {
    theme?: string;
    hideBorder?: boolean;
    showOwner?: boolean;
  } = {}
): string {
  const { theme = 'dark', hideBorder = true, showOwner = false } = options;
  
  const params = new URLSearchParams({
    username,
    repo: repoName,
    theme,
    hide_border: String(hideBorder),
    show_owner: String(showOwner),
  });
  
  return `https://github-readme-stats.vercel.app/api/pin/?${params.toString()}`;
}

/**
 * Generate activity graph URL
 */
export function generateActivityGraphUrl(
  username: string,
  options: {
    theme?: string;
    hideBorder?: boolean;
  } = {}
): string {
  const { theme = 'tokyo-night', hideBorder = true } = options;
  
  const params = new URLSearchParams({
    username,
    theme,
    hide_border: String(hideBorder),
  });
  
  return `https://github-readme-activity-graph.vercel.app/graph?${params.toString()}`;
}

/**
 * Generate trophy URL
 */
export function generateTrophyUrl(
  username: string,
  options: {
    theme?: string;
    noFrame?: boolean;
    row?: number;
    column?: number;
  } = {}
): string {
  const { theme = 'tokyonight', noFrame = true, row = 1, column = 7 } = options;
  
  const params = new URLSearchParams({
    username,
    theme,
    no_frame: String(noFrame),
    row: String(row),
    column: String(column),
  });
  
  return `https://github-profile-trophy.vercel.app/?${params.toString()}`;
}

/**
 * Generate profile views counter URL
 */
export function generateProfileViewsUrl(
  username: string,
  style: 'flat' | 'flat-square' | 'plastic' = 'flat-square'
): string {
  return `https://komarev.com/ghpvc/?username=${username}&style=${style}`;
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return String(num);
}

/**
 * Generate social links section
 */
export function generateSocialLinks(links: {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  email?: string;
}): string {
  const badges: string[] = [];
  
  if (links.github) {
    badges.push(`[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/${links.github})`);
  }
  if (links.twitter) {
    badges.push(`[![Twitter](https://img.shields.io/badge/-Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/${links.twitter})`);
  }
  if (links.linkedin) {
    badges.push(`[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/${links.linkedin})`);
  }
  if (links.website) {
    badges.push(`[![Website](https://img.shields.io/badge/-Website-FF7139?style=for-the-badge&logo=firefox&logoColor=white)](${links.website})`);
  }
  if (links.email) {
    badges.push(`[![Email](https://img.shields.io/badge/-Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:${links.email})`);
  }
  
  return badges.join('\n');
}
