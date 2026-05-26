'use client';

import { Analytics } from '@vercel/analytics/react';
import { useEffect, useState } from 'react';

export function AnalyticsWrapper() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Only render if NOT on GitHub Pages and NOT on localhost (optional)
    const isGitHubPages = window.location.hostname.includes('github.io');
    if (!isGitHubPages) {
      setShouldRender(true);
    }
  }, []);

  if (!shouldRender) return null;

  return <Analytics />;
}
