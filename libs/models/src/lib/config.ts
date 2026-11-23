/**
 * Public runtime configuration, read once from Vite env (`VITE_*`).
 * Everything here ships to the browser: never put secrets in VITE_* variables.
 *
 * The product name is configuration, never a literal (D65): read `appConfig.brandName`.
 */
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
  /** Must equal grov-be's `auth.cookiePrefix` (BRAND_NAME slugified with `_`). */
  cookiePrefix: read(env.VITE_COOKIE_PREFIX, slug(brandName)),
  googleClientId: read(env.VITE_GOOGLE_CLIENT_ID, ''),
  /** Cloudflare Turnstile site key; empty = no widget (grov-be must have TURNSTILE_SECRET_KEY unset too). */
  turnstileSiteKey: read(env.VITE_TURNSTILE_SITE_KEY, ''),
  appUrl: read(env.VITE_APP_URL, 'http://localhost:4300'),
  /** Public website, for legal links (Terms, Privacy). */
  websiteUrl: read(env.VITE_WEBSITE_URL, 'http://localhost:4200').replace(/\/+$/, ''),
  /** The component gallery at /design-system: always in local dev, opt-in elsewhere. */
  showDesignSystem: env.DEV || env.VITE_SHOW_DESIGN_SYSTEM === 'true',
} as const;

export type AppConfig = typeof appConfig;
