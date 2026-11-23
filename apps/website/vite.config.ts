import {reactRouter} from '@react-router/dev/vite';
import {defineConfig} from 'vite';

// No Tailwind here: the website keeps its own hand-tuned CSS on the shared tokens.
export default defineConfig({
  plugins: [reactRouter()],
  server: {port: 4200, strictPort: true},
  envDir: __dirname,
});
