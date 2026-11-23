# Contributing to grov-fe

This policy applies to everyone who changes this codebase: engineers, reviewers and AI agents. Agents start from `AGENTS.md`. When the rules and the code disagree, raise it in the PR — don't silently follow either.

Rules marked **[enforced]** are checked by a tool (ESLint, `check:arch`, typecheck, hooks or CI). The rest are checked in review.

## 1. Non-negotiables

1. **The server is authoritative.** The client never computes totals, prices, balances, stock or states the API owns; it shows what grov-be returns.
2. **Money is integer kobo** from the API, shown with `formatNaira` / `<Money>`. No floats, no client-side arithmetic on money for display totals.
3. **Auth tokens never touch JavaScript.** They live in httpOnly cookies set by grov-be. Nothing secret in `localStorage`, `sessionStorage`, logs or `VITE_*` variables. **[enforced: `check:arch` storage-access, ESLint bans js-cookie / crypto-js]**
4. **Tokens, not colours.** Every colour comes from the design tokens, so dark mode works everywhere. **[enforced: ESLint palette rule, `check:arch` token-colors]**
5. **Dependencies flow one way:** app → shared → hooks → api / store → models; ui → models. Apps never import each other; libraries are used through their public index. **[enforced: `@nx/enforce-module-boundaries`, `check:arch` deep-import, lib-purity]**
6. **Server state lives in TanStack Query hooks in `@grov/hooks`; HTTP only in `@grov/api`.** **[enforced: `check:arch` query-hooks, http-client]**
7. **Types the API describes are generated, never hand-written** (`yarn generate:api-types`).
8. **The product name is configuration** (D65): `appConfig.brandName`. **[enforced: `check:arch` brand-literal]**
9. **Permission keys come from `PERMISSIONS`**, and the UI check is a courtesy: grov-be enforces every permission. **[enforced: `check:arch` permission-literal]**
10. **`yarn verify` passes before a PR is merged.** **[enforced by CI; the pre-push hook runs a subset: check:arch, affected lint, typecheck, tests]**

### Product rules every screen follows

From `../requirements/design/docs/` and the grov-design skill (`../.claude/skills/grov-design/SKILL.md`):

- **Budget is a guide** (D11): overage is neutral text, never an error colour, never blocks checkout.
- **Every price before payment shows its status** (`<PriceStatus>`: Locked, Estimate, Updated, Price changed, Out of stock).
- **Auth-first** (D37): no customer screen without an account.
- **Accessibility**: 48px targets, labels on every control, WCAG 2.1 AA contrast, never white text on flame.
- **Every device** (D40): phone first (360px checked), extra width becomes columns, never a stretched phone layout.

## 2. Setup and daily commands

```bash
yarn install                              # Node 22 (.nvmrc); Yarn 4 is committed
cp .env.example apps/app/.env.local       # and apps/admin, apps/website
yarn dev:app                              # 4300 · dev:admin 4400 · dev:web 4200
```

| Command                                                        | Use it                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `yarn verify`                                                  | Before every push: format check, architecture, lint, typecheck, tests, builds   |
| `yarn nx affected -t lint typecheck test build`                | The same, only for what your branch touched                                     |
| `yarn check:arch`                                              | Architecture rules ESLint can't express (`tools/scripts/check-architecture.ts`) |
| `yarn gen:resource <kebab-plural> --entity <Pascal> [--admin]` | Adding an API resource: endpoints, keys, hooks, type alias                      |
| `yarn generate:api-types`                                      | After grov-be changes `openapi/openapi.json`                                    |
| `yarn generate:permissions`                                    | After grov-be adds, renames or removes a permission                             |
| `yarn sync:tokens`                                             | After the design tokens change                                                  |
| `yarn lint:fix` / `yarn format`                                | Auto-fix what can be fixed                                                      |

## 3. Where the rules live

Technical rules and templates are kept in the `frontend` skill so humans and AI agents read the same text, one topic at a time. Each file is the single source of truth for its topic.

| Topic                                                          | File                                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Projects, dependency rules, where code lives, helpers          | [`layout.md`](.agents/skills/frontend/references/layout.md)               |
| Naming, exports, comments, config, logging                     | [`code-style.md`](.agents/skills/frontend/references/code-style.md)       |
| Routes, layouts, guards, admin page permissions                | [`routing.md`](.agents/skills/frontend/references/routing.md)             |
| API endpoints, query hooks, cache keys, errors                 | [`data.md`](.agents/skills/frontend/references/data.md)                   |
| Client-only state (component state, Zustand stores, URL state) | [`state.md`](.agents/skills/frontend/references/state.md)                 |
| Sign-in, sessions, gates, permissions, store switcher          | [`auth.md`](.agents/skills/frontend/references/auth.md)                   |
| Tokens, type, spacing, dark mode                               | [`styling.md`](.agents/skills/frontend/references/styling.md)             |
| Building and changing components in `@grov/ui` and apps        | [`components.md`](.agents/skills/frontend/references/components.md)       |
| Forms, validation, server field errors                         | [`forms.md`](.agents/skills/frontend/references/forms.md)                 |
| Accessibility                                                  | [`accessibility.md`](.agents/skills/frontend/references/accessibility.md) |
| Security and privacy in the browser                            | [`security.md`](.agents/skills/frontend/references/security.md)           |
| The public website                                             | [`website.md`](.agents/skills/frontend/references/website.md)             |
| Tests                                                          | [`testing.md`](.agents/skills/frontend/references/testing.md)             |
| Env variables, dependencies, scripts, hooks, CI                | [`tooling.md`](.agents/skills/frontend/references/tooling.md)             |

The skill entry point is [`.agents/skills/frontend/SKILL.md`](.agents/skills/frontend/SKILL.md) (`.claude/skills/frontend` links to it; Cursor reads `.cursor/rules/frontend.mdc`).

## 4. Git workflow

Same flow as grov-be.

- **Flow**: `feature → qa → uat → main`. Open PRs against `qa`; promote `qa → uat → main` through PRs.
- **Branches**: short-lived, from `qa`. Start the name with `feat-`, `feature-`, `feat/` or `feature/` (`fix`, `chore` the same way), then the project and what changed, e.g. `feat/admin-roles-editor`. Keep them rebased on `qa`.
- **Commits**: Conventional Commits **[enforced by commit-msg hook and CI]**: `type(scope): subject`. Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `style`. Scope = project (`website`, `app`, `admin`, `ui`, `shared`, `hooks`, `api`, `store`, `models`, `test-utils`) or `tooling`, `ci`, `deps`, `docs`, `repo`. Example: `feat(admin): edit role permissions`. Breaking changes to a shared lib API add `!` and a `BREAKING CHANGE:` footer.
- **Hooks** (installed by `yarn install`): pre-commit runs ESLint fix + Prettier on staged files; commit-msg runs commitlint; pre-push runs `check:arch` and affected lint/typecheck/tests. CI is the full gate. Don't bypass hooks with `--no-verify`.
- **Pull requests**: one concern per PR. Fill in the template, with screenshots (light and dark, phone and desktop) for UI changes. Changes to auth, the `@grov/api` client, tooling/CI or money screens get a second reviewer (team convention). Claude reviews every PR against these rules (`.github/workflows/claude-code-review.yml`).

### Definition of done

- [ ] `yarn verify` passes
- [ ] New API usage goes through `gen:resource` / `@grov/api` + `@grov/hooks`; types regenerated if the spec changed
- [ ] Loading, empty and error states exist for every new data view
- [ ] Checked in light and dark, at 360px and desktop width, with keyboard only
- [ ] Admin pages and actions declare their permissions; nav matches
- [ ] Tests for new behaviour; a failing-first test for every bug fix
- [ ] Docs updated (`README.md`, this file or a skill reference) when a rule, route or contract changes

## 5. Dependencies

- Ask before adding a runtime dependency; say in the PR what it replaces and why the platform or an existing library can't do it. Banned packages and their replacements are listed in `eslint.config.mjs` **[enforced]**.
- Versions live in the root `package.json` as caret ranges of stable releases; never `latest`, `next` or RC tags. Commit `yarn.lock`. Yarn's age gate refuses releases younger than a day; don't turn it off.
- Check it is maintained, ESM, tree-shakeable, typed and licensed for commercial use. Mind the bundle: the customer app must stay fast on low-end Android over 3G.

## 6. Changing the rules

Rules change through a PR that edits the relevant reference (and `eslint.config.mjs` / `tools/scripts/check-architecture.ts` if it's enforced), with a reason. Engineers make the enforcement-config edits; AI agents must not (see `AGENTS.md`). Keep `AGENTS.md` and `SKILL.md` short: they route to the references and must not duplicate them.
