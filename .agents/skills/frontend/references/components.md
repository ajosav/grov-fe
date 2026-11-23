# Components

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

## Reuse first

See them all, in both themes, at `/design-system` (`yarn dev:app` → http://localhost:4300/design-system).

`@grov/ui` has:

- **Fields:** Button, Input, Textarea, PasswordInput, PhoneInput, OtpInput, AmountInput (naira in, kobo out), Label, Field, Select, Combobox, MultiCombobox, DatePicker, Calendar, Checkbox, RadioGroup, Switch, Segmented, SelectTile, QuantityStepper, FileUpload.
- **Overlays:** Dialog (center · sheet · side), ConfirmDialog, StatusDialog, Popover, DropdownMenu, Tooltip.
- **Grov patterns:** Money, PriceStatus, Tag, Badge, BudgetMeter, Progress (bar · ring), PlanLine, Banner, IconTile, GlassCard, HeroPanel, Wash.
- **Navigation:** AppBar, BottomNav, ActionBar, Tabs, StepIndicator, Pagination, LoadMore (cursor lists, optional infinite scroll), Accordion, CollapsibleCard.
- **Data and content:** Table, DataTable (TanStack Table: sorting, selection, search toolbar, loading/empty), Markdown, CopyableText, Card, EmptyState, Alert, Skeleton, Spinner, Toaster/toast.
- **Other:** ThemeToggle, Avatar, Separator, OrSeparator, Logo. `@grov/shared` has the layouts (AuthLayout, AppShell with `mobileNav="menu" | "bottom"`, PageHeader, UserMenu), Turnstile, guards and auth screens. Search before building; a near-duplicate is a bug.

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
