import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { profileFixture } from './fixtures/profile';

const mocks = vi.hoisted(() => ({
  fetchGitHubProfile: vi.fn(),
  getStoredToken: vi.fn(() => null),
}));

vi.mock('@/lib/infrastructure/github-api', () => ({
  fetchGitHubProfile: mocks.fetchGitHubProfile,
  getStoredToken: mocks.getStoredToken,
}));

import { useProfileGenerator } from '@/hooks/use-profile-generator';

describe('orquestación del generador', () => {
  beforeEach(() => {
    mocks.fetchGitHubProfile.mockImplementation(async (username: string) => ({
      ...structuredClone(profileFixture),
      user: { ...structuredClone(profileFixture.user), username },
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    mocks.fetchGitHubProfile.mockReset();
  });

  it('no arrastra enlaces sociales ni regeneraciones pendientes al cambiar de usuario', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useProfileGenerator());

    await act(async () => result.current.handleGenerate('first-user'));
    act(() => result.current.updateConfig({
      socialLinks: [{ platform: 'linkedin', username: 'first', url: 'https://linkedin.com/in/first', color: '#00f', enabled: true }],
    }));
    await act(async () => result.current.handleGenerate('second-user'));
    await act(async () => vi.runAllTimersAsync());

    expect(result.current.result?.profile.user.username).toBe('second-user');
    expect(result.current.result?.profile.user.socialLinks).toBeUndefined();
    expect(result.current.result?.markdown).not.toContain('linkedin.com/in/first');
    expect(mocks.fetchGitHubProfile).toHaveBeenCalledTimes(2);
  });
});
