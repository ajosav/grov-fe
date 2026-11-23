import {type ComponentProps} from 'react';

import {Switch as SwitchPrimitive} from 'radix-ui';

import {cn} from '../utils/cn';

export function Switch({className, ...props}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-7 w-12 shrink-0 items-center rounded-pill border border-transparent transition-colors outline-none',
        'focus-visible:ring-4 focus-visible:ring-flame/20 disabled:cursor-not-allowed disabled:opacity-60',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-line',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-6 rounded-pill bg-surface shadow-raised transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5" />
    </SwitchPrimitive.Root>
  );
}
