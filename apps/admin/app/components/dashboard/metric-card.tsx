import type {ReactNode} from 'react';

import {ChangeBadge, cn, Skeleton} from '@grov/ui';

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  /** Change against the previous period, basis points. Hidden when null or zero. */
  changeBps?: number | null;
  /** Falling is good for this number. */
  invert?: boolean;
  /** A line under the number: what it counts, or how complete it is. */
  hint?: ReactNode;
  loading?: boolean;
  /** A chart or sparkline under the number. */
  children?: ReactNode;
  className?: string;
}

/** One number with its change, and optionally its trend. The dashboard's building block. */
export function MetricCard({
  label,
  value,
  changeBps,
  invert,
  hint,
  loading,
  children,
  className,
}: MetricCardProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        'grid min-w-0 content-start gap-3 rounded-lg border border-line bg-surface p-4',
        className
      )}
    >
      <h3 className="text-body-sm text-ink-muted">{label}</h3>
      {loading ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <p className="flex flex-wrap items-baseline gap-2">
          <span className="text-title-lg tabular">{value}</span>
          {changeBps ? <ChangeBadge bps={changeBps} invert={invert} /> : null}
        </p>
      )}
      {hint ? <p className="truncate text-body-sm text-ink-muted">{hint}</p> : null}
      {children}
    </section>
  );
}
