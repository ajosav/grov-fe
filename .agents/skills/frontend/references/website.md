# Website (`apps/website`)

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

The public landing page, ported from `../requirements/site/index.html` and prerendered to static HTML (`react-router.config.ts` → `prerender`).

| Piece                              | Where                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Page composition                   | `app/pages/home.tsx`                                                                                           |
| Static sections (converted markup) | `app/site/sections/*.tsx`                                                                                      |
| Stateful parts                     | `app/site/parts/*` — plan builder (+ `plan-maths.ts`), waitlist, ticker, skyline, word splitting, phone shots  |
| Scroll/presentation behaviour      | `app/site/site-behaviour.ts` (nav frost, reveals, journey rail, hero billboard, sticky phone, tabs, count-ups) |
| Styles                             | `app/site/site.css` on `@grov/ui/tokens.css` (tokens + fonts, no Tailwind)                                     |
| Assets                             | `public/img`, `public/brand` (photo credits in `public/img/CREDITS.md`)                                        |

## Rules

- Keep the site's own CSS. Do not import `@grov/ui/styles.css` here: Tailwind's preflight would change the page.
- Colours come from tokens (`var(--ink)`, `var(--flame)` …) so dark mode keeps working; the page follows the stored theme or the OS.
- New interactive behaviour with state → a component in `parts/`. Purely presentational scroll effects → a function in `site-behaviour.ts` that returns its cleanup.
- Sample numbers and copy are illustration only and say so on the page. Changing the plan maths: update `plan-maths.test.ts`.
- Copy must follow the current decisions log. Known gap: sections still describe drops (removed by D66) and an SMS waitlist (no SMS in MVP, D37). Update copy with product before launch.
- Prerendered pages must render the same markup on server and client: no `window`, `Date.now()` or randomness during render (see `skyline.tsx`, seeded).
- Add a route → add it to `prerender` too.
