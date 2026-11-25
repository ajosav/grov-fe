# AGENTS.md — grov-fe

Grov web frontends: an Nx monorepo (Yarn 4) with three React 19 + React Router 7 apps (`apps/website` marketing site, `apps/app` customer app, `apps/admin` admin console) and shared libraries (`@grov/ui`, `shared`, `hooks`, `api`, `store`, `models`, `test-utils`). Backend: `../grov-be`. Product rules: `../requirements/design/docs/00-context-and-decisions.md` (D-numbers). Policy: `CONTRIBUTING.md`.

## Before you change code → use the `frontend` skill

Before adding or changing a route or page, component, style or token, form, API call or query hook, auth or permission check, store, website section, env variable, dependency or test — load the skill and only the reference it points you to:

- Claude Code: skill `frontend` (`.claude/skills/frontend`)
- Other agents: read `.agents/skills/frontend/SKILL.md`

New API resource: `yarn gen:resource <kebab-plural> --entity <Pascal> [--admin]` — never hand-roll the wiring.

Anything visual (colours, type, spacing, copy, a new screen): also read `../.claude/skills/grov-design/SKILL.md`. Its non-negotiables apply to every screen.

## Components: reuse, configure, then create

Before writing a component, search `@grov/ui`, `@grov/shared` and the other apps. In order: **use** an existing one; **configure** it with a prop or variant (`size`, `variant`, `tone`, a slot); **promote** it to a lib when a second app needs it; only then **create**. Never copy a component into another app, never fork a shared one to change its look, and never style its internals from the call site (`[&_button]:h-8`). `check:arch` fails on an app component that duplicates a `@grov/ui` / `@grov/shared` component or exists in two apps. Detail: `.agents/skills/frontend/references/components.md`.

## Always

- Dependencies flow app → shared → hooks → api/store → models; ui → models. Import libraries through `@grov/<lib>` only.
- Colours only through tokens; no palette colours or hex. Check light and dark.
- Server data through `@grov/hooks` (TanStack Query); HTTP only in `@grov/api`; types from `@grov/models` (generated).
- Money is integer kobo from the API; the client never computes totals the server owns.
- Copy from `ApiError.code` via `errorMessage()`; never show the server's `message`.
- `appConfig.brandName`, never the product name; `PERMISSIONS.*`, never a permission string.
- Shared components are configured through props/variants, not copied, forked or restyled from the call site.
- Named exports; default exports only for route modules and configs.

## Never

Edit generated files (`libs/models/src/lib/generated/`, `permission-keys.generated.ts`, `libs/ui/src/lib/styles/{tokens,theme}.css`); edit `eslint.config.mjs`, `tools/scripts/check-architecture.ts`, tsconfig or CI to make a check pass; use `--no-verify`; add a dependency without asking; store tokens or PII in browser storage; use `any`, `console.log`, `dangerouslySetInnerHTML`; make drive-by refactors.

## Done means

`yarn verify` passes (or `yarn check:arch && yarn nx affected -t lint typecheck test build` for the projects you touched) — run it and report the output. UI changes: say what you checked (light/dark, 360px, keyboard). Commits: `type(scope): subject`, scope = project.
