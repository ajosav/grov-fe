import {type ComponentProps, createContext, useContext} from 'react';

import {Tabs as TabsPrimitive} from 'radix-ui';

import {cn} from '../utils/cn';

export type TabsSize = 'sm' | 'md';
export type TabsVariant = 'pill' | 'underline';

/** `TabsList` sets these; `TabsTrigger` reads them so callers style the list, not its buttons. */
const TabsConfig = createContext<{size: TabsSize; variant: TabsVariant}>({
  size: 'md',
  variant: 'pill',
});

const LIST: Record<TabsVariant, string> = {
  pill: 'inline-flex items-center gap-1 rounded-pill bg-surface-sunken p-1',
  underline:
    'inline-flex h-auto w-full items-center justify-start gap-0 overflow-x-auto rounded-none border-b border-line bg-transparent p-0',
};

const TRIGGER: Record<TabsVariant, string> = {
  pill: 'inline-flex items-center justify-center rounded-pill px-4 text-body-sm font-semibold text-ink-muted transition-colors hover:text-ink data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-glass',
  underline:
    'shrink-0 rounded-none border-b-2 border-transparent bg-transparent px-4 whitespace-nowrap data-[state=active]:border-flame data-[state=active]:bg-transparent data-[state=active]:shadow-none',
};

const TRIGGER_HEIGHT: Record<TabsVariant, Record<TabsSize, string>> = {
  pill: {sm: 'h-8', md: 'h-10'},
  underline: {sm: 'h-9', md: 'h-11'},
};

export const Tabs = TabsPrimitive.Root;

export interface TabsListProps extends ComponentProps<typeof TabsPrimitive.List> {
  /** Height of the triggers. `sm` is for dense toolbars. */
  size?: TabsSize;
  /** `underline` for a full-width section switch; `pill` (default) for a compact switch. */
  variant?: TabsVariant;
}

export function TabsList({className, size = 'md', variant = 'pill', ...props}: TabsListProps) {
  return (
    <TabsConfig.Provider value={{size, variant}}>
      <TabsPrimitive.List className={cn(LIST[variant], className)} {...props} />
    </TabsConfig.Provider>
  );
}

export function TabsTrigger({className, ...props}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const {size, variant} = useContext(TabsConfig);
  return (
    <TabsPrimitive.Trigger
      className={cn(TRIGGER[variant], TRIGGER_HEIGHT[variant][size], className)}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;
