# Layout, dependency rules and shared code

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

## Layout

```
apps/
  website/  app/root.tsx · app/routes/* · app/site/{sections,parts}/* · site.css · site-behaviour.ts
  app/      app/root.tsx · app/routes.ts · app/paths.ts · app/routes/** · app/components/*
  admin/    app/root.tsx · app/routes.ts · app/paths.ts · app/routes/** · app/components/* · app/lib/*
libs/
  models/     lib/generated/api.ts (OpenAPI) · schemas.ts (aliases) · errors.ts · auth.ts · config.ts · permission-keys.generated.ts
  ui/         styles.css · tokens.css · lib/styles/* · lib/components/* · lib/theme/* · lib/utils/*
  api/        client.ts · errors.ts · device.ts · endpoints/<resource>.ts · query-keys.ts · api-provider.tsx
  hooks/      lib/api/<resource>.ts · lib/util/use-*.ts
  store/      create-store.ts · <name>-store.ts
  shared/     providers/* · auth/* · layout/* · errors/*
  test-utils/ setup.ts · lib/render.tsx · lib/fixtures.ts
tools/scripts/  check-architecture.ts · new-resource.ts · generate-permissions.ts · sync-tokens.mjs
```

## Allowed dependencies

Internal libraries **[enforced: `@nx/enforce-module-boundaries` via project tags]**:

| From (tag)                                              | May import                    | May not import    |
| ------------------------------------------------------- | ----------------------------- | ----------------- |
| apps (`type:app`)                                       | every lib                     | another app       |
| `@grov/shared` (`type:feature`)                         | hooks, api, store, ui, models | apps              |
| `@grov/hooks`, `@grov/api`, `@grov/store` (`type:data`) | each other, models            | ui, shared        |
| `@grov/ui` (`type:ui`)                                  | models                        | data libs, shared |
| `@grov/models` (`type:util`)                            | nothing                       | everything        |

Third-party side **[enforced: `check:arch` lib-purity]**:

| Lib            | May not import                                                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@grov/models` | react, react-router, TanStack, axios, zustand, radix-ui                                                                                                                             |
| `@grov/ui`     | react-router, TanStack Query, axios, zustand (primitives stay router- and data-agnostic; links come in through `asChild` or a `link` prop). TanStack Table is allowed (`DataTable`) |
| `@grov/api`    | react-router, zustand, radix-ui                                                                                                                                                     |
| `@grov/store`  | react-router, TanStack, axios, radix-ui                                                                                                                                             |

- Import a library only through its public index (`@grov/ui`, never `@grov/ui/src/...`); the two CSS entry points `@grov/ui/styles.css` and `@grov/ui/tokens.css` are the exceptions **[enforced: `check:arch` deep-import]**. No relative import into another project.
- Libraries are consumed from source (`exports` → `src/index.ts`); there is no library build step. Every public symbol is exported from the lib's `index.ts`; anything not exported there is private.

## Where code goes

| Code                                                            | Home                                           |
| --------------------------------------------------------------- | ---------------------------------------------- |
| Visual primitive with no data (button, field, dialog, chip)     | `@grov/ui` → `lib/components`                  |
| Pure formatting helper (money, phone, dates)                    | `@grov/ui` → `lib/utils` (tested)              |
| Type, constant, error code, config value                        | `@grov/models`                                 |
| Function that calls an endpoint                                 | `@grov/api` → `endpoints/<resource>.ts`        |
| Hook reading or writing server data                             | `@grov/hooks` → `lib/api/<resource>.ts`        |
| Client-only state shared across screens                         | `@grov/store`                                  |
| Feature used by two or more apps (auth screens, guards, shells) | `@grov/shared`                                 |
| Page, or a component only one app uses                          | that app (`app/routes/**`, `app/components/*`) |

## Helpers and shared code

- Default home for a helper is **the file or app that needs it**. Promote it to a lib only when a second app needs the same thing. There are no `utils/` dumping grounds in apps; name files by what they do (`money.ts`, `route-access.ts`).
- Before writing a helper or component, search the libs for it. A second copy is a bug: move the first to the right lib and import it from both.
- Money, phone and date helpers are shared and tested, and the only way to do those operations: `formatNaira`, `toE164Nigeria`, `formatNigerianPhone`; dates with `date-fns`/`Intl` in `Africa/Lagos`.
- Prefer a plain function to a hook, and a hook to a context. Add a React context only for app-wide dependencies (API, theme, query client).
