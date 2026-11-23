import {type ComponentProps} from 'react';

import {Check, ChevronDown} from 'lucide-react';
import {Select as SelectPrimitive} from 'radix-ui';

import {cn} from '../utils/cn';
import {inputClasses} from './input';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(inputClasses, 'items-center justify-between gap-2 text-left', className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden className="size-5 text-ink-muted" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          'anim-pop relative z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-md border border-line bg-surface-raised text-ink shadow-raised',
          position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)] translate-y-1',
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex min-h-11 w-full cursor-default select-none items-center rounded-sm py-2 pl-3 pr-9 text-body outline-none',
        'focus:bg-surface-sunken data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-3 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check aria-hidden className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}
