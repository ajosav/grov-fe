# Security and privacy in the browser

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

## Sessions and secrets

- Tokens live only in httpOnly cookies set by grov-be (`auth.md`). No token, refresh token, registration ticket, step-up grant or password ever goes into `localStorage`, `sessionStorage`, a store, the URL or a log.
- Browser storage is touched only by its owners (theme, device id, `createStore`) **[enforced: `check:arch` storage-access]**. Persisted stores hold non-sensitive UI state only.
- `js-cookie` and `crypto-js` are banned **[enforced]**: there is no safe client-side "encryption" with a key the browser has.
- `VITE_*` values are public. No API keys with write access, no secrets **[enforced in review; env read only through `appConfig`: `check:arch` env-access]**.
- Unsafe requests carry the CSRF token automatically (`@grov/api`). Never disable it or call the API outside the client.

## Untrusted content

- Never `dangerouslySetInnerHTML` **[enforced: `react/no-danger`]**. The one exception is the constant theme script in each `root.tsx`. Markdown or rich text from the API, if ever needed, goes through a sanitising renderer approved in review.
- Don't build URLs from user input without `encodeURIComponent`. External links opened in a new tab use `rel="noreferrer"`.
- Redirect targets from the URL (`redirectTo`) go through `safeRedirect()` (same-origin paths only).

## PII

- Show only what the screen needs; mask where the design does (account numbers, phones in confirmations).
- Health conditions, BVN and similar data are never cached beyond the query that shows them, never logged, never sent to analytics.
- Analytics and error tracking (when added) are wired once in `AppProviders`, receive no PII and respect consent.

## Third-party scripts

Only Google Identity Services today (sign-in). Adding any script, SDK or pixel needs review: what data it sees, where it loads from, and a Content-Security-Policy update.
