import {Link} from 'react-router';

import {Badge, Checkbox, cn, formatNaira} from '@grov/ui';

import {formatBps, formatQty} from '../../../lib/catalogue/insight-format';
import {productPath} from '../../../paths';
import {ActiveBadge} from '../category-badges';
import {ProductThumb} from '../product-thumb';
import {ProductRowActions} from './product-row-actions';
import {type CatalogueLayoutProps, priceText, STOCK_BADGE} from './products-cells';

/** Product cards: the photo leads, for browsing the range. */
export function ProductsLensGrid({
  rows,
  coverFor,
  selected,
  onToggle,
  ...actions
}: CatalogueLayoutProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
      {rows.map(row => {
        const cover = coverFor(row.coverImagePath);
        return (
          <li
            key={row.id}
            className={cn(
              'flex flex-col overflow-hidden rounded-lg border border-line bg-surface',
              selected.has(row.id) && 'border-flame'
            )}
          >
            <div className="relative aspect-[4/3] bg-surface-sunken">
              {cover ? (
                <img src={cover} alt="" loading="lazy" className="size-full object-cover" />
              ) : (
                <ProductThumb
                  url={undefined}
                  name={row.displayName}
                  className="size-full rounded-none"
                />
              )}
              <div className="absolute left-2 top-2 rounded-sm bg-surface p-1">
                <Checkbox
                  aria-label={`Select ${row.displayName}`}
                  checked={selected.has(row.id)}
                  onCheckedChange={() => onToggle(row.id)}
                />
              </div>
              <div className="absolute right-2 top-2 flex gap-1">
                <Badge tone={STOCK_BADGE[row.stockState].tone}>
                  {STOCK_BADGE[row.stockState].label}
                </Badge>
              </div>
            </div>
            <div className="grid flex-1 gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    to={productPath(row.id)}
                    className="line-clamp-2 font-semibold underline-offset-4 hover:underline"
                  >
                    {row.displayName}
                  </Link>
                  <p className="truncate text-body-sm text-ink-muted">
                    {row.categoryName} · {row.sku}
                  </p>
                </div>
                <ProductRowActions row={row} {...actions} />
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-title-sm tabular">{priceText(row)}</span>
                <ActiveBadge active={row.active} draft={row.draft} />
              </div>
              <dl className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-body-sm">
                <div>
                  <dt className="text-ink-muted">Revenue</dt>
                  <dd className="font-semibold tabular">{formatNaira(row.revenue.kobo)}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Sold</dt>
                  <dd className="font-semibold tabular">{formatQty(row.qtySold, row.baseUnit)}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Conversion</dt>
                  <dd className="font-semibold tabular">{formatBps(row.conversionBps)}</dd>
                </div>
              </dl>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
