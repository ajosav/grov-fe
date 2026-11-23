---
name: frontend
description: Rules and templates for the grov-fe React monorepo (website, customer app, admin console, shared libs). Use before adding or changing a route/page, layout or guard, component, style/token/dark mode, form, API endpoint function or query hook, cache key, auth/session/permission check, store, website section, env variable, dependency, script or project; before writing tests; and when reviewing such changes. Not needed for edits that touch none of these.
---

# Frontend — structural changes

Load only the reference for the action you are taking. Each one is the single source of truth for its topic (`CONTRIBUTING.md` links to the same files). `yarn check:arch` errors name the reference that explains the rule.

| You are about to…                                                                        | Read                                                     |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Decide where code lives; add a lib, app or shared helper; import across projects         | `references/layout.md`                                   |
| Name files, exports, constants; write comments; read config; log                         | `references/code-style.md`                               |
| Add a page or route, layout, guard, redirect; gate an admin page                         | `references/routing.md`                                  |
| Call an endpoint; add a query or mutation hook, cache key, pagination; handle API errors | `references/data.md` — new resource: `yarn gen:resource` |
| Keep UI state (component state, a store, the URL)                                        | `references/state.md`                                    |
| Touch sign-in, sessions, gates, permissions, roles, the store switcher                   | `references/auth.md`                                     |
| Use colours, type, spacing, radius, shadows, dark mode                                   | `references/styling.md`                                  |
| Build or change a component in `@grov/ui` or an app                                      | `references/components.md`                               |
| Build a form: validation, field errors, server errors                                    | `references/forms.md`                                    |
| Make sure people can use it: labels, focus, keyboard, screen readers                     | `references/accessibility.md`                            |
| Store anything in the browser; render user content; redirects; third-party scripts       | `references/security.md`                                 |
| Change the public website                                                                | `references/website.md`                                  |
| Write or change tests                                                                    | `references/testing.md`                                  |
| Add an env variable, dependency or script; hooks and CI                                  | `references/tooling.md`                                  |

Unsure which applies? Read `references/layout.md` first; it maps every folder to its job.

## Always true (no need to open a reference)

- app → `@grov/shared` → `@grov/hooks` → `@grov/api` / `@grov/store` → `@grov/models`; `@grov/ui` → `@grov/models`. Import through `@grov/<lib>` only.
- Tokens, not colours (`bg-surface text-ink border-line bg-primary text-ink-muted text-danger`); no `dark:` colour variants needed.
- Server state = `@grov/hooks`; HTTP = `@grov/api`; types = `@grov/models` (generated from grov-be's OpenAPI).
- The server computes money, totals and states; money is integer kobo → `formatNaira` / `<Money>`.
- Copy from `ApiError.code` → `errorMessage()`. Field errors → `error.fieldError('field')`.
- `appConfig.brandName`, `PERMISSIONS.*`, `paths.*` — never literals.
- Named exports only, except route modules and configs.

## Workflow

1. Read the reference above, plus the files you'll change and one existing example of the same kind.
2. Make the change following the reference's template (use `yarn gen:resource` for API resources).
3. Run `yarn check:arch && yarn nx affected -t lint typecheck test build` (or `yarn verify`). Fix, don't silence: never edit lint/arch config, tsconfig, CI or generated files to get green.
4. UI changes: check light and dark, 360px and desktop, keyboard only. Say what you checked.
5. Commit as `type(scope): subject` (scope = project). Report what you ran and its result.

Product rules (D-numbers) live in `../requirements/design/docs/00-context-and-decisions.md`; visual rules in `../.claude/skills/grov-design/SKILL.md`. Cite the decision in a comment when it explains _why_ code is the way it is.
