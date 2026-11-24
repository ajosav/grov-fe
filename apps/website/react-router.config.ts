import type {Config} from '@react-router/dev/config';

// Public marketing site: no server at runtime. Every route is prerendered to
// static HTML at build time so crawlers and slow connections get real content.
export default {
  ssr: false,
  prerender: ['/'],
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
    v8_passThroughRequests: true,
    v8_trailingSlashAwareDataRequests: true,
  },
} satisfies Config;
