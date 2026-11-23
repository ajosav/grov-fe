# grov-fe

Web frontends for Grov (working name, D65): the public website, the customer web app and the admin console, in one Nx monorepo with shared libraries. Backend: [`../grov-be`](../grov-be).

## Start

Requirements: Node 22 (`.nvmrc`). Yarn 4 is committed in `.yarn/releases`; use `corepack enable` or call `yarn` directly.

```bash
yarn install
cp .env.example apps/app/.env.local     # and apps/admin, apps/website
yarn dev:app                            # http://localhost:4300 (customer app)
yarn dev:admin                          # http://localhost:4400 (admin console)
yarn dev:web                            # http://localhost:4200 (website)
```

The apps talk to grov-be on `VITE_API_BASE_URL` (default `http://localhost:3000`). grov-be must allow the app origins (`CORS_ORIGINS`) and its cookie prefix must match `VITE_COOKIE_PREFIX`.

## Projects

| Project          | Path              |                                                                               |
| ---------------- | ----------------- | ----------------------------------------------------------------------------- |
| website          | `apps/website`    | Marketing site, prerendered static HTML                                       |
| app              | `apps/app`        | Customer web app: email-code and Google sign-in, account, theme               |
| admin            | `apps/admin`      | Admin console: password/Google sign-in, store switcher, roles and permissions |
| @grov/ui         | `libs/ui`         | Design tokens (light + dark), Tailwind theme, primitives                      |
| @grov/shared     | `libs/shared`     | Providers, auth screens and guards, permissions, layouts                      |
| @grov/hooks      | `libs/hooks`      | TanStack Query hooks                                                          |
| @grov/api        | `libs/api`        | HTTP client (cookies, CSRF, refresh), endpoints, query keys                   |
| @grov/store      | `libs/store`      | Zustand stores for client-only state                                          |
| @grov/models     | `libs/models`     | OpenAPI-generated types, permission keys, error codes, config                 |
| @grov/test-utils | `libs/test-utils` | Test setup, render helpers, fixtures                                          |

## Stack

React 19 · React Router 7 (framework mode; SPA for the apps, prerender for the website) · Vite 7 · TypeScript 5.9 (strict) · Tailwind CSS 4 on Grov tokens · radix-ui · TanStack Query 5 · Zustand 5 · react-hook-form + zod 4 · axios · Vitest 4 + Testing Library · ESLint 9 + Prettier 3 · Nx 21 · Yarn 4.

## Everyday commands

| Command                                         |                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `yarn verify`                                   | Everything CI checks: format, lint, typecheck, tests, builds                    |
| `yarn nx affected -t lint typecheck test build` | Only what your branch touched                                                   |
| `yarn generate:api-types`                       | Types from `../grov-be/openapi/openapi.json`                                    |
| `yarn generate:permissions`                     | Permission keys from the live API (see `tools/scripts/generate-permissions.ts`) |
| `yarn sync:tokens`                              | Design tokens from `../requirements/design/system`                              |

## Working in this repo

- [`CONTRIBUTING.md`](CONTRIBUTING.md): non-negotiables, git flow (`feature → qa → uat → main`), definition of done, dependencies.
- [`AGENTS.md`](AGENTS.md): the short version for coding agents.
- The `frontend` skill in [`.agents/skills/frontend`](.agents/skills/frontend/SKILL.md): one reference per topic (layout, code style, routing, data, state, auth, styling, components, forms, accessibility, security, website, testing, tooling). Rules marked **[enforced]** are checked by ESLint, `yarn check:arch`, typecheck, hooks or CI.
