import {defineConfig} from 'vitest/config';

// Root runner for `yarn test:coverage` and editors. Each project keeps its own
// `vitest.config.ts`; Nx runs them one by one with `yarn test`.
export default defineConfig({
  test: {
    projects: ['libs/*/vitest.config.ts', 'apps/*/vitest.config.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['libs/*/src/**/*.{ts,tsx}', 'apps/*/app/**/*.{ts,tsx}'],
      exclude: ['**/*.test.*', '**/__tests__/**', '**/generated/**', '**/*.d.ts'],
    },
  },
});
