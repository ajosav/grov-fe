import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  test: {
    name: 'hooks',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['../test-utils/src/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
