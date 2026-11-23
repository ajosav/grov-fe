import type {Config} from '@react-router/dev/config';

// Public marketing site: no server at runtime. Every route is prerendered to
// static HTML at build time so crawlers and slow connections get real content.
export default {
  ssr: false,
  prerender: ['/'],
} satisfies Config;
