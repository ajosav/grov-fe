import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

// Tests do not load the React Router Vite plugin; they render route modules directly.
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  test: {
    name: 'admin',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['../../libs/test-utils/src/setup.ts'],
    include: ['app/**/*.test.{ts,tsx}'],
  },
});
