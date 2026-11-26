import {ArrowDown, ArrowUp, ArrowUpDown} from 'lucide-react';
import {Link} from 'react-router';

import type {StockSort} from '@grov/api';
import type {StockOverviewRow} from '@grov/models';
import {
  cn,
  formatNaira,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import {formatQty} from '../../lib/catalogue/insight-format';
import {formatPace, priceMoveText} from '../../lib/stock/stock-format';
import {defaultDir} from '../../lib/stock/stock-view';
import {productPath} from '../../paths';
import {ProductThumb} from '../catalogue/product-thumb';
import {ChangeText} from '../catalogue/products/products-cells';
import {CoverMeter, LowBadge, RestockBadge} from './restock-badge';
import {StockRowActions, type StockRowActionsProps} from './stock-row-actions';

export interface StockTableProps extends Pick<StockRowActionsProps, 'canWrite' | 'onAction'> {
  rows: StockOverviewRow[];
  coverFor: (path: string | null) => string | undefined;
  sort: StockSort;
  dir: 'asc' | 'desc';
  onSort: (sort: StockSort, dir: 'asc' | 'desc') => void;
}

function SortHead({
  label,
  field,
  sort,
  dir,
  onSort,
  className,
}: {
  label: string;
  field: StockSort;
  sort: StockSort;
  dir: 'asc' | 'desc';
  onSort: StockTableProps['onSort'];
  className?: string;
}) {
  const active = sort === field;
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <TableHead
      className={className}
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(field, active ? (dir === 'asc' ? 'desc' : 'asc') : defaultDir(field))}
        className={cn(
          'inline-flex items-center gap-1 rounded-sm uppercase tracking-wide hover:text-ink',
          active && 'text-ink'
        )}
      >
        {label}
        <Icon aria-hidden className="size-3" />
      </button>
    </TableHead>
  );
}

/** Every product the store counts: how much is left, how long it lasts, and what to buy. */
export function StockTable({
  rows,
  coverFor,
  sort,
  dir,
  onSort,
  canWrite,
  onAction,
}: StockTableProps) {
  const head = {sort, dir, onSort};
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortHead label="Product" field="name" {...head} />
          <TableHead>Status</TableHead>
          <SortHead label="Available" field="available" {...head} className="text-right" />
          <SortHead label="Cover" field="cover" {...head} className="min-w-36" />
          <SortHead
            label="Selling"
            field="sold"
            {...head}
            className="hidden text-right @3xl:table-cell"
          />
          <TableHead className="hidden text-right @4xl:table-cell">Base price</TableHead>
          <SortHead
            label="Value"
            field="value"
            {...head}
            className="hidden text-right @4xl:table-cell"
          />
          <TableHead className="text-right">To buy</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(row => {
          const move = priceMoveText(row);
          return (
            <TableRow key={row.productId}>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <ProductThumb url={coverFor(row.coverImagePath)} name={row.displayName} />
                  <div className="min-w-0">
                    <Link
                      to={productPath(row.productId, 'inventory')}
                      className="block truncate font-semibold text-ink underline-offset-4 hover:underline"
                    >
                      {row.displayName}
                    </Link>
                    <div className="truncate text-body-sm text-ink-muted">
                      {row.sku} · {row.categoryName}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1">
                  <RestockBadge status={row.status} />
                  {row.low && row.status !== 'OUT' ? <LowBadge /> : null}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="font-semibold tabular">
                  {formatQty(row.availableQty, row.baseUnit)}
                </div>
                <div className="text-body-sm text-ink-muted tabular">
                  {row.reservedQty > 0
                    ? `${formatQty(row.reservedQty, row.baseUnit)} reserved`
                    : `${formatQty(row.onHandQty, row.baseUnit)} on hand`}
                </div>
              </TableCell>
              <TableCell>
                <CoverMeter row={row} />
              </TableCell>
              <TableCell className="hidden text-right @3xl:table-cell">
                <div className="tabular">{formatPace(row.perDay, row.baseUnit)}</div>
                <ChangeText bps={row.trendBps} />
              </TableCell>
              <TableCell className="hidden text-right @4xl:table-cell">
                {row.basePrice ? (
                  <>
                    <div className="tabular">{formatNaira(row.basePrice.kobo)}</div>
                    <div
                      className={cn(
                        'text-body-sm tabular',
                        (row.priceMoveBps ?? 0) >= 500 ? 'text-flame-strong' : 'text-ink-muted'
                      )}
                    >
                      {move ?? row.sizeLabel ?? ''}
                    </div>
                  </>
                ) : (
                  <span className="text-ink-muted">No price</span>
                )}
              </TableCell>
              <TableCell className="hidden text-right @4xl:table-cell">
                <div className="tabular">{formatNaira(row.costValue.kobo)}</div>
                <div className="text-body-sm text-ink-muted tabular">
                  {formatNaira(row.retailValue.kobo)} retail
                </div>
              </TableCell>
              <TableCell className="text-right">
                {row.suggestedQty > 0 ? (
                  <>
                    <div className="font-semibold tabular">
                      {formatQty(row.suggestedQty, row.baseUnit)}
                    </div>
                    <div className="text-body-sm text-ink-muted tabular">
                      {row.restockCost.kobo > 0 ? `≈ ${formatNaira(row.restockCost.kobo)}` : ''}
                    </div>
                  </>
                ) : (
                  <span className="text-ink-muted">—</span>
                )}
              </TableCell>
              <TableCell>
                <StockRowActions row={row} canWrite={canWrite} onAction={onAction} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
