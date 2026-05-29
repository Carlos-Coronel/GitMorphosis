'use client';

import { useState, useEffect, useCallback } from 'react';
import { checkRateLimit } from '@/lib/infrastructure/github-api';

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  isAuthenticated: boolean;
}

export function useRateLimit() {
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);

  const refreshRateLimit = useCallback(async () => {
    try {
      const info = await checkRateLimit();
      setRateLimit({
        remaining: info.remaining,
        limit: info.limit,
        isAuthenticated: info.isAuthenticated,
      });
    } catch {
      // No crítico si falla
    }
  }, []);

  useEffect(() => {
    refreshRateLimit();
    const rateLimitInterval = setInterval(refreshRateLimit, 60000);

    return () => {
      clearInterval(rateLimitInterval);
    };
  }, [refreshRateLimit]);

  return {
    rateLimit,
    refreshRateLimit,
  };
}
