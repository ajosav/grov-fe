import {type ComponentProps, type HTMLAttributes} from 'react';

import {X} from 'lucide-react';
import {Dialog as DialogPrimitive} from 'radix-ui';

import {cn} from '../utils/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

function Overlay({className, ...props}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn('anim-fade fixed inset-0 z-50 bg-scrim', className)}
      {...props}
    />
  );
}

export interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  /** `center` = modal; `sheet` = bottom sheet on phones, centred from `md`; `side` = right panel. */
  layout?: 'center' | 'sheet' | 'side';
  hideClose?: boolean;
}

export function DialogContent({
  className,
  children,
  layout = 'center',
  hideClose,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 grid gap-4 border border-line bg-surface-raised p-6 text-ink shadow-raised outline-none',
          layout === 'center' &&
            'anim-pop left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg',
          layout === 'sheet' &&
            'anim-sheet inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-xl pb-[max(1.5rem,env(safe-area-inset-bottom))] md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg',
          layout === 'side' &&
            'anim-fade inset-y-0 right-0 h-full w-full max-w-md overflow-y-auto rounded-none sm:rounded-l-lg',
          className
        )}
        {...props}
      >
        {children}
        {hideClose ? null : (
          <DialogPrimitive.Close
            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-pill text-ink-muted hover:bg-surface-sunken hover:text-ink"
            aria-label="Close"
          >
            <X aria-hidden className="size-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid gap-1.5 pr-8', className)} {...props} />;
}

export function DialogFooter({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

export function DialogTitle({className, ...props}: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-title-md', className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn('text-body text-ink-muted', className)} {...props} />
  );
}
