# Tooling: env, dependencies, scripts, hooks, CI

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

## Commands

| Command                                                        | Does                                                                                     |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `yarn dev:web` / `dev:app` / `dev:admin`                       | Dev servers on 4200 / 4300 / 4400                                                        |
| `yarn verify`                                                  | Format check, `check:arch`, lint, typecheck, tests, builds for every project             |
| `yarn nx affected -t lint typecheck test build`                | The same, only for what changed since `qa`                                               |
| `yarn check:arch`                                              | Architecture rules ESLint can't express; each error names its reference                  |
| `yarn gen:resource <kebab-plural> --entity <Pascal> [--admin]` | Scaffold an API resource (`data.md`)                                                     |
| `yarn generate:api-types`                                      | Regenerate `libs/models/src/lib/generated/api.ts` from `../grov-be/openapi/openapi.json` |
| `yarn generate:permissions`                                    | Regenerate permission keys from `GET /v1/admin/permissions` (needs `ADMIN_ACCESS_TOKEN`) |
| `yarn sync:tokens`                                             | Copy design tokens from `../requirements/design/system`                                  |

Targets live in each `project.json` (`nx:run-commands`) and are cached by Nx (`nx.json` → `targetDefaults`). A new app or lib copies an existing project's `package.json`, `project.json`, `tsconfig.json` and `vitest.config.ts`, gets a `type:*` tag, and is added to `tsconfig.base.json` paths (libs).

## Environment

Vite reads `apps/<app>/.env.local` (copy `.env.example`). All `VITE_*` values are public. Add a variable in `libs/models/src/lib/config.ts` (with a default) and `.env.example` **[enforced: `check:arch` env-access, env-documented]**.

## Dependencies

- Yarn 4, committed at `.yarn/releases` (`nodeLinker: node-modules`). CI installs with `--immutable` **[enforced]**. Install scripts of dependencies are disabled by Yarn's defaults; keep it that way.
- Ask before adding one (CONTRIBUTING §5). Prefer what's here: radix-ui, lucide-react, TanStack Query, zustand, react-hook-form + zod, date-fns, sonner, class-variance-authority, axios (inside `@grov/api` only).
- Banned, with replacements, in `eslint.config.mjs` **[enforced]**: moment, moment-timezone, formik, yup, js-cookie, crypto-js, lodash, classnames, react-router-dom, `@radix-ui/*`.
- Root `package.json` holds versions; each app/lib `package.json` lists what it uses (`workspace:*` for internal libs).

## Git hooks and CI

- pre-commit: lint-staged (ESLint fix + Prettier on staged files) **[enforced]**.
- commit-msg: commitlint, Conventional Commits with project scopes **[enforced]**.
- pre-push: `check:arch` + affected lint, typecheck, tests against `origin/qa` **[enforced]**.
- CI (`.github/workflows/ci.yml`, PRs and pushes to `qa`, `uat`, `main`): install, commit messages, format, `check:arch`, affected lint/typecheck/test/build **[enforced]**.
- Claude reviews every PR against CONTRIBUTING, AGENTS and this skill (`.github/workflows/claude-code-review.yml`; needs the `CLAUDE_CODE_OAUTH_TOKEN` secret).
- Never `--no-verify`; never loosen lint, `check:arch`, tsconfig or CI to pass.
