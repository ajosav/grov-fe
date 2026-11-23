# Components

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

## Reuse first

`@grov/ui` has: Button, Input, PasswordInput, PhoneInput, OtpInput, Label, Field, Select, Checkbox, Switch, Dialog (center · sheet · side), DropdownMenu, Tooltip, Tabs, Badge, PriceStatus, Money, Alert, Card, Table, EmptyState, Skeleton, Spinner, Toaster/toast, ThemeToggle, Avatar, Separator, Logo. `@grov/shared` has the layouts (AuthLayout, AppShell, PageHeader), guards and auth screens. Search before building; a near-duplicate is a bug.

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
