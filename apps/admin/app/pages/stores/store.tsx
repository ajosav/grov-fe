import {ArrowLeft, Plus, Store as StoreIcon, UsersRound} from 'lucide-react';
import {Link, useParams, useSearchParams} from 'react-router';

import {isApiError} from '@grov/api';
import {useStore} from '@grov/hooks';
import {appConfig, ErrorCode, PERMISSIONS} from '@grov/models';
import {Can, errorMessage, NoAccess, RequirePermission, usePermissions} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@grov/ui';

import {InviteDialog} from '../../components/access/invite-dialog';
import {StaffTable} from '../../components/access/staff-table';
import {StoreStatusBadge} from '../../components/stores/status-badges';
import {StoreDeliverySettings} from '../../components/stores/store-delivery-settings';
import {StoreOverview} from '../../components/stores/store-overview';
import {ZoneEditor} from '../../components/stores/zone-editor';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {paths} from '../../paths';
import type {Route} from './+types/store';

export const handle = {
  requires: {allOf: [PERMISSIONS.STORES.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Store · ${appConfig.brandName} admin`}];

const TABS = ['overview', 'zone', 'delivery', 'staff'] as const;
type Tab = (typeof TABS)[number];
const isTab = (value: string | null): value is Tab => TABS.includes(value as Tab);

export default function StorePage() {
  const {storeId} = useParams();
  const [params, setParams] = useSearchParams();
  const tab: Tab = isTab(params.get('tab')) ? (params.get('tab') as Tab) : 'overview';
  const store = useStore(storeId);
  const {can} = usePermissions();
  // grov-be checks the store is in this admin's scope; the list only shows those stores.
  const canManage = can(PERMISSIONS.STORES.MANAGE);

  const back = (
    <Link
      to={paths.stores}
      className="mb-3 inline-flex items-center gap-1 text-body-sm text-ink-muted hover:text-ink"
    >
      <ArrowLeft aria-hidden className="size-4" /> Stores
    </Link>
  );

  if (store.isPending) {
    return (
      <>
        {back}
        <Skeleton className="mb-6 h-10 w-72" />
        <Skeleton className="h-96" />
      </>
    );
  }

  if (store.isError) {
    const code = isApiError(store.error) ? store.error.code : undefined;
    if (code === ErrorCode.STORE_OUT_OF_SCOPE || code === ErrorCode.PERMISSION_DENIED) {
      return (
        <NoAccess
          title="You don’t have access to this store"
          description="Ask an admin with access to all stores to add it to your stores."
        />
      );
    }
    if (code === ErrorCode.STORE_NOT_FOUND || code === ErrorCode.NOT_FOUND) {
      return (
        <>
          {back}
          <Card>
            <EmptyState
              icon={<StoreIcon />}
              title="Store not found"
              description="It may have been removed, or the link is wrong."
              action={
                <Button asChild variant="outline">
                  <Link to={paths.stores}>All stores</Link>
                </Button>
              }
            />
          </Card>
        </>
      );
    }
    return (
      <>
        {back}
        <Alert tone="danger" title="Couldn’t load this store">
          {errorMessage(store.error)}
        </Alert>
      </>
    );
  }

  const data = store.data;
  return (
    <>
      {back}
      <header className="grid gap-1 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-title-lg">{data.name}</h1>
          <StoreStatusBadge status={data.status} />
          {!data.hasDeliveryZone ? <Badge tone="palm">No delivery zone</Badge> : null}
        </div>
        <p className="text-body text-ink-muted">
          {data.city.name} · {data.slug}
        </p>
      </header>

      <Tabs
        value={tab}
        onValueChange={value =>
          setParams(
            previous => {
              const next = new URLSearchParams(previous);
              if (value === 'overview') next.delete('tab');
              else next.set('tab', value);
              return next;
            },
            {replace: true}
          )
        }
      >
        <TabsList className="mb-5 max-w-full justify-start overflow-x-auto [&_button]:h-8 [&_button]:shrink-0 [&_button]:whitespace-nowrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zone">Delivery zone</TabsTrigger>
          <TabsTrigger value="delivery">Delivery settings</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <StoreOverview store={data} canManage={canManage} />
        </TabsContent>
        <TabsContent value="zone">
          <ZoneEditor store={data} canManage={canManage} />
        </TabsContent>
        <TabsContent value="delivery">
          <StoreDeliverySettings store={data} canManage={canManage} />
        </TabsContent>
        <TabsContent value="staff">
          <RequirePermission
            allOf={[PERMISSIONS.ACCESS.STAFF_READ]}
            fallback={
              <Card>
                <EmptyState
                  icon={<UsersRound />}
                  title="Staff for this store"
                  description="You need permission to view staff to see who works here."
                />
              </Card>
            }
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-2xl text-body-sm text-ink-muted">
                Everyone who can work in {data.name}: given this store, all stores, or super admin.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={paths.staff}>All staff</Link>
                </Button>
                <Can permission={PERMISSIONS.ACCESS.STAFF_INVITE}>
                  <InviteDialog
                    storeId={data.id}
                    trigger={
                      <Button size="sm">
                        <Plus aria-hidden /> Invite to this store
                      </Button>
                    }
                  />
                </Can>
              </div>
            </div>
            <StaffTable filters={{storeId: data.id}} showStores={false} />
          </RequirePermission>
        </TabsContent>
      </Tabs>
    </>
  );
}
