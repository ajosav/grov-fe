import {Link} from 'react-router';

import type {CatalogueRow, StockState} from '@grov/models';
import {Badge, cn, formatNaira, Tooltip} from '@grov/ui';

import {formatChange} from '../../../lib/catalogue/insight-format';
import {productPath} from '../../../paths';
import {ProductThumb} from '../product-thumb';

export const STOCK_BADGE: Record<
  StockState,
  {label: string; tone: 'neutral' | 'palm' | 'flame' | 'sky'; hint: string}
> = {
  IN_STOCK: {
    label: 'In stock',
    tone: 'neutral',
    hint: 'Available in every store that counts this product, and above its low-stock level.',
  },
  LOW: {
    label: 'Low',
    tone: 'palm',
    hint: 'At least one store is at or below its low-stock level, or has none available.',
  },
  OUT: {
    label: 'Out of stock',
    tone: 'flame',
    hint: 'Nothing is available to sell in any store that counts this product.',
  },
  UNTRACKED: {
    label: 'Not counted',
    tone: 'sky',
    hint: 'No stock has been recorded for this product in any store, so its level is unknown.',
  },
};

/** Stock-state badge with a hover explanation. */
export function StockStateBadge({state}: {state: StockState}) {
  const {label, tone, hint} = STOCK_BADGE[state];
  return (
    <Tooltip content={hint}>
      <Badge tone={tone} tabIndex={0} className="cursor-help">
        {label}
      </Badge>
    </Tooltip>
  );
}

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
