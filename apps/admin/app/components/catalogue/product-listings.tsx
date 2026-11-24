import {useState} from 'react';

import {MoreHorizontal} from 'lucide-react';

import {useDelistProductAt, useProductListings, usePutProductListing} from '@grov/hooks';
import {type Product, type ProductListing} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
  toast,
} from '@grov/ui';

import {listingState, sellingBody} from '../../lib/listings';
import {formatAmount} from '../../lib/units';
import {ListingStateBadge} from './listing-badges';
import {ListingEditDialog} from './listing-edit-dialog';

export interface ProductListingsProps {
  product: Product;
  /** Needs products.listings.write; without it the list is read-only. */
  canChange: boolean;
}

/**
 * The stores that list this product, with their state, and the actions the Store listings
 * page has (pause, resume, delist, list again), without switching store first.
 */
export function ProductListings({product, canChange}: ProductListingsProps) {
  const listings = useProductListings(product.id);
  const put = usePutProductListing();
  const delist = useDelistProductAt();
  const [editing, setEditing] = useState<ProductListing | null>(null);
  const [delisting, setDelisting] = useState<ProductListing | null>(null);

  if (listings.isPending) return <Skeleton className="h-24" />;
  if (listings.isError) {
    return (
      <Alert tone="danger" title="Couldn’t load where this is listed">
        {errorMessage(listings.error)}
      </Alert>
    );
  }

  const items = listings.data;

  if (items.length === 0) {
    return (
      <p className="text-body text-ink-muted">
        Not listed at any store you manage yet.
        {canChange ? ' Choose stores below to list it.' : ''}
      </p>
    );
  }

  const resume = (item: ProductListing) =>
    put.mutate(
      {
        productId: product.id,
        storeId: item.storeId,
        body: sellingBody(item),
      },
      {onSuccess: () => toast.success(`Listed at ${item.storeName}`)}
    );

  return (
    <>
      {put.isError ? <Alert tone="danger">{errorMessage(put.error)}</Alert> : null}
      <ul className="divide-y divide-line rounded-md border border-line">
        {items.map(item => {
          const state = listingState(item);
          const minimum = formatAmount(item.minOrderQty, product.baseUnit);
          return (
            <li key={item.storeId} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{item.storeName}</div>
                <div className="text-body-sm text-ink-muted">
                  {minimum ? `Minimum order ${minimum}` : 'No minimum order'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ListingStateBadge listing={item} />
                {canChange ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${item.storeName}`}
                      >
                        <MoreHorizontal aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {state === 'DELISTED' ? (
                        <DropdownMenuItem onSelect={() => resume(item)}>
                          List again
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem onSelect={() => setEditing(item)}>
                            Pause or set minimum
                          </DropdownMenuItem>
                          {state === 'PAUSED' ? (
                            <DropdownMenuItem onSelect={() => resume(item)}>
                              Resume sales
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onSelect={() => setDelisting(item)}>
                            Delist
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : state === 'DELISTED' ? (
                  <Badge tone="neutral">Not sold</Badge>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <ListingEditDialog
        listing={
          editing
            ? {
                productId: product.id,
                displayName: `${product.displayName} at ${editing.storeName}`,
                active: editing.active,
                pausedUntil: editing.pausedUntil,
                minOrderQty: editing.minOrderQty,
              }
            : null
        }
        storeId={editing?.storeId}
        unit={product.baseUnit}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={delisting !== null}
        onOpenChange={open => {
          if (!open) setDelisting(null);
        }}
        title={`Delist ${product.displayName} at ${delisting?.storeName ?? 'this store'}?`}
        description="Shoppers will stop seeing it there. You can list it again later."
        confirmLabel="Delist"
        tone="danger"
        loading={delist.isPending}
        onConfirm={() => {
          if (!delisting) return;
          delist.mutate(
            {productId: product.id, storeId: delisting.storeId},
            {
              onSuccess: () => {
                toast.success(`Delisted at ${delisting.storeName}`);
                setDelisting(null);
              },
            }
          );
        }}
      >
        {delist.isError ? <Alert tone="danger">{errorMessage(delist.error)}</Alert> : null}
      </ConfirmDialog>
    </>
  );
}
