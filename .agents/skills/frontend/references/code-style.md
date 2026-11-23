# Code style, configuration and logging

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

## Code style

- Prettier formats, ESLint lints; both run on commit **[enforced]**. Zero warnings (`--max-warnings=0`) **[enforced]**.
- TypeScript strict with `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, no unused locals/params **[enforced: typecheck]**. No `any` (use `unknown` and narrow) **[enforced]**; no non-null `!` — handle the `undefined`.
- Files and folders kebab-case (`create-role-dialog.tsx`, `use-countdown.ts`) **[enforced: `check:arch` file-naming]**. Components and types PascalCase; hooks `useX`; constants `SCREAMING_SNAKE` or `PascalCase` objects (`ErrorCode`, `PERMISSIONS`).
- Named exports only **[enforced]**. Default exports only for route modules, `root.tsx`, `routes.ts` and tool configs.
- Imports are sorted by Prettier: `react`, third party, `@grov/*`, relative **[enforced]**. Type-only imports use `import type` / inline `type` **[enforced]**.
- One component per file, unless the others are small private helpers of it. A file over ~250 lines is a signal to split.
- Comments explain _why_ and cite the decision (`D37`, `doc 10 §4.4`, `F7`) when a rule comes from the product docs. Don't comment what the code already says.
- `paths.*` for every in-app URL; never build the same path string twice.

## Product name

The product name is configuration (D65): `appConfig.brandName` in titles, copy and alt text **[enforced: `check:arch` brand-literal]**. Package scope `@grov/*` is code identity, not copy. The website keeps its marketing copy and wordmark files.

## Configuration

- Every runtime setting is a `VITE_*` variable read once in `libs/models/src/lib/config.ts` and exposed through `appConfig` **[enforced: `check:arch` env-access — no `import.meta.env` elsewhere]**. Give it a safe default and document it in `.env.example` **[enforced: `check:arch` env-documented]**.
- Everything in `VITE_*` ships to the browser. Never a secret.
- Values that come from the server (legal versions, feature flags, limits) are read from `GET /v1/config` (`useClientConfig`), not env.
- Business values (fees, cut-offs, limits) always come from the API; never hard-code them in the client.

## Logging

- `console.log` is banned **[enforced]**; `console.warn`/`console.error` only for real faults (the route error boundary logs unexpected errors).
- Never log API responses, tokens, emails, phones, addresses or health data.
- When an error tracker is added, it goes in `AppProviders` and scrubs PII before sending.
