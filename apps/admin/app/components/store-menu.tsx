import {Check, ChevronsUpDown, Plus, RotateCw, Settings2, Store} from 'lucide-react';
import {Link} from 'react-router';

import {useMyStores, useSwitchStore} from '@grov/hooks';
import {type AdminStoreOption, PERMISSIONS} from '@grov/models';
import {Can, errorMessage} from '@grov/shared';
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
  Tag,
  toast,
} from '@grov/ui';

import {paths} from '../paths';

export function StoreMenu() {
  const stores = useMyStores();
  const switchStore = useSwitchStore();

  if (stores.isPending) return <Skeleton className="h-12 w-full rounded-md" />;

  if (stores.isError) {
    return (
      <DropdownMenu>
        <StoreTrigger title="Stores didn’t load" subtitle="Open to try again" attention />
        <DropdownMenuContent align="start" className={contentClass}>
          <DropdownMenuLabel>{errorMessage(stores.error)}</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => void stores.refetch()}>
            <RotateCw aria-hidden /> Try again
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const {activeStoreId, allStores, stores: options} = stores.data;

  if (options.length === 0) {
    return (
      <DropdownMenu>
        <StoreTrigger
          title="No stores yet"
          subtitle={allStores ? 'Add a store to start' : 'No store access'}
          attention
        />
        <DropdownMenuContent align="start" className={contentClass}>
          <DropdownMenuLabel>
            {allStores
              ? 'Store pages (listings, markups, stock, orders) need a store. Add the first one.'
              : 'You don’t have access to any store. Ask an admin to grant one.'}
          </DropdownMenuLabel>
          <Can allOf={[PERMISSIONS.STORES.READ]}>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={paths.stores}>
                <Plus aria-hidden /> Add a store
              </Link>
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const active = options.find(s => s.id === activeStoreId);

  const choose = (store: AdminStoreOption) => {
    if (store.id === activeStoreId) return;
    switchStore.mutate(store.id, {
      onSuccess: () => toast.success(`Now working in ${store.name}`),
      onError: error => toast.error(errorMessage(error)),
    });
  };

  return (
    <DropdownMenu>
      <StoreTrigger
        title={active?.name ?? 'Choose a store'}
        subtitle={
          allStores
            ? 'All stores access'
            : `${options.length} store${options.length === 1 ? '' : 's'}`
        }
        label={active ? `Working store: ${active.name}. Change store` : 'Choose a store'}
        tileName={active?.name}
        attention={!active}
        disabled={switchStore.isPending}
      />

      <DropdownMenuContent align="start" className={contentClass}>
        <DropdownMenuLabel>Switch store</DropdownMenuLabel>
        {options.map(store => {
          const inactive = store.status !== 'ACTIVE';
          return (
            <DropdownMenuItem
              key={store.id}
              disabled={inactive}
              onSelect={() => choose(store)}
              className="gap-3"
            >
              <StoreTile name={store.name} small />
              <span className="min-w-0 flex-1 truncate">{store.name}</span>
              {inactive ? <Tag>Inactive</Tag> : null}
              {store.id === activeStoreId ? (
                <Check aria-label="Current store" className="text-flame-strong" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
        <Can allOf={[PERMISSIONS.STORES.READ]}>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={paths.stores}>
              <Settings2 aria-hidden /> Manage stores
            </Link>
          </DropdownMenuItem>
        </Can>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const contentClass = 'w-[var(--radix-dropdown-menu-trigger-width)] min-w-64';

function StoreTrigger({
  title,
  subtitle,
  label,
  tileName,
  attention,
  disabled,
}: {
  title: string;
  subtitle: string;
  label?: string;
  tileName?: string;
  attention?: boolean;
  disabled?: boolean;
}) {
  return (
    <DropdownMenuTrigger
      disabled={disabled}
      aria-label={label ?? `${title}. ${subtitle}`}
      className={cn(
        'group flex h-12 w-full items-center gap-2.5 rounded-md border border-line bg-surface px-2 text-left transition-colors',
        'hover:bg-surface-raised data-[state=open]:bg-surface-raised disabled:opacity-60',
        attention && 'border-flame bg-flame-tint'
      )}
    >
      <StoreTile name={tileName} />
      <span className="grid min-w-0 flex-1">
        <span className="truncate text-body font-semibold text-ink">{title}</span>
        <span className="truncate text-body-sm text-ink-muted">{subtitle}</span>
      </span>
      <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-ink-muted" />
    </DropdownMenuTrigger>
  );
}

function StoreTile({name, small}: {name?: string; small?: boolean}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-sm bg-ink font-bold text-canvas',
        small ? 'size-6 text-body-sm' : 'size-8 text-body-sm'
      )}
    >
      {name ? name.trim().charAt(0).toUpperCase() : <Store className="size-4" />}
    </span>
  );
}
