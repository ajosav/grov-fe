import {type ReactNode, useState} from 'react';

import {BarChart3, ChevronDown, Eye, EyeOff, Pencil, Tag} from 'lucide-react';
import {Link, useNavigate} from 'react-router';

import type {CatalogueRow} from '@grov/models';
import {
  Badge,
  Checkbox,
  cn,
  DropdownMenuItem,
  DropdownMenuSeparator,
  formatNaira,
  Money,
  SplitButton,
} from '@grov/ui';

import {formatBps, formatCount, formatQty} from '../../../lib/catalogue/insight-format';
import {formatDay} from '../../../lib/format/dates';
import {productPath} from '../../../paths';
import {ActiveBadge} from '../category-badges';
import {ProductThumb} from '../product-thumb';
import {type CatalogueLayoutProps, ChangeText, STOCK_BADGE} from './products-cells';

interface MetricProps {
  label: string;
  value: string;
  sub?: ReactNode;
}

function Metric({label, value, sub}: MetricProps) {
  return (
    <div className="grid min-w-0 content-start gap-0.5">
      <span className="text-label text-ink-muted">{label}</span>
      <span className="truncate font-semibold tabular">{value}</span>
      {sub ? <span className="text-body-sm">{sub}</span> : null}
    </div>
  );
}

/** The price, stated plainly: one amount, or the full range across sizes. */
function PriceBlock({row}: {row: CatalogueRow}) {
  const {priceMin, priceMax} = row;
  if (!priceMin) {
    return (
      <div className="grid gap-0.5">
        <span className="text-label text-ink-muted">Price</span>
        <span className="font-semibold text-ink-muted">Not priced yet</span>
      </div>
    );
  }
  const range = priceMax && priceMax.kobo !== priceMin.kobo;
  return (
    <div className="grid gap-0.5">
      <span className="text-label text-ink-muted">
        {range ? `Price · ${row.sizes} sizes` : 'Price'}
      </span>
      <span className="text-title-md tabular">
        <Money kobo={priceMin.kobo} />
        {range ? (
          <>
            <span className="px-1 text-ink-muted">–</span>
            <Money kobo={priceMax.kobo} />
          </>
        ) : null}
      </span>
      <span className="text-body-sm text-ink-muted">
        {row.defaultSizeLabel ? `${row.defaultSizeLabel} · ` : ''}
        Margin {formatBps(row.marginBps)}
      </span>
    </div>
  );
}

/**
 * One card per product. Identity, status, price and every action are on the card;
 * the performance numbers fold out on demand.
 */
export function ProductsDetailedList({
  rows,
  coverFor,
  selected,
  onToggle,
  canManage,
  onPublish,
}: CatalogueLayoutProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggleOpen = (id: string) =>
    setOpen(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ul className="grid gap-3">
      {rows.map(row => {
        const isSelected = selected.has(row.id);
        const isOpen = open.has(row.id);
        const detailsId = `product-performance-${row.id}`;
        return (
          <li
            key={row.id}
            className={cn(
              'rounded-lg border border-line bg-surface transition-colors hover:border-line-strong',
              isSelected && 'border-flame bg-flame-tint/40 hover:border-flame'
            )}
          >
            <div className="flex flex-wrap items-start gap-x-6 gap-y-4 p-4 pl-3">
              {/* Who it is. */}
              <div className="flex min-w-0 flex-1 basis-72 items-start gap-3">
                <Checkbox
                  className="mt-1"
                  aria-label={`Select ${row.displayName}`}
                  checked={isSelected}
                  onCheckedChange={() => onToggle(row.id)}
                />
                <ProductThumb
                  url={coverFor(row.coverImagePath)}
                  name={row.displayName}
                  className="size-16 rounded-md"
                />
                <div className="grid min-w-0 gap-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Link
                      to={productPath(row.id)}
                      className="truncate text-title-sm text-ink underline-offset-4 hover:underline"
                    >
                      {row.displayName}
                    </Link>
                    <ActiveBadge active={row.active} draft={row.draft} />
                  </div>
                  <span className="flex items-center gap-1.5 text-body-sm font-semibold text-flame-strong">
                    <span aria-hidden className="size-2 rounded-full bg-flame" />
                    {row.categoryName}
                  </span>
                  <span className="truncate text-body-sm text-ink-muted">
                    SKU {row.sku}
                    {row.sizes > 1 ? ` · ${row.sizes} sizes` : ''}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-body-sm">
                    {row.stockState === 'IN_STOCK' ? (
                      <span>
                        {row.availableQty === null
                          ? 'In stock'
                          : `${formatQty(row.availableQty, row.baseUnit)} available`}
                      </span>
                    ) : (
                      <Badge tone={STOCK_BADGE[row.stockState].tone}>
                        {STOCK_BADGE[row.stockState].label}
                      </Badge>
                    )}
                    <span aria-hidden className="text-ink-muted">
                      ·
                    </span>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={detailsId}
                      onClick={() => toggleOpen(row.id)}
                      className="inline-flex items-center gap-1 rounded-sm font-semibold text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      {isOpen ? 'Hide performance' : 'Performance'}
                      <ChevronDown
                        aria-hidden
                        className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* What it costs. */}
              <div className="min-w-40">
                <PriceBlock row={row} />
              </div>

              {/* What to do. */}
              <div className="ml-auto grid justify-items-end gap-2">
                <span className="text-body-sm text-ink-muted">
                  Updated {formatDay(row.updatedAt)}
                </span>
                <SplitButton
                  asChild
                  menuLabel={`More actions for ${row.displayName}`}
                  menu={
                    <>
                      <DropdownMenuItem
                        onSelect={() => void navigate(productPath(row.id, 'analytics'))}
                      >
                        <BarChart3 aria-hidden /> Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => void navigate(productPath(row.id, 'pricing'))}
                      >
                        <Tag aria-hidden /> Pricing
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => void navigate(productPath(row.id, 'information'))}
                      >
                        <Pencil aria-hidden /> {canManage ? 'Edit product' : 'Product information'}
                      </DropdownMenuItem>
                      {canManage ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => onPublish(row, !row.active)}>
                            {row.active ? (
                              <>
                                <EyeOff aria-hidden /> Unpublish
                              </>
                            ) : (
                              <>
                                <Eye aria-hidden /> Publish
                              </>
                            )}
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </>
                  }
                >
                  <Link to={productPath(row.id)}>View product</Link>
                </SplitButton>
              </div>
            </div>

            {/* Performance, on demand. Inert while closed so focus skips it. */}
            <div
              id={detailsId}
              role="region"
              aria-label={`${row.displayName} performance`}
              inert={!isOpen}
              className={cn(
                'grid transition-[grid-template-rows] duration-200 ease-emphasized',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="grid grid-cols-2 gap-x-3 gap-y-4 border-t border-line p-4 @lg:grid-cols-3 @4xl:grid-cols-6">
                  <Metric
                    label="Sold"
                    value={formatQty(row.qtySold, row.baseUnit)}
                    sub={<span className="text-ink-muted">{formatCount(row.orders)} orders</span>}
                  />
                  <Metric label="Viewers" value={formatCount(row.viewers)} />
                  <Metric label="Conversion" value={formatBps(row.conversionBps)} />
                  <Metric
                    label="Revenue"
                    value={formatNaira(row.revenue.kobo)}
                    sub={<ChangeText bps={row.revenueChangeBps} />}
                  />
                  <Metric label="Margin" value={formatBps(row.marginBps)} />
                  <Metric
                    label="Available"
                    value={
                      row.availableQty === null ? '—' : formatQty(row.availableQty, row.baseUnit)
                    }
                  />
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
