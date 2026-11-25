import {ArrowDown, ArrowUp, ArrowUpDown} from 'lucide-react';
import {Link} from 'react-router';

import type {CatalogueSort} from '@grov/api';
import {
  Badge,
  Button,
  Checkbox,
  formatNaira,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import type {CatalogueState, ColumnKey} from '../../../lib/catalogue/catalogue-view';
import {formatBps, formatCount, formatQty} from '../../../lib/catalogue/insight-format';
import {formatDay} from '../../../lib/format/dates';
import {productPath} from '../../../paths';
import {ActiveBadge} from '../category-badges';
import {ProductRowActions} from './product-row-actions';
import {
  type CatalogueLayoutProps,
  ChangeText,
  priceText,
  ProductCell,
  STOCK_BADGE,
} from './products-cells';

export interface ProductsTableProps extends CatalogueLayoutProps {
  hidden: ColumnKey[];
  state: CatalogueState;
  onSort: (sort: CatalogueSort) => void;
}

interface SortHeadProps {
  label: string;
  sort: CatalogueSort;
  state: CatalogueState;
  onSort: (sort: CatalogueSort) => void;
  className?: string;
}

function SortHead({label, sort, state, onSort, className}: SortHeadProps) {
  const active = state.sort === sort;
  const Icon = !active ? ArrowUpDown : state.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <TableHead
      className={className}
      aria-sort={active ? (state.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(sort)}
        className="inline-flex items-center gap-1 hover:text-ink"
      >
        {label}
        <Icon aria-hidden className="size-3.5" />
      </button>
    </TableHead>
  );
}

/** Dense table: the default. Sorting is server-side; every column can be hidden. */
export function ProductsTable({
  rows,
  coverFor,
  selected,
  onToggle,
  onToggleAll,
  hidden,
  state,
  onSort,
  ...actions
}: ProductsTableProps) {
  const show = (key: ColumnKey) => !hidden.includes(key);
  const all = rows.length > 0 && rows.every(row => selected.has(row.id));
  const some = rows.some(row => selected.has(row.id));
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              aria-label="Select all on this page"
              checked={all ? true : some ? 'indeterminate' : false}
              onCheckedChange={checked => onToggleAll(checked === true)}
            />
          </TableHead>
          <SortHead label="Product" sort="name" state={state} onSort={onSort} />
          {show('category') ? (
            <TableHead className="hidden @3xl:table-cell">Category</TableHead>
          ) : null}
          {show('price') ? (
            <SortHead
              label="Price"
              sort="price"
              state={state}
              onSort={onSort}
              className="text-right"
            />
          ) : null}
          {show('stock') ? (
            <SortHead
              label="Available"
              sort="stock"
              state={state}
              onSort={onSort}
              className="text-right"
            />
          ) : null}
          {show('sold') ? (
            <SortHead
              label="Sold"
              sort="sold"
              state={state}
              onSort={onSort}
              className="text-right"
            />
          ) : null}
          {show('viewers') ? (
            <SortHead
              label="Viewers"
              sort="viewers"
              state={state}
              onSort={onSort}
              className="hidden text-right @2xl:table-cell"
            />
          ) : null}
          {show('conversion') ? (
            <SortHead
              label="Conversion"
              sort="conversion"
              state={state}
              onSort={onSort}
              className="hidden text-right @2xl:table-cell"
            />
          ) : null}
          {show('revenue') ? (
            <SortHead
              label="Revenue"
              sort="revenue"
              state={state}
              onSort={onSort}
              className="text-right"
            />
          ) : null}
          {show('margin') ? (
            <SortHead
              label="Margin"
              sort="margin"
              state={state}
              onSort={onSort}
              className="text-right"
            />
          ) : null}
          {show('status') ? <TableHead>Status</TableHead> : null}
          {show('updated') ? (
            <SortHead
              label="Updated"
              sort="updated"
              state={state}
              onSort={onSort}
              className="hidden @4xl:table-cell"
            />
          ) : null}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(row => (
          <TableRow key={row.id} data-state={selected.has(row.id) ? 'selected' : undefined}>
            <TableCell>
              <Checkbox
                aria-label={`Select ${row.displayName}`}
                checked={selected.has(row.id)}
                onCheckedChange={() => onToggle(row.id)}
              />
            </TableCell>
            <TableCell className="min-w-48 max-w-80">
              <ProductCell row={row} cover={coverFor(row.coverImagePath)} />
            </TableCell>
            {show('category') ? (
              <TableCell className="hidden text-body-sm @3xl:table-cell">
                {row.categoryName}
              </TableCell>
            ) : null}
            {show('price') ? (
              <TableCell className="text-right tabular">{priceText(row)}</TableCell>
            ) : null}
            {show('stock') ? (
              <TableCell className="text-right">
                <div className="tabular">
                  {row.availableQty === null ? '—' : formatQty(row.availableQty, row.baseUnit)}
                </div>
                {row.stockState !== 'IN_STOCK' ? (
                  <Badge tone={STOCK_BADGE[row.stockState].tone}>
                    {STOCK_BADGE[row.stockState].label}
                  </Badge>
                ) : null}
              </TableCell>
            ) : null}
            {show('sold') ? (
              <TableCell className="text-right tabular whitespace-nowrap">
                <div>{formatQty(row.qtySold, row.baseUnit)}</div>
                <div className="text-body-sm text-ink-muted">{formatCount(row.orders)} orders</div>
              </TableCell>
            ) : null}
            {show('viewers') ? (
              <TableCell className="hidden text-right tabular @2xl:table-cell">
                {formatCount(row.viewers)}
              </TableCell>
            ) : null}
            {show('conversion') ? (
              <TableCell className="hidden text-right tabular @2xl:table-cell">
                {formatBps(row.conversionBps)}
              </TableCell>
            ) : null}
            {show('revenue') ? (
              <TableCell className="text-right tabular">
                <div>{formatNaira(row.revenue.kobo)}</div>
                <ChangeText bps={row.revenueChangeBps} />
              </TableCell>
            ) : null}
            {show('margin') ? (
              <TableCell className="text-right tabular">{formatBps(row.marginBps)}</TableCell>
            ) : null}
            {show('status') ? (
              <TableCell>
                <ActiveBadge active={row.active} draft={row.draft} />
              </TableCell>
            ) : null}
            {show('updated') ? (
              <TableCell className="hidden text-body-sm tabular text-ink-muted @4xl:table-cell">
                {formatDay(row.updatedAt)}
              </TableCell>
            ) : null}
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button asChild size="sm" variant="secondary" className="h-8">
                  <Link to={productPath(row.id)}>View</Link>
                </Button>
                <ProductRowActions row={row} {...actions} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
