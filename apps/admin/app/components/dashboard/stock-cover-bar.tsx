import {Badge, type BadgeProps, cn} from '@grov/ui';

import {
  COVER_HORIZON_DAYS,
  type CoverStatus,
  formatDaysLeft,
  type StockCover,
} from '../../lib/dashboard/stock-timeline';

const STATUS: Record<CoverStatus, {label: string; tone: BadgeProps['tone']; bar: string}> = {
  OUT: {label: 'Out now', tone: 'flame', bar: 'bg-flame'},
  ORDER_NOW: {label: 'Order now', tone: 'flame', bar: 'bg-flame'},
  SOON: {label: 'Order soon', tone: 'palm', bar: 'bg-palm'},
  OK: {label: 'Covered', tone: 'leaf', bar: 'bg-leaf'},
};

export function CoverBadge({status}: {status: CoverStatus}) {
  const {label, tone} = STATUS[status];
  return <Badge tone={tone}>{label}</Badge>;
}

/** A bar for how many days of stock are left, full at two weeks. The days are always in text too. */
export function CoverBar({cover, className}: {cover: StockCover; className?: string}) {
  const width = Math.min(
    100,
    Math.max(cover.daysLeft > 0 ? 4 : 0, (cover.daysLeft / COVER_HORIZON_DAYS) * 100)
  );
  return (
    <div className={cn('grid gap-1', className)}>
      <div className="flex items-baseline justify-between gap-3 text-body-sm">
        <span className="min-w-0 truncate font-semibold">{cover.name}</span>
        <span className="shrink-0 text-ink-muted tabular">{formatDaysLeft(cover.daysLeft)}</span>
      </div>
      <div className="h-2 rounded-pill bg-surface-sunken" aria-hidden>
        <div
          className={cn('h-2 rounded-pill', STATUS[cover.status].bar)}
          style={{width: `${width}%`}}
        />
      </div>
    </div>
  );
}
