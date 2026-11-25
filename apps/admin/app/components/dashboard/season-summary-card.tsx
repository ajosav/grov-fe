import type {ReactNode} from 'react';

import {CalendarClock, CalendarMinus, CalendarPlus, Leaf} from 'lucide-react';

import {Skeleton} from '@grov/ui';
import {cn} from '@grov/ui';

import {greetingFor} from '../../lib/dashboard/greeting';
import {
  MONTH_LABELS,
  MONTH_NAMES,
  seasonSentence,
  type SeasonSummary,
} from '../../lib/dashboard/season';
import {DateTimeTile} from './date-time-tile';
import type {InsightSection} from './insights-sections';

export interface SeasonSummaryCardProps {
  firstName?: string;
  summary: SeasonSummary;
  /** Month 1–12 in Lagos. */
  month: number;
  loading: boolean;
  failed: boolean;
  onOpen: (section: InsightSection) => void;
}

const TILES: {
  section: InsightSection;
  label: string;
  icon: ReactNode;
  pick: (s: SeasonSummary) => number;
  well: string;
}[] = [
  {
    section: 'in-season',
    label: 'In season',
    icon: <Leaf />,
    pick: s => s.inSeason.length,
    well: 'bg-leaf-tint text-leaf-strong',
  },
  {
    section: 'leaving',
    label: 'Leaving soon',
    icon: <CalendarMinus />,
    pick: s => s.leaving.length,
    well: 'bg-palm-tint text-palm-strong',
  },
  {
    section: 'coming',
    label: 'Coming soon',
    icon: <CalendarPlus />,
    pick: s => s.coming.length,
    well: 'bg-sky-tint text-sky-strong',
  },
  {
    section: 'out',
    label: 'Out of season',
    icon: <CalendarClock />,
    pick: s => s.out.length,
    well: 'bg-surface-sunken text-ink-muted',
  },
];

/** The first thing an admin reads: what this month means for the foods they sell. */
export function SeasonSummaryCard({
  firstName,
  summary,
  month,
  loading,
  failed,
  onOpen,
}: SeasonSummaryCardProps) {
  const now = new Date();
  return (
    <section className="grid gap-5 rounded-lg border border-line bg-surface p-5">
      <header className="flex items-start gap-3">
        <DateTimeTile />
        <div className="grid gap-1">
          <h1 className="text-body-lg font-semibold">
            {greetingFor(now)}
            {firstName ? ` ${firstName}` : ''}, here’s what {MONTH_NAMES[month - 1]} means for your
            shelves.
          </h1>
          <p className="text-body-sm text-ink-muted" aria-live="polite">
            {failed
              ? 'Couldn’t load your foods’ seasons.'
              : loading
                ? 'Reading the season for every food…'
                : seasonSentence(summary)}
          </p>
        </div>
      </header>

      <ol
        aria-label={`Months of the year, now ${MONTH_NAMES[month - 1]}`}
        className="grid grid-cols-6 gap-1.5 sm:grid-cols-12"
      >
        {MONTH_LABELS.map((label, index) => (
          <li
            key={label}
            aria-current={index + 1 === month ? 'date' : undefined}
            className={cn(
              'rounded-sm py-1 text-center text-chip',
              index + 1 === month
                ? 'bg-flame-tint text-flame-strong ring-2 ring-flame/40'
                : 'bg-surface-sunken text-ink-muted'
            )}
          >
            {label}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {TILES.map(tile => (
          <button
            key={tile.section}
            type="button"
            onClick={() => onOpen(tile.section)}
            className="grid gap-2 rounded-lg border border-line bg-surface px-3 py-3 text-left transition-colors hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <span
              aria-hidden
              className={cn(
                'flex size-8 items-center justify-center rounded-md [&_svg]:size-4',
                tile.well
              )}
            >
              {tile.icon}
            </span>
            <span className="text-body-sm text-ink-muted">{tile.label}</span>
            {loading ? (
              <Skeleton className="h-7 w-10" />
            ) : (
              <span className="text-title-md tabular">{failed ? '—' : tile.pick(summary)}</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
