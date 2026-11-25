import {Link} from 'react-router';

import type {CatalogueRow, StockState} from '@grov/models';
import {cn, formatNaira} from '@grov/ui';

import {formatChange} from '../../../lib/catalogue/insight-format';
import {productPath} from '../../../paths';
import {ProductThumb} from '../product-thumb';

export const STOCK_BADGE: Record<
  StockState,
  {label: string; tone: 'neutral' | 'palm' | 'flame' | 'sky'}
> = {
  IN_STOCK: {label: 'In stock', tone: 'neutral'},
  LOW: {label: 'Low', tone: 'palm'},
  OUT: {label: 'Out of stock', tone: 'flame'},
  UNTRACKED: {label: 'Not counted', tone: 'sky'},
};

export function priceText(row: CatalogueRow) {
  if (!row.priceMin) return '—';
  if (row.priceMax && row.priceMax.kobo !== row.priceMin.kobo) {
    return `from ${formatNaira(row.priceMin.kobo)}`;
  }
  return formatNaira(row.priceMin.kobo);
}

/** What every catalogue layout gets from the page. */
export interface CatalogueLayoutProps {
  rows: CatalogueRow[];
  coverFor: (path: string | null) => string | undefined;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  canManage: boolean;
  onPublish: (row: CatalogueRow, publish: boolean) => void;
}

export interface ProductCellProps {
  row: CatalogueRow;
  cover: string | undefined;
}

/** Photo, name, SKU and default size, with the open-recommendation count. */
export function ProductCell({row, cover}: ProductCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProductThumb url={cover} name={row.displayName} />
      <div className="min-w-0">
        <Link
          to={productPath(row.id)}
          className="block truncate font-semibold text-ink underline-offset-4 hover:underline"
        >
          {row.displayName}
        </Link>
        <div className="truncate text-body-sm text-ink-muted">
          {row.sku}
          {row.defaultSizeLabel ? ` · ${row.defaultSizeLabel}` : ''}
          {row.sizes > 1 ? ` +${row.sizes - 1}` : ''}
        </div>
      </div>
    </div>
  );
}

export interface ChangeTextProps {
  bps: number | null;
}

/** A period-over-period change; falls read in flame so they stand out. */
export function ChangeText({bps}: ChangeTextProps) {
  const text = formatChange(bps);
  if (!text) return null;
  return (
    <span
      className={cn(
        'text-body-sm tabular',
        (bps ?? 0) < 0 ? 'text-flame-strong' : 'text-ink-muted'
      )}
    >
      {text}
    </span>
  );
}
