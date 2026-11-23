# Accessibility

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

Target: WCAG 2.1 AA. `eslint-plugin-jsx-a11y` (recommended) runs on every file **[enforced]**; the rest is checked in review and tests.

- **Names**: every control has an accessible name. Icon-only buttons get `aria-label`; decorative icons `aria-hidden`. Images have `alt` (empty for decorative).
- **Labels**: inputs through `<Field>` (or `<label htmlFor>`); placeholder is never the label.
- **Keyboard**: everything works without a mouse, in a sensible order. Dialogs, menus and selects come from radix-ui (focus trap, Escape, return focus); don't hand-roll them.
- **Focus**: visible on every interactive element (global `:focus-visible` or `focus-visible:ring-4 ring-flame/20`). After navigation, focus starts at the top; after an error, the first invalid field.
- **Targets**: at least 48×48 px for anything tappable (`h-12`, `size-12`) (DS8).
- **Contrast**: tokens are AA in both themes. Never white text on flame (3.2:1); use ink (`text-primary-foreground`).
- **Status, not colour alone**: chips have an icon and a word (`PriceStatus`); errors have text, not only a red border.
- **Live updates**: form errors use `role="alert"`; async results and toasts are announced (sonner does); loading uses `aria-busy` or `Spinner` with a label.
- **Text scaling**: layouts reflow at 200% font size; no fixed heights on text containers; nothing important truncates without a way to see it.
- **Motion**: respect `prefers-reduced-motion`.
- **Language and semantics**: one `<h1>` per page (PageHeader), headings in order, lists as `ul/ol`, tables for tabular data with header cells.

Tests query by role and name (`testing.md`), which keeps these properties covered.
