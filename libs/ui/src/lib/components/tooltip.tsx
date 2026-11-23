import {type ComponentProps, type ReactNode} from 'react';

import {Tooltip as TooltipPrimitive} from 'radix-ui';

import {cn} from '../utils/cn';

export const TooltipProvider = TooltipPrimitive.Provider;

export interface TooltipProps extends Omit<
  ComponentProps<typeof TooltipPrimitive.Content>,
  'content'
> {
  content: ReactNode;
  children: ReactNode;
}

/** Short hint on hover/focus. Never the only place important information lives. */
export function Tooltip({content, children, className, sideOffset = 6, ...props}: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={300}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={sideOffset}
          className={cn(
            'anim-pop z-50 max-w-xs rounded-sm bg-night px-3 py-2 text-body-sm text-on-night shadow-raised',
            className
          )}
          {...props}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
