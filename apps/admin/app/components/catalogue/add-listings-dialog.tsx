import {type ReactNode, useState} from 'react';

import {Search} from 'lucide-react';

import {useDebounce, useProducts, usePutListing} from '@grov/hooks';
import type {ProductSummary} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Skeleton,
  toast,
} from '@grov/ui';

export interface AddListingsDialogProps {
  storeId: string;
  storeName: string;
  trigger: ReactNode;
}

/** Find a product in the master list and list it at the active store. */
export function AddListingsDialog({storeId, storeName, trigger}: AddListingsDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent layout="side" className="max-w-xl content-start">
        {open ? <Picker storeId={storeId} storeName={storeName} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function Picker({storeId, storeName}: {storeId: string; storeName: string}) {
  const [text, setText] = useState('');
  const q = useDebounce(text.trim(), 300);
  // The server leaves out what is already live at this store, so nothing here can overwrite a
  // pause, and no whole-store listing has to be loaded first. A product that was delisted
  // earlier still shows: listing it again starts it fresh.
  const products = useProducts({q: q || undefined, active: true, storeId, listed: false});
  const put = usePutListing();
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = products.data?.pages.flatMap(page => page.data) ?? [];

  const list = (product: ProductSummary) => {
    setBusyId(product.id);
    put.mutate(
      {productId: product.id, body: {active: true, pausedUntil: null, minOrderQty: null}},
      {
        onSuccess: () => toast.success(`${product.displayName} listed at ${storeName}`),
        onSettled: () => setBusyId(null),
      }
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add products to {storeName}</DialogTitle>
        <DialogDescription>
          Search the product master for what this store doesn’t sell yet. Only active products can
          be listed.
        </DialogDescription>
      </DialogHeader>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          type="search"
          aria-label="Search products"
          placeholder="Search name, SKU or brand"
          autoComplete="off"
          autoFocus
          className="h-10 pl-9"
          value={text}
          onChange={event => setText(event.target.value)}
        />
      </div>
      {put.isError ? <Alert tone="danger">{errorMessage(put.error)}</Alert> : null}
      {products.isPending ? (
        <Skeleton className="h-48" />
      ) : products.isError ? (
        <Alert tone="danger" title="Couldn’t load products">
          {errorMessage(products.error)}
        </Alert>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-body text-ink-muted">
          {q
            ? 'No active product that isn’t already listed here matches.'
            : `Every active product is already listed at ${storeName}.`}
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-md border border-line">
          {rows.map(product => (
            <li key={product.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{product.displayName}</div>
                <div className="truncate text-body-sm text-ink-muted">
                  {product.sku}
                  {product.brand ? ` · ${product.brand}` : ''}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                loading={busyId === product.id}
                disabled={busyId !== null}
                onClick={() => list(product)}
                aria-label={`List ${product.displayName}`}
              >
                List
              </Button>
            </li>
          ))}
        </ul>
      )}
      {products.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            loading={products.isFetchingNextPage}
            onClick={() => void products.fetchNextPage()}
          >
            Show more
          </Button>
        </div>
      ) : null}
    </>
  );
}
