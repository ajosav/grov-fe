import {useState} from 'react';

import {Copy, MoreHorizontal, Percent, Plus, Store} from 'lucide-react';
import {Link, useSearchParams} from 'react-router';

import {
  useDelistProduct,
  useListings,
  useMyStores,
  usePutListing,
  useStoreMarkups,
} from '@grov/hooks';
import {appConfig, PERMISSIONS, type StoreListing} from '@grov/models';
import {Can, errorMessage, PageHeader} from '@grov/shared';
import {
  Alert,
  Banner,
  Button,
  Card,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Segmented,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@grov/ui';

import {AddListingsDialog} from '../../components/catalogue/add-listings-dialog';
import {CopyListingsDialog} from '../../components/catalogue/copy-listings-dialog';
import {ListingStateBadge} from '../../components/catalogue/listing-badges';
import {ListingEditDialog} from '../../components/catalogue/listing-edit-dialog';
import {MarkupDialog, type MarkupTarget} from '../../components/catalogue/markup-dialog';
import {formatDay} from '../../lib/dates';
import {formatQty, type ListingState, listingState, sellingBody} from '../../lib/listings';
import {describeMarkup, productMarkup, storeMarkup} from '../../lib/markups';
import type {AdminRouteHandle} from '../../lib/route-access';
import {productPath} from '../../paths';
import type {Route} from './+types/listings';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Store listings · ${appConfig.brandName} admin`},
];

type StateFilter = 'all' | ListingState;
const FILTERS: readonly StateFilter[] = ['all', 'ACTIVE', 'PAUSED', 'DELISTED'];
const isFilter = (value: string | null): value is StateFilter =>
  FILTERS.some(filter => filter === value);

export default function Listings() {
  const stores = useMyStores();
  const activeStore = stores.data?.stores.find(store => store.id === stores.data?.activeStoreId);
  const [params, setParams] = useSearchParams();
  const stateParam = params.get('state');
  const filter: StateFilter = isFilter(stateParam) ? stateParam : 'all';

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

          <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <Percent aria-hidden className="mt-0.5 size-5 text-ink-muted" />
              <div className="grid gap-0.5">
                <span className="text-label">Store-wide markup</span>
                <p className="text-body-sm text-ink-muted">
                  {markups.isPending
                    ? 'Loading…'
                    : markups.isError
                      ? 'Couldn’t load the markups.'
                      : wide && wide.kind !== 'NONE'
                        ? `${describeMarkup(wide)} on top of every base price at ${activeStore.name}.`
                        : `Shoppers pay the base price at ${activeStore.name}. Add a markup to charge more here.`}
                </p>
              </div>
            </div>
            <Can permission={PERMISSIONS.PRODUCTS.LISTINGS_WRITE}>
              <Button
                variant="outline"
                disabled={markups.isPending || markups.isError}
                onClick={() => setMarkupTarget({kind: 'store', storeName: activeStore.name})}
              >
                {wide && wide.kind !== 'NONE' ? 'Change markup' : 'Set markup'}
              </Button>
            </Can>
          </Card>

          <div className="mb-4">
            <Segmented<StateFilter>
              label="Listing status"
              value={filter}
              onChange={value => setParams(value === 'all' ? {} : {state: value}, {replace: true})}
              options={[
                {value: 'all', label: 'All'},
                {value: 'ACTIVE', label: 'Selling'},
                {value: 'PAUSED', label: 'Paused'},
                {value: 'DELISTED', label: 'Delisted'},
              ]}
              className="[&_button]:h-8"
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Markup</TableHead>
                    <TableHead className="hidden md:table-cell">Minimum order</TableHead>
                    <TableHead className="hidden lg:table-cell">Updated</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(listing => {
                    const state = listingState(listing);
                    return (
                      <TableRow key={listing.productId}>
                        <TableCell>
                          <Link
                            to={productPath(listing.productId)}
                            className="font-semibold text-ink underline-offset-4 hover:underline"
                          >
                            {listing.displayName}
                          </Link>
                          <div className="truncate text-body-sm text-ink-muted">{listing.sku}</div>
                        </TableCell>
                        <TableCell>
                          <ListingStateBadge listing={listing} />
                        </TableCell>
                        <TableCell className="hidden text-body-sm tabular md:table-cell">
                          {(() => {
                            const own = ownMarkup(listing.productId);
                            if (own === 'varies') return 'Varies by size';
                            if (own) return describeMarkup(own);
                            return <span className="text-ink-muted">Store-wide</span>;
                          })()}
                        </TableCell>
                        <TableCell className="hidden text-body-sm tabular md:table-cell">
                          {formatQty(listing.minOrderQty) ?? (
                            <span className="text-ink-muted">None</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden text-body-sm tabular text-ink-muted lg:table-cell">
                          {formatDay(listing.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Can permission={PERMISSIONS.PRODUCTS.LISTINGS_WRITE}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Actions for ${listing.displayName}`}
                                >
                                  <MoreHorizontal aria-hidden />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {state === 'DELISTED' ? (
                                  <DropdownMenuItem onSelect={() => resume(listing)}>
                                    List again
                                  </DropdownMenuItem>
                                ) : (
                                  <>
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        setMarkupTarget({
                                          kind: 'product',
                                          productId: listing.productId,
                                          displayName: listing.displayName,
                                        })
                                      }
                                    >
                                      Set markup
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setEditing(listing)}>
                                      {state === 'PAUSED'
                                        ? 'Change pause or minimum'
                                        : 'Pause or set minimum'}
                                    </DropdownMenuItem>
                                    {state === 'PAUSED' ? (
                                      <DropdownMenuItem onSelect={() => resume(listing)}>
                                        Resume sales
                                      </DropdownMenuItem>
                                    ) : null}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-danger"
                                      onSelect={() => setDelisting(listing)}
                                    >
                                      Delist
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </Can>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {listings.hasNextPage ? (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={listings.isFetchingNextPage}
                    onClick={() => void listings.fetchNextPage()}
                  >
                    Show more
                  </Button>
                </div>
              ) : null}
            </>
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
