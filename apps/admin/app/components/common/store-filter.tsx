import {Store} from 'lucide-react';

import type {AdminStoreOption} from '@grov/models';
import {cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@grov/ui';

const ALL = 'all';

export interface StoreFilterProps {
  value: string | undefined;
  onChange: (storeId: string | undefined) => void;
  /** The stores this admin can see (`useMyStores`). */
  stores: readonly AdminStoreOption[] | undefined;
  className?: string;
}

/** Every location the admin can see, or one. */
export function StoreFilter({value, onChange, stores, className}: StoreFilterProps) {
  return (
    <Select value={value ?? ALL} onValueChange={v => onChange(v === ALL ? undefined : v)}>
      <SelectTrigger aria-label="Location" className={cn('h-9 w-52', className)}>
        <Store aria-hidden className="size-4 text-ink-muted" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All locations</SelectItem>
        {stores?.map(store => (
          <SelectItem key={store.id} value={store.id}>
            {store.status === 'ACTIVE' ? store.name : `${store.name} (inactive)`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
