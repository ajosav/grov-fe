import {useId, useState} from 'react';

import {ArrowDownRight, ArrowUpRight, ChevronDown} from 'lucide-react';

import type {AuditBreakdownRow, AuditMetric} from '@grov/models';
import {Badge, BarList, cn, Skeleton, Sparkline} from '@grov/ui';

import {formatChange, formatCount} from '../../lib/audit/format';

export interface AuditStatCardProps {
  title: string;
  metric: AuditMetric | undefined;
  /** One value per time bucket, for the trend under the number. */
  trend: number[];
  /** The biggest contributors, shown when the card is opened. */
  breakdown: AuditBreakdownRow[];
  breakdownTitle: string;
  loading?: boolean;
}

/** A number with its change on the period before, a trend, and a fold-out of what drives it. */
export function AuditStatCard({
  title,
  metric,
  trend,
  breakdown,
  breakdownTitle,
  loading,
}: AuditStatCardProps) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const change = metric?.changeBps;

  return (
    <section
      aria-label={title}
      className="overflow-hidden rounded-lg border border-line bg-surface shadow-glass"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? bodyId : undefined}
        onClick={() => setOpen(value => !value)}
        className="flex w-full items-center justify-between gap-2 px-4 pt-4 text-left text-body-sm font-semibold outline-none focus-visible:outline-2 focus-visible:outline-focus"
      >
        {title}
        <ChevronDown
          aria-hidden
          className={cn('size-5 text-ink-muted transition-transform', open && 'rotate-180')}
        />
      </button>
      <div className="px-4 pt-1 pb-2">
        {loading || !metric ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-title-lg tabular">{formatCount(metric.value)}</span>
            {change === null || change === undefined ? null : (
              <Badge>
                {change >= 0 ? <ArrowUpRight aria-hidden /> : <ArrowDownRight aria-hidden />}
                <span className="sr-only">{change >= 0 ? 'Up' : 'Down'} </span>
                {formatChange(change)}
                <span className="sr-only"> on the period before</span>
              </Badge>
            )}
          </div>
        )}
      </div>
      <Sparkline values={trend} />
      {open ? (
        <div id={bodyId} className="border-t border-line px-4 py-3">
          <p className="mb-2 text-label text-ink-muted">{breakdownTitle}</p>
          <BarList
            items={breakdown.map(row => ({key: row.key, label: row.label, value: row.count}))}
            formatValue={formatCount}
            empty="Nothing in this period."
          />
        </div>
      ) : null}
    </section>
  );
}
