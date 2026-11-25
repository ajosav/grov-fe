import {Link} from 'react-router';

import type {CatalogueAnalytics} from '@grov/models';
import {BarList, formatNaira} from '@grov/ui';

import {formatCount, formatQty} from '../../../lib/catalogue/insight-format';
import {productPath} from '../../../paths';

export interface RankedProductsProps {
  items: CatalogueAnalytics['topProducts'];
  empty: string;
  /** Bars show revenue lost against the previous period instead of revenue. */
  showDecline?: boolean;
}

/** Products ranked by revenue (or by revenue lost), each linking to its workspace. */
export function RankedProducts({items, empty, showDecline}: RankedProductsProps) {
  return (
    <BarList
      empty={empty}
      formatValue={v => formatNaira(v)}
      items={items.map(row => {
        const lost = row.previousRevenue.kobo - row.revenue.kobo;
        return {
          key: row.productId,
          label: (
            <Link
              to={productPath(row.productId, 'analytics')}
              className="underline-offset-4 hover:underline"
            >
              {row.displayName}
              <span className="text-ink-muted">
                {' '}
                · {formatQty(row.qty, row.baseUnit)}, {formatCount(row.orders)} orders
              </span>
            </Link>
          ),
          value: showDecline ? lost : row.revenue.kobo,
          detail: showDecline
            ? `${formatNaira(row.revenue.kobo)} (was ${formatNaira(row.previousRevenue.kobo)})`
            : formatNaira(row.revenue.kobo),
        };
      })}
    />
  );
}
