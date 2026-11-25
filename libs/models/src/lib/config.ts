const env = import.meta.env;

const read = (value: string | undefined, fallback: string): string =>
  value && value.trim().length > 0 ? value.trim() : fallback;

const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const brandName = read(env.VITE_BRAND_NAME, 'Grov');

export const appConfig = {
  brandName,
  apiBaseUrl: read(env.VITE_API_BASE_URL, 'http://localhost:3000').replace(/\/+$/, ''),
  cookiePrefix: read(env.VITE_COOKIE_PREFIX, slug(brandName)),
  googleClientId: read(env.VITE_GOOGLE_CLIENT_ID, ''),
  turnstileSiteKey: read(env.VITE_TURNSTILE_SITE_KEY, ''),
  appUrl: read(env.VITE_APP_URL, 'http://localhost:4300'),
  websiteUrl: read(env.VITE_WEBSITE_URL, 'http://localhost:4200').replace(/\/+$/, ''),
  mapStyleUrl: read(env.VITE_MAP_STYLE_URL, 'https://tiles.openfreemap.org/styles/positron'),
  mapStyleDarkUrl: read(env.VITE_MAP_STYLE_DARK_URL, 'https://tiles.openfreemap.org/styles/dark'),
  showDesignSystem: env.DEV || env.VITE_SHOW_DESIGN_SYSTEM === 'true',
} as const;

export type AppConfig = typeof appConfig;
