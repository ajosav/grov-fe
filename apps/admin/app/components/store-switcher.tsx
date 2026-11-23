import {Store} from 'lucide-react';

import {useMyStores, useSwitchStore} from '@grov/hooks';
import {errorMessage} from '@grov/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  toast,
} from '@grov/ui';

/**
 * The store this admin session works in. Store-scoped pages (listings, markups,
 * stock, orders) act on it; switching does not affect the admin's other sessions.
 */
export function StoreSwitcher() {
  const stores = useMyStores();
  const switchStore = useSwitchStore();

  if (stores.isPending) return <Skeleton className="h-10 w-44 rounded-pill" />;
  if (!stores.data || stores.data.stores.length === 0) return null;

  const {activeStoreId, stores: options} = stores.data;
  return (
    <Select
      value={activeStoreId ?? undefined}
      onValueChange={storeId =>
        switchStore.mutate(storeId, {
          onSuccess: next => {
            const name = next.stores.find(s => s.id === next.activeStoreId)?.name;
            toast.success(name ? `Now working in ${name}` : 'Store changed');
          },
          onError: error => toast.error(errorMessage(error)),
        })
      }
      disabled={switchStore.isPending}
    >
      <SelectTrigger
        aria-label="Working store"
        className="h-10 w-auto min-w-44 gap-2 rounded-pill px-3 text-body-sm"
      >
        <Store aria-hidden className="size-4 text-ink-muted" />
        <SelectValue placeholder="Choose a store" />
      </SelectTrigger>
      <SelectContent align="end">
        {options.map(store => (
          <SelectItem key={store.id} value={store.id} disabled={store.status !== 'ACTIVE'}>
            {store.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
