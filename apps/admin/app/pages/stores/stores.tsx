import {MapPinned, Plus, Store} from 'lucide-react';
import {Link, useNavigate, useSearchParams} from 'react-router';

import {useCities, useStores} from '@grov/hooks';
import {appConfig, PERMISSIONS, type StoreStatus} from '@grov/models';
import {Can, errorMessage, PageHeader, usePermissions} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  formatNigerianPhone,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import {StoreStatusBadge} from '../../components/stores/status-badges';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {hasAllStores} from '../../lib/stores/store-rules';
import {paths, storePath} from '../../paths';
import type {Route} from './+types/stores';

export const handle = {
  requires: {allOf: [PERMISSIONS.STORES.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Stores · ${appConfig.brandName} admin`}];

const ALL = 'all';
type StatusFilter = StoreStatus | typeof ALL;

export default function Stores() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const cityId = params.get('cityId') ?? undefined;
  const statusParam = params.get('status');
  const status = statusParam === 'ACTIVE' || statusParam === 'INACTIVE' ? statusParam : undefined;

  const stores = useStores({cityId, status});
  const cities = useCities();
  const {access, can} = usePermissions();
  const canAdd = can(PERMISSIONS.STORES.MANAGE) && hasAllStores(access?.admin);
  const filtered = Boolean(cityId || status);

  const setFilter = (key: 'cityId' | 'status', value: string | undefined) =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      {replace: true}
    );

  const rows = stores.data?.pages.flatMap(page => page.data) ?? [];
  const noCities = cities.isSuccess && cities.data.length === 0;

  return (
    <>
      <PageHeader
        title="Stores"
        description={`${appConfig.brandName}’s own locations. Each one holds stock, packs orders and delivers inside its zone. Customers never pick a store: the nearest active store covering their address serves them.`}
        actions={
          canAdd && !noCities ? (
            <Button asChild>
              <Link to={paths.newStore}>
                <Plus aria-hidden /> Add store
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select
          value={cityId ?? ALL}
          onValueChange={v => setFilter('cityId', v === ALL ? undefined : v)}
        >
          <SelectTrigger aria-label="City" className="h-10 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All cities</SelectItem>
            {cities.data?.map(city => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Segmented<StatusFilter>
          label="Status"
          value={status ?? ALL}
          onChange={v => setFilter('status', v === ALL ? undefined : v)}
          options={[
            {value: ALL, label: 'All'},
            {value: 'ACTIVE', label: 'Active'},
            {value: 'INACTIVE', label: 'Inactive'},
          ]}
          size="sm"
        />
      </div>

      {stores.isPending ? (
        <Skeleton className="h-64" />
      ) : stores.isError ? (
        <Alert tone="danger" title="Couldn’t load stores">
          {errorMessage(stores.error)}
        </Alert>
      ) : rows.length === 0 ? (
        <Card>
          {noCities ? (
            <EmptyState
              icon={<MapPinned />}
              title="Add a city first"
              description="Every store belongs to a city, which holds the delivery defaults its stores share."
              action={
                <Can permission={PERMISSIONS.CITIES.MANAGE}>
                  <Button asChild>
                    <Link to={paths.cities}>Go to cities</Link>
                  </Button>
                </Can>
              }
            />
          ) : filtered ? (
            <EmptyState
              icon={<Store />}
              title="No stores match"
              description="Try another city or status."
              action={
                <Button variant="outline" onClick={() => setParams({}, {replace: true})}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Store />}
              title={canAdd ? 'No stores yet' : 'No stores to show'}
              description={
                canAdd
                  ? 'Add the first store: where it is, and the area it delivers to.'
                  : 'You haven’t been given any stores. Ask an admin with access to all stores.'
              }
              action={
                canAdd ? (
                  <Button asChild>
                    <Link to={paths.newStore}>
                      <Plus aria-hidden /> Add store
                    </Link>
                  </Button>
                ) : null
              }
            />
          )}
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery zone</TableHead>
                <TableHead className="hidden lg:table-cell">Address</TableHead>
                <TableHead className="hidden xl:table-cell">Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(store => (
                <TableRow
                  key={store.id}
                  className="cursor-pointer"
                  onClick={event => {
                    // The name is the real link; the row is a bigger target for mouse users.
                    if ((event.target as HTMLElement).closest('a')) return;
                    void navigate(storePath(store.id));
                  }}
                >
                  <TableCell>
                    <Link
                      to={storePath(store.id)}
                      className="font-semibold text-ink underline-offset-4 hover:underline"
                    >
                      {store.name}
                    </Link>
                    <div className="text-body-sm text-ink-muted">{store.slug}</div>
                  </TableCell>
                  <TableCell>{store.city.name}</TableCell>
                  <TableCell>
                    <StoreStatusBadge status={store.status} />
                  </TableCell>
                  <TableCell>
                    {store.hasDeliveryZone ? (
                      <span className="text-body-sm">Set</span>
                    ) : (
                      <Badge tone="palm">Not set</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden max-w-72 truncate text-body-sm text-ink-muted lg:table-cell">
                    {store.address}
                  </TableCell>
                  <TableCell className="hidden text-body-sm tabular text-ink-muted xl:table-cell">
                    {store.phoneNumber ? formatNigerianPhone(store.phoneNumber) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {stores.hasNextPage ? (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                loading={stores.isFetchingNextPage}
                onClick={() => void stores.fetchNextPage()}
              >
                Show more
              </Button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
