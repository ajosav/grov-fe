import type {RestockStatus, StockOverviewRow} from '@grov/models';
import {Badge, cn, Tooltip} from '@grov/ui';

import {formatCover, LOW_STOCK_HINT, RESTOCK_STATUS} from '../../lib/stock/stock-format';

export function RestockBadge({status}: {status: RestockStatus}) {
  const {label, tone, hint} = RESTOCK_STATUS[status];
  return (
    <Tooltip content={hint}>
      <Badge tone={tone} tabIndex={0} className="cursor-help">
        {label}
      </Badge>
    </Tooltip>
  );
}

export function LowBadge() {
  return (
    <Tooltip content={LOW_STOCK_HINT}>
      <Badge tone="palm" tabIndex={0} className="cursor-help">
        Low
      </Badge>
    </Tooltip>
  );
}

type CoverRow = Pick<
  StockOverviewRow,
  'coverDays' | 'status' | 'leadTimeDays' | 'coverTargetDays' | 'availableQty'
>;

/**
 * Days of cover as a bar, with a tick where a delivery ordered today would land: a bar that
 * ends before the tick means stock runs out first. The days are always in text too.
 */
export function CoverMeter({row, className}: {row: CoverRow; className?: string}) {
  const horizon = Math.max(14, (row.leadTimeDays + row.coverTargetDays) * 2);
  const days = row.coverDays ?? (row.availableQty > 0 ? horizon : 0);
  const width = Math.min(100, Math.max(days > 0 ? 3 : 0, (days / horizon) * 100));
  const tick = Math.min(100, (row.leadTimeDays / horizon) * 100);
  return (
    <div className={cn('grid min-w-0 content-start gap-1', className)}>
      <span className="text-body-sm font-semibold tabular">
        {row.coverDays === null && row.availableQty > 0
          ? 'Not selling'
          : formatCover(row.coverDays)}
      </span>
      <div className="relative h-2 rounded-pill bg-surface-sunken" aria-hidden>
        <div
          className={cn('h-2 rounded-pill', RESTOCK_STATUS[row.status].bar)}
          style={{width: `${width}%`}}
        />
        <span
          className="absolute -top-0.5 h-3 w-0.5 rounded-pill bg-ink/50"
          style={{left: `${tick}%`}}
        />
      </div>
    </div>
  );
}
