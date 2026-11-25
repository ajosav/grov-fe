# Components

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

## Reuse, configure, then create

See them all, in both themes, at `/design-system` (`yarn dev:app` → http://localhost:4300/design-system). Before writing a component, search `@grov/ui`, `@grov/shared` and the other apps' `app/components/<domain>/`. The ladder, in order:

1. **Use** an existing component, or compose a few, as they are.
2. **Configure** it: add a `size`, `variant`, `tone` or slot to the shared component — never restyle its internals from the call site.
3. **Promote** it: when a second app needs the same component, move the first copy to the right lib and import it from both.
4. **Create** one only when nothing composes. Generic → `@grov/ui`; one app's domain → that app's `app/components/<domain>/`.

Never copy a component into another app, and never fork a primitive to change one style **[enforced: `check:arch` component-reuse]** — an app component whose name matches a `@grov/ui` / `@grov/shared` component, or that exists in two apps, fails the check.

`@grov/ui` has:

- **Fields:** Button, Input, Textarea, PasswordInput, PhoneInput, OtpInput, AmountInput (naira in, kobo out), NumberInput (digits only), Label, Field, Select, Combobox, MultiCombobox, DatePicker, Calendar, Checkbox, RadioGroup, Switch, Segmented (`size`), SelectTile, QuantityStepper, FileUpload.
- **Overlays:** Dialog (center · sheet · side), ConfirmDialog, StatusDialog, Popover, DropdownMenu, Tooltip.
- **Grov patterns:** Money, PriceStatus, Tag, Badge (`tone`), BudgetMeter, Progress (bar · ring), PlanLine, Banner, IconTile, GlassCard, HeroPanel, Wash.
- **Navigation:** AppBar, BottomNav, ActionBar, Tabs (`variant`: pill · underline, `size`: sm · md), PillTabs (stages with counts), StepIndicator, Pagination, LoadMore (cursor lists, optional infinite scroll), Accordion, CollapsibleCard.
- **Data and content:** Table, DataTable (TanStack Table: sorting, selection, search toolbar, loading/empty), Panel (title · actions · flush body), StatStrip (key numbers with changes), TrendChart · BarList · Funnel, Markdown, CopyableText, Card, EmptyState, Alert, Skeleton, Spinner, Toaster/toast.
- **Other:** PeriodPicker (today · 7 · 30 · 90 days, custom range), ThemeToggle, Avatar, Separator, OrSeparator, Logo. `@grov/shared` has the layouts (AuthLayout, AppShell with `mobileNav="menu" | "bottom"`, PageHeader, UserMenu), Turnstile, guards and auth screens. Search before building; a near-duplicate is a bug.

## Configure, don't restyle

A shared component owns its internals. When one call site needs a different look, add a variant to the component (or a prop that selects one) and use it; do not reach in with arbitrary child selectors.

```tsx
// Good: the difference is part of the component's API.
<Button size="sm" variant="outline">Export</Button>
<TabsList variant="underline" size="sm">…</TabsList>
<Segmented size="sm" options={views} … />
<Badge tone="success">Listed</Badge>

// Bad: the call site styles the component's DOM.
<TabsList className="[&_button]:h-8">…</TabsList>
```

- Variants: `cva` in the component, `VariantProps` on the props. Sizes: `size="sm" | "md"` (the dense toolbar size is `sm`). Tones: a map to token classes, never a caller-supplied colour.
- Content varies through `children`, named slots (`actions`, `footer`, `icon`) or a typed config array (`PillTabs` takes `{value, label, count}`), not through extra markup at every call site.
- Still accept `className` and merge it last with `cn()`; it is for layout (margins, width), not for overriding the component's own appearance.
- In-repo examples of configurable components: `TabsList`/`TabsTrigger` (`variant` + `size`, read through context so callers never style triggers), `Segmented` (`size`), `Badge` (`tone`), `status-badges.tsx` / `category-badges.tsx` / `listing-badges.tsx` (tone maps over `Badge`), `Panel` (`actions`, `flush`).

## When a component is promoted

- **Threshold:** a second app needs it. One app using it is app-local; two apps means it moves.
- **Move, don't copy.** Move the file to the lib, update every import, delete the app-local copy, and export it from the lib's `index.ts`. A leftover near-duplicate is the bug the `component-reuse` rule catches.
- **Choose the lib:** generic visual primitive or a Grov pattern with no app data → `@grov/ui`; auth, guards, shells, providers, page chrome → `@grov/shared`.
- **Keep it data-free.** A promoted component takes data and callbacks as props. No `@grov/hooks`, router or store imports in `@grov/ui` **[enforced: `check:arch` lib-purity]**; `@grov/shared` may use them.
- **Finish the promotion:** test the behaviour and accessibility, add it to the design-system gallery, and note the variant in `components.md`'s inventory if it is new.

## New component checklist

1. I searched `@grov/ui`, `@grov/shared` and the other apps, and this is not already there.
2. If it is close, I added a prop/variant to the existing component instead of a second file.
3. It has one job, a `<Name>Props` interface, and forwards `className` (merged with `cn()`).
4. Differences are variants, not `[&_…]` overrides at the call site.
5. It is in the right place: generic → `@grov/ui`; one app's domain → `app/components/<domain>/`; two apps → promoted.
6. If it renders server data, loading, empty and error states are handled by the page or the component.
7. Tests cover behaviour and keyboard/screen-reader use; a new `@grov/ui` component is in the gallery.

## A new primitive in `@grov/ui`

```tsx
import {type ComponentProps} from 'react';

import {cva, type VariantProps} from 'class-variance-authority';
import {Popover as PopoverPrimitive} from 'radix-ui';

import {cn} from '../utils/cn';

const panelVariants = cva(
  'anim-pop z-50 rounded-md border border-line bg-surface-raised p-4 shadow-raised',
  {
    variants: {size: {sm: 'w-64', md: 'w-80'}},
    defaultVariants: {size: 'md'},
  }
);

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className,
  size,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content> & VariantProps<typeof panelVariants>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content className={cn(panelVariants({size}), className)} {...props} />
    </PopoverPrimitive.Portal>
  );
}
```

- Behaviour from `radix-ui` (one package, not `@radix-ui/*` **[enforced]**); variants with `cva`; classes merged with `cn()` (never `classnames`, **[enforced]**).
- Accept and forward `className` and the native props; `forwardRef` (or `ref` prop) for anything focusable.
- No data fetching, routing or stores in `@grov/ui` **[enforced: `check:arch` lib-purity]**. Links come in through `asChild`.
- Export it from `lib/components/index.ts`, add a test for its behaviour and accessibility (`testing.md`).
- Add it to the component gallery (`libs/ui/src/lib/design-system/design-system-gallery.tsx`), with its variants and states. The gallery is at `/design-system` in the app (http://localhost:4300/design-system) and admin (http://localhost:4400/design-system) in dev, or in a build with `VITE_SHOW_DESIGN_SYSTEM=true`.

## App components

- Compose `@grov/ui` + `@grov/hooks`. One job per component; a page component orchestrates, children render.
- Props are typed interfaces named `<Name>Props`; no prop drilling past two levels — lift into a hook or composition (`children`, slots).
- Every data view renders loading (`Skeleton`), empty (`EmptyState`) and error (`Alert` + retry) states.
- Lists use stable `key`s from ids, never array indexes for dynamic lists.
- Expensive children: `memo` only after measuring; prefer moving state down.

## Grov specifics

- Money: `<Money kobo>`; never `₦` + number by hand. Prices before payment carry `<PriceStatus>` (non-negotiable 2).
- Budget overage: neutral copy and colours, never `danger`, never disables checkout (non-negotiable 1).
- Phones: `<PhoneInput>` (+234), dates DD/MM/YYYY, times WAT, units g/kg/litres (D33).
- Copy: sentence case, plain words, no "wallet"/"withdraw"/"cash out" for the Food balance (D20); savings never say "deposit" or "returns".
- Icons: `lucide-react`, `aria-hidden` when decorative, sized with `size-4`/`size-5`.
