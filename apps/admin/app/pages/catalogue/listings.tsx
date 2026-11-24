import {useState} from 'react';

import {Copy, Plus, Store} from 'lucide-react';
import {useSearchParams} from 'react-router';

import {
  useDelistProduct,
  useListings,
  useMyStores,
  usePutListing,
  useStoreMarkups,
} from '@grov/hooks';
import {appConfig, PERMISSIONS, type StoreListing} from '@grov/models';
import {Can, errorMessage, PageHeader} from '@grov/shared';
import {Alert, Banner, Button, Card, ConfirmDialog, EmptyState, Skeleton, toast} from '@grov/ui';

import {AddListingsDialog} from '../../components/catalogue/add-listings-dialog';
import {CopyListingsDialog} from '../../components/catalogue/copy-listings-dialog';
import {ListingEditDialog} from '../../components/catalogue/listing-edit-dialog';
import {
  isStateFilter,
  ListingStateFilter,
  type StateFilter,
} from '../../components/catalogue/listings/listing-state-filter';
import {ListingsTable} from '../../components/catalogue/listings/listings-table';
import {StoreMarkupCard} from '../../components/catalogue/listings/store-markup-card';
import {MarkupDialog, type MarkupTarget} from '../../components/catalogue/markup-dialog';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {sellingBody} from '../../lib/catalogue/listings';
import {productMarkup, storeMarkup} from '../../lib/catalogue/markups';
import type {Route} from './+types/listings';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Store listings · ${appConfig.brandName} admin`},
];

export default function Listings() {
  const stores = useMyStores();
  const activeStore = stores.data?.stores.find(store => store.id === stores.data?.activeStoreId);
  const [params, setParams] = useSearchParams();
  const stateParam = params.get('state');
  const filter: StateFilter = isStateFilter(stateParam) ? stateParam : 'all';

  const listings = useListings({state: filter === 'all' ? undefined : filter});
  const rows = listings.data?.pages.flatMap(page => page.data) ?? [];

  const [editing, setEditing] = useState<StoreListing | null>(null);
  const [delisting, setDelisting] = useState<StoreListing | null>(null);
  const [markupTarget, setMarkupTarget] = useState<MarkupTarget | null>(null);
  const markups = useStoreMarkups();
  const markupRows = markups.data ?? [];
  const wide = storeMarkup(markupRows);
  const ownMarkup = (productId: string) => productMarkup(markupRows, productId);
  const put = usePutListing();
  const delist = useDelistProduct();

  const actions = activeStore ? (
    <Can permission={PERMISSIONS.PRODUCTS.LISTINGS_WRITE}>
      <div className="flex flex-wrap gap-2">
        <CopyListingsDialog
          activeStoreId={activeStore.id}
          activeStoreName={activeStore.name}
          trigger={
            <Button variant="outline">
              <Copy aria-hidden /> Copy from a store
            </Button>
          }
        />
        <AddListingsDialog
          storeId={activeStore.id}
          storeName={activeStore.name}
          trigger={
            <Button>
              <Plus aria-hidden /> Add products
            </Button>
          }
        />
      </div>
    </Can>
  ) : undefined;

  const resume = (listing: StoreListing) =>
    put.mutate(
      {productId: listing.productId, body: sellingBody(listing)},
      {
        onSuccess: () => toast.success(`${listing.displayName} is selling again`),
      }
    );

  return (
    <>
      <PageHeader
        title="Store listings"
        description="Which products this store sells, and what it adds to their prices."
        actions={actions}
      />

      {stores.isPending ? (
        <Skeleton className="h-64" />
      ) : !activeStore ? (
        <Card>
          <EmptyState
            icon={<Store />}
            title="Choose a store first"
            description="Listings belong to one store. Pick one from the store menu at the top of the sidebar."
          />
        </Card>
      ) : (
        <>
          <Banner
            tone="neutral"
            icon={<Store aria-hidden />}
            className="mb-4"
            title={`Showing ${activeStore.name}`}
          >
            Listings work one store at a time. Change the store from the store menu in the sidebar.
          </Banner>

          <StoreMarkupCard
            storeName={activeStore.name}
            markup={wide}
            isPending={markups.isPending}
            isError={markups.isError}
            onChange={() => setMarkupTarget({kind: 'store', storeName: activeStore.name})}
          />

          <div className="mb-4">
            <ListingStateFilter
              value={filter}
              onChange={value => setParams(value === 'all' ? {} : {state: value}, {replace: true})}
            />
          </div>

          {listings.isPending ? (
            <Skeleton className="h-64" />
          ) : listings.isError ? (
            <Alert tone="danger" title="Couldn’t load listings">
              {errorMessage(listings.error)}
            </Alert>
          ) : rows.length === 0 ? (
            <Card>
              {filter === 'all' ? (
                <EmptyState
                  icon={<Store />}
                  title={`${activeStore.name} doesn’t list any products yet`}
                  description="Add products one by one, or copy the listings of a store you already set up."
                  action={actions}
                />
              ) : (
                <EmptyState
                  icon={<Store />}
                  title="Nothing here"
                  description={`No ${filter === 'ACTIVE' ? 'selling' : filter === 'PAUSED' ? 'paused' : 'delisted'} products at this store.`}
                  action={
                    <Button variant="outline" onClick={() => setParams({}, {replace: true})}>
                      Show all
                    </Button>
                  }
                />
              )}
            </Card>
          ) : (
            <ListingsTable
              rows={rows}
              ownMarkup={ownMarkup}
              onEdit={setEditing}
              onSetMarkup={listing =>
                setMarkupTarget({
                  kind: 'product',
                  productId: listing.productId,
                  displayName: listing.displayName,
                })
              }
              onDelist={setDelisting}
              onResume={resume}
              hasNextPage={listings.hasNextPage}
              isFetchingNextPage={listings.isFetchingNextPage}
              onLoadMore={() => void listings.fetchNextPage()}
            />
          )}
        </>
      )}

      <ListingEditDialog listing={editing} onClose={() => setEditing(null)} />
      <MarkupDialog
        target={markupTarget}
        current={
          markupTarget?.kind === 'product'
            ? (() => {
                const own = ownMarkup(markupTarget.productId);
                return own === 'varies' ? undefined : own;
              })()
            : wide
        }
        onClose={() => setMarkupTarget(null)}
      />
      <ConfirmDialog
        open={delisting !== null}
        onOpenChange={open => (open ? undefined : setDelisting(null))}
        title={`Delist ${delisting?.displayName ?? 'this product'}?`}
        description={`Shoppers will stop seeing it at ${activeStore?.name ?? 'this store'}. You can list it again later.`}
        confirmLabel="Delist"
        tone="danger"
        loading={delist.isPending}
        onConfirm={() => {
          if (!delisting) return;
          delist.mutate(delisting.productId, {
            onSuccess: () => {
              toast.success(`${delisting.displayName} delisted`);
              setDelisting(null);
            },
            onError: () => setDelisting(null),
          });
        }}
      />
    </>
  );
}
