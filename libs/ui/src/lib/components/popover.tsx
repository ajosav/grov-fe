import {type ComponentProps} from 'react';

import {Popover as PopoverPrimitive} from 'radix-ui';

import {cn} from '../utils/cn';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 6,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'anim-pop z-50 rounded-md border border-line bg-surface-raised p-3 text-ink shadow-raised outline-none',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
