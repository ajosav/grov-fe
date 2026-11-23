import {type ComponentProps} from 'react';

import {Tabs as TabsPrimitive} from 'radix-ui';

import {cn} from '../utils/cn';

export const Tabs = TabsPrimitive.Root;

export function TabsList({className, ...props}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex items-center gap-1 rounded-pill bg-surface-sunken p-1', className)}
      {...props}
    />
  );
}

export function TabsTrigger({className, ...props}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-pill px-4 text-body-sm font-semibold text-ink-muted transition-colors',
        'hover:text-ink data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-glass',
        className
      )}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;
