import {reactRouter} from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  server: {port: 4400, strictPort: true},
  envDir: __dirname,
});
