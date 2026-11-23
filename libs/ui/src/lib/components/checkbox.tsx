import {type ComponentProps} from 'react';

import {Check} from 'lucide-react';
import {Checkbox as CheckboxPrimitive} from 'radix-ui';

import {cn} from '../utils/cn';

export function Checkbox({className, ...props}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'peer size-5 shrink-0 rounded-sm border border-line-strong bg-surface outline-none',
        'focus-visible:ring-4 focus-visible:ring-flame/20 disabled:cursor-not-allowed disabled:opacity-60',
        'data-[state=checked]:border-ink data-[state=checked]:bg-ink data-[state=checked]:text-canvas',
        'aria-invalid:border-danger',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <Check aria-hidden className="size-4" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
