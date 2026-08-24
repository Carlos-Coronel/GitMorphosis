import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, '.') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8', reporter: ['text', 'json-summary'],
      include: ['lib/application/**/*.ts', 'lib/infrastructure/github-api.ts', 'lib/utils/export-bundle.ts'],
      thresholds: { lines: 75, functions: 80, statements: 75, branches: 60 },
    },
  },
});
