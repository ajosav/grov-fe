import type {ReactNode} from 'react';

import {
  Barcode,
  Boxes,
  CalendarClock,
  Eye,
  EyeOff,
  FolderTree,
  MoreHorizontal,
  Pencil,
  Store,
  Tag,
} from 'lucide-react';
import {Link} from 'react-router';

import {useUpdateProduct} from '@grov/hooks';
import type {Product, ProductPricing, ProductStock} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  formatNaira,
  toast,
} from '@grov/ui';

import {formatQty} from '../../../lib/catalogue/insight-format';
import {formatMoment} from '../../../lib/format/dates';
import {paths} from '../../../paths';
import {ProductThumb} from '../product-thumb';

export interface ProductWorkspaceHeaderProps {
  product: Product;
  categoryName: string | undefined;
  coverUrl: string | undefined;
  pricing: ProductPricing | undefined;
  stock: ProductStock | undefined;
  canManage: boolean;
  /** Unsaved edits block publishing from here (the edit form saves them first). */
  editsPending: boolean;
  onEdit: () => void;
}

function currentPrice(pricing: ProductPricing | undefined) {
  const size =
    pricing?.sizes.find(s => s.isDefault && s.active) ?? pricing?.sizes.find(s => s.active);
  if (!size) return null;
  const prices = size.stores.map(s => s.price.kobo);
  if (!prices.length)
    return {
      label: size.label,
      text: size.base ? `${formatNaira(size.base.kobo)} base` : 'Not priced',
    };
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return {
    label: size.label,
    text: min === max ? formatNaira(min) : `${formatNaira(min)} – ${formatNaira(max)}`,
  };
}

interface MetaProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

function Meta({icon, label, children}: MetaProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span aria-hidden className="text-ink-muted [&_svg]:size-4">
        {icon}
      </span>
      <dt className="sr-only">{label}</dt>
      <dd className="tabular">{children}</dd>
    </div>
  );
}

/** Who the product is, what it costs and whether it is available: the same on every tab. */
export function ProductWorkspaceHeader({
  product,
  categoryName,
  coverUrl,
  pricing,
  stock,
  canManage,
  editsPending,
  onEdit,
}: ProductWorkspaceHeaderProps) {
  const update = useUpdateProduct();
  const price = currentPrice(pricing);
  const totals = stock?.totals;
  const status = product.draft
    ? {label: 'Draft', tone: 'flame' as const}
    : product.active
      ? {label: 'Published', tone: 'leaf' as const}
      : {label: 'Unpublished', tone: 'neutral' as const};

  const setLive = (live: boolean) =>
    update.mutate(
      {id: product.id, body: product.draft ? {draft: false} : {active: live}},
      {
        onSuccess: saved =>
          toast.success(`${saved.displayName} ${live ? 'is live' : 'is hidden from shoppers'}`),
        onError: error => toast.error(errorMessage(error)),
      }
    );

  return (
    <div className="mb-2 rounded-lg border border-line bg-surface">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <ProductThumb
            url={coverUrl}
            name={product.displayName}
            className="size-16 rounded-md bg-surface-sunken"
          />
          <div className="grid min-w-0 content-start gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-title-lg">{product.displayName}</h1>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <p className="text-body-sm font-semibold">
              {product.brand ?? 'No brand'}
              {product.availableAtAllStores ? (
                <span className="font-normal text-ink-muted"> · Sold at every store</span>
              ) : null}
            </p>
            <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-body-sm">
              <Meta icon={<Barcode />} label="SKU">
                {product.sku}
              </Meta>
              <Meta icon={<FolderTree />} label="Category">
                {categoryName ?? '—'}
              </Meta>
              <Meta icon={<Tag />} label="Price">
                {price ? `${price.text} · ${price.label}` : 'Not priced'}
              </Meta>
              <Meta icon={<Boxes />} label="Available">
                {!totals || totals.trackedStores === 0
                  ? 'Stock not counted'
                  : `${formatQty(totals.availableQty, product.baseUnit)} at ${totals.trackedStores} store${totals.trackedStores === 1 ? '' : 's'}`}
                {totals?.outStores ? (
                  <span className="text-flame-strong"> · {totals.outStores} out</span>
                ) : null}
              </Meta>
              <Meta icon={<CalendarClock />} label="Updated">
                Updated {formatMoment(product.updatedAt)}
              </Meta>
            </dl>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label="More actions">
                <MoreHorizontal aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canManage ? (
                product.active ? (
                  <DropdownMenuItem disabled={update.isPending} onSelect={() => setLive(false)}>
                    <EyeOff aria-hidden /> Unpublish
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    disabled={update.isPending || editsPending}
                    onSelect={() => setLive(true)}
                  >
                    <Eye aria-hidden /> {product.draft ? 'Publish draft' : 'Publish'}
                  </DropdownMenuItem>
                )
              ) : null}
              {canManage ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem asChild>
                <Link to={paths.listings}>
                  <Store aria-hidden /> Store listings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={onEdit}>
            <Pencil aria-hidden /> {canManage ? 'Edit product' : 'Product information'}
          </Button>
        </div>
      </div>
    </div>
  );
}
