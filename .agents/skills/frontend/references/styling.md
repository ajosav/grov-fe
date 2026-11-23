# Styling: tokens, type, dark mode

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

## Sources

- Tokens: `../requirements/design/system/tokens.json` → generated `tokens.css` + `tailwind.css` → copied into `libs/ui/src/lib/styles/` by `yarn sync:tokens`. Never edit the copies; change tokens.json, regenerate, sync.
- Web decisions on top: `brand-overrides.css` (plain CSS; primary = flame with ink label, F7) and `grov.css` (Tailwind additions).
- Visual rules and screens: `../.claude/skills/grov-design/SKILL.md`; Figma "Grov Mobile" is the master (D23). Admin screens aren't designed: same tokens, calmer surfaces, dense tables.

## Tokens only

No Tailwind palette colours (`bg-gray-100`, `text-white`) **[enforced: ESLint]**; no hex, `rgb()` or `hsl()` in class names or inline styles **[enforced: `check:arch` token-colors]**.

| Need                          | Class                                                                                                                                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page / card / raised / sunken | `bg-canvas` `bg-surface` `bg-surface-raised` `bg-surface-sunken`                                                                                                                                                                                                 |
| Text / muted / on dark panel  | `text-ink` `text-ink-muted` `text-on-night` `text-on-night-muted`                                                                                                                                                                                                |
| Main action                   | `bg-primary text-primary-foreground` (+ `hover:bg-primary-hover`) — never white text on flame                                                                                                                                                                    |
| Strong secondary / dark panel | `bg-night text-on-night`                                                                                                                                                                                                                                         |
| Lines and inputs              | `border-line` `border-line-strong`                                                                                                                                                                                                                               |
| Status                        | `bg-leaf-tint text-leaf-strong` (locked, paid, delivered) · `bg-palm-tint text-palm-strong` (estimate, savings) · `bg-flame-tint text-flame-strong` (changed, selected) · `bg-sky-tint text-sky-strong` (info) · `bg-danger-tint text-danger` (real errors only) |
| Focus                         | `focus-visible:ring-4 ring-flame/20` or the global `:focus-visible` outline                                                                                                                                                                                      |

Green is status only; crimson only for real errors; budget overage is neutral (non-negotiable 1).

## Type, space, shape

- Type scale utilities only: `text-display-xl/lg` (hero money, Bricolage), `text-title-lg/md/sm`, `text-body-lg`, `text-body`, `text-body-sm`, `text-label`, `text-chip`, `text-money`. No arbitrary `text-[17px]`.
- Running text ≥ 15px (`text-body`); chips 12px bold; sentence case everywhere.
- Money and counts use tabular figures (`<Money>` or `tabular`).
- Spacing on Tailwind's 4px scale; radius `rounded-sm/md/lg/xl/pill`; shadows `shadow-raised`, `shadow-glass`.
- Breakpoints (D40): `sm` 600 · `md` 744 · `lg` 1024 · `xl` 1280. Phone first; extra width adds columns or list + detail; never a stretched phone layout. Check 360px.

## Dark mode

`<html data-theme="dark">` swaps every token, so components need no `dark:` colour variants. `ThemeProvider` (light · device · dark) applies it, remembers it per browser and `AppProviders` saves it to the account (`PATCH /v1/me {theme}`). `themeInitScript` in each `root.tsx` applies it before first paint. Use `dark:` only for non-colour differences. Every screen is checked in both themes before merge.

## Motion

Short and purposeful (`anim-fade`, `anim-pop`, `anim-sheet`, `duration-150`). Respect `prefers-reduced-motion` (tokens shorten durations; add `motion-reduce:` for anything looping).
