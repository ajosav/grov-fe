import {TabsList, TabsTrigger} from '@grov/ui';

export interface ProductTabNavItem<T extends string> {
  value: T;
  label: string;
}

export interface ProductTabNavProps<T extends string> {
  tabs: readonly ProductTabNavItem<T>[];
}

/**
 * The product workspace tabs: the design system's underline tabs, sized like the Product
 * management nav (Catalogue · Analytics · Intelligence) so the two read as one system.
 * Must sit inside <Tabs>.
 */
export function ProductTabNav<T extends string>({tabs}: ProductTabNavProps<T>) {
  return (
    <TabsList variant="underline" size="sm" aria-label="Product sections" className="mb-5 gap-1">
      {tabs.map(tab => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="-mb-px px-3 text-body-sm font-semibold text-ink-muted hover:text-ink data-[state=active]:text-ink"
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
