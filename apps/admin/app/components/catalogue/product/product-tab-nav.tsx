import {cn, TabsList, TabsTrigger} from '@grov/ui';

import {STRIP_TABS} from '../../common/page-frame';

export interface ProductTabNavItem<T extends string> {
  value: T;
  label: string;
}

export interface ProductTabNavProps<T extends string> {
  tabs: readonly ProductTabNavItem<T>[];
}

/**
 * The product workspace tabs, drawn like the page strip's route tabs (`SectionTabs`) so every
 * full-bleed page reads as one system. Must sit inside <Tabs>.
 */
export function ProductTabNav<T extends string>({tabs}: ProductTabNavProps<T>) {
  return (
    <TabsList aria-label="Product sections" className={STRIP_TABS.list}>
      {tabs.map(tab => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className={cn(
            STRIP_TABS.tab,
            'data-[state=active]:border-line data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-[0_1px_2px_rgb(0_0_0/0.04)]'
          )}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
