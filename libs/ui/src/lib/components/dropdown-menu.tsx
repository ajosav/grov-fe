import {type ComponentProps} from 'react';

import {DropdownMenu as Menu} from 'radix-ui';

import {cn} from '../utils/cn';

export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;
export const DropdownMenuGroup = Menu.Group;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        sideOffset={sideOffset}
        className={cn(
          'anim-pop z-50 min-w-48 overflow-hidden rounded-md border border-line bg-surface-raised p-1 text-ink shadow-raised',
          className
        )}
        {...props}
      />
    </Menu.Portal>
  );
}

export function DropdownMenuItem({
  className,
  inset,
  ...props
}: ComponentProps<typeof Menu.Item> & {inset?: boolean}) {
  return (
    <Menu.Item
      className={cn(
        'relative flex min-h-11 cursor-default select-none items-center gap-2 rounded-sm px-3 text-body outline-none',
        'focus:bg-surface-sunken data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4',
        inset && 'pl-9',
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({className, ...props}: ComponentProps<typeof Menu.Label>) {
  return (
    <Menu.Label className={cn('px-3 py-2 text-body-sm text-ink-muted', className)} {...props} />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof Menu.Separator>) {
  return <Menu.Separator className={cn('my-1 h-px bg-line', className)} {...props} />;
}

export const DropdownMenuRadioGroup = Menu.RadioGroup;

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Menu.RadioItem>) {
  return (
    <Menu.RadioItem
      className={cn(
        'relative flex min-h-11 cursor-default select-none items-center rounded-sm pl-9 pr-3 text-body outline-none focus:bg-surface-sunken',
        className
      )}
      {...props}
    >
      <span className="absolute left-3 flex size-4 items-center justify-center">
        <Menu.ItemIndicator>
          <span className="block size-2 rounded-pill bg-flame" />
        </Menu.ItemIndicator>
      </span>
      {children}
    </Menu.RadioItem>
  );
}
