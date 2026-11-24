import {type ComponentProps, type ReactNode} from 'react';

import {Command as Cmdk} from 'cmdk';
import {Search} from 'lucide-react';

import {cn} from '../utils/cn';
import {Dialog, DialogContent, DialogDescription, DialogTitle} from './dialog';

/** Searchable list of actions (cmdk). Use `CommandDialog` for a ⌘K palette. */
export function Command({className, ...props}: ComponentProps<typeof Cmdk>) {
  return <Cmdk className={cn('flex flex-col overflow-hidden text-ink', className)} {...props} />;
}

export function CommandInput({className, ...props}: ComponentProps<typeof Cmdk.Input>) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-4">
      <Search aria-hidden className="size-5 shrink-0 text-ink-muted" />
      <Cmdk.Input
        className={cn(
          'h-14 w-full bg-transparent text-body-lg outline-none placeholder:text-ink-muted',
          className
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({className, ...props}: ComponentProps<typeof Cmdk.List>) {
  return (
    <Cmdk.List
      className={cn('max-h-[min(60dvh,26rem)] overflow-y-auto overscroll-contain p-2', className)}
      {...props}
    />
  );
}

export function CommandEmpty({className, ...props}: ComponentProps<typeof Cmdk.Empty>) {
  return (
    <Cmdk.Empty
      className={cn('px-3 py-8 text-center text-body text-ink-muted', className)}
      {...props}
    />
  );
}

export function CommandGroup({className, ...props}: ComponentProps<typeof Cmdk.Group>) {
  return (
    <Cmdk.Group
      className={cn(
        '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-chip [&_[cmdk-group-heading]]:text-ink-muted',
        className
      )}
      {...props}
    />
  );
}

export function CommandItem({className, ...props}: ComponentProps<typeof Cmdk.Item>) {
  return (
    <Cmdk.Item
      className={cn(
        'flex min-h-11 cursor-default select-none items-center gap-3 rounded-sm px-3 text-body outline-none',
        'data-[selected=true]:bg-surface-sunken data-[disabled=true]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-muted',
        className
      )}
      {...props}
    />
  );
}

export function CommandSeparator({className, ...props}: ComponentProps<typeof Cmdk.Separator>) {
  return <Cmdk.Separator className={cn('my-1 h-px bg-line', className)} {...props} />;
}

export interface CommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Read by screen readers as the dialog's name. */
  title: string;
  description?: string;
  children: ReactNode;
}

/** Command palette in a centred modal. */
export function CommandDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: CommandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="top-[12dvh] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {description ? (
          <DialogDescription className="sr-only">{description}</DialogDescription>
        ) : null}
        <Command loop>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}
