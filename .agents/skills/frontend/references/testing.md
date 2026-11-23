# Testing

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

Vitest 4 + Testing Library + jsdom. Each project has its own `vitest.config.ts`; tests sit next to the code as `*.test.ts(x)` **[enforced: `check:arch` test-files]**.

```bash
yarn nx run shared:test     # one project
yarn test                   # all
yarn test:coverage          # all, with coverage
```

| Layer                     | What                                                                                                           | Where                             | Tooling                                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Pure logic                | Money, phone, dates, plan maths, permission checks, route requirements. Aim for full branch coverage on money. | next to the file                  | Vitest                                                                                                              |
| API client                | Envelope, CSRF, refresh and retry, errors                                                                      | `libs/api/src/lib/client.test.ts` | fake axios adapter                                                                                                  |
| Hooks and shared features | Guards, gates, sign-in steps, `Can`, providers                                                                 | next to the file                  | `renderWithProviders`, `renderRoutes`, partial `api` object, `meFixture` / `adminMeFixture` from `@grov/test-utils` |
| UI primitives             | Behaviour and accessibility: roles, names, disabled/busy, keyboard                                             | next to the component             | Testing Library + user-event                                                                                        |
| Pages                     | Flows that matter: redirects, permission gating, empty/error states                                            | next to the route                 | `renderRoutes`                                                                                                      |

## Rules

- Query by role and accessible name (`getByRole('button', {name: 'Continue'})`), then label and text. No test ids, no class-name assertions.
- Mock at the API boundary: pass a partial `Api` (only the endpoints the test touches). Never mock TanStack Query, React Router or the component under test.
- No real network, no leftover timers; use fake timers for countdowns and cut-offs. Time-dependent logic takes `now` so tests control it (WAT, month ends).
- Fixtures use neutral sample data (`ngozi@example.com`) and never the product name.
- Every bug fix comes with a test that fails without the fix.
- Test names describe behaviour: `it('sends people with pending gates to the gates screen')`.
- No `.only` on any branch **[enforced: ESLint]**; no skipped tests without an issue link.
