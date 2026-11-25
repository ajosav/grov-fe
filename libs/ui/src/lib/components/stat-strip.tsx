import type {ReactNode} from 'react';

import {ArrowDownRight, ArrowUpRight} from 'lucide-react';

import {cn} from '../utils/cn';
import {Skeleton} from './skeleton';

/** Basis points as a signed percentage: 1250 → "+12%". */
function formatChange(bps: number): string {
  const pct = Math.round(bps / 100);
  if (pct === 0) return '0%';
  return `${pct > 0 ? '+' : '−'}${Math.abs(pct).toLocaleString('en-NG')}%`;
}

export type StatTone = 'flame' | 'sky' | 'palm' | 'leaf' | 'neutral';

const CHIP: Record<StatTone, string> = {
  flame: 'bg-flame-tint text-flame-strong',
  sky: 'bg-sky-tint text-sky-strong',
  palm: 'bg-palm-tint text-palm-strong',
  leaf: 'bg-leaf-tint text-leaf-strong',
  neutral: 'bg-surface-sunken text-ink-muted',
};

export interface Stat {
  key: string;
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: StatTone;
  /** Change against the previous period, basis points. */
  changeBps?: number | null;
  /** Falling is good for this number. */
  invert?: boolean;
  hint?: ReactNode;
  /** Makes the stat a filter or chart switch. */
  onSelect?: () => void;
  selected?: boolean;
}

export interface StatStripProps {
  stats: Stat[];
  loading?: boolean;
  className?: string;
}

interface ChangeProps {
  bps: number;
  invert?: boolean;
}

function Change({bps, invert}: ChangeProps) {
  const up = bps > 0;
  const worse = invert ? up : !up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-pill px-1.5 py-0.5 text-chip tabular',
        worse ? 'bg-flame-tint text-flame-strong' : 'bg-surface-sunken text-ink'
      )}
    >
      <Icon aria-hidden className="size-3" />
      {formatChange(bps)}
      <span className="sr-only">
        {worse ? ' worse than the previous period' : ' better than the previous period'}
      </span>
    </span>
  );
}

/**
 * Key numbers in one surface, split by dividers (one strip, not a card per number). A stat
 * with `onSelect` is a toggle: it filters the list or switches the chart below.
 */
export function StatStrip({stats, loading, className}: StatStripProps) {
  return (
    <div className={cn('@container', className)}>
      <div
        className={cn(
          'grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-surface @xl:grid-cols-3',
          stats.length > 4 ? '@4xl:grid-cols-6' : '@3xl:grid-cols-4'
        )}
      >
        {stats.map(stat => {
          const body = (
            <>
              <span className="flex items-center gap-2 text-body-sm text-ink-muted">
                {stat.icon ? (
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-sm [&_svg]:size-4',
                      CHIP[stat.tone ?? 'neutral']
                    )}
                    aria-hidden
                  >
                    {stat.icon}
                  </span>
                ) : null}
                <span className="truncate">{stat.label}</span>
              </span>
              {loading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <span className="flex flex-wrap items-baseline gap-2">
                  <span className="text-title-md tabular">{stat.value}</span>
                  {stat.changeBps ? <Change bps={stat.changeBps} invert={stat.invert} /> : null}
                </span>
              )}
              {stat.hint ? (
                <span className="truncate text-body-sm text-ink-muted">{stat.hint}</span>
              ) : null}
            </>
          );
          const classes = cn(
            'relative grid min-w-0 content-start gap-1.5 border-b border-r border-line p-4 text-left',
            stat.onSelect && 'transition-colors hover:bg-surface-sunken',
            stat.selected &&
              'bg-flame-tint/40 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-flame'
          );
          return stat.onSelect ? (
            <button
              key={stat.key}
              type="button"
              className={classes}
              aria-pressed={stat.selected}
              onClick={stat.onSelect}
            >
              {body}
            </button>
          ) : (
            <div key={stat.key} className={classes}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
