import type {ReactNode} from 'react';

import {
  CalendarClock,
  CalendarDays,
  CalendarMinus,
  CalendarPlus,
  Leaf,
  LineChart,
  PackageSearch,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {Link} from 'react-router';

import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  EmptyState,
} from '@grov/ui';

import type {SeasonSummary} from '../../lib/dashboard/season';
import type {StockCover} from '../../lib/dashboard/stock-timeline';
import {paths} from '../../paths';
import {INSIGHT_SECTIONS, type InsightSection} from './insights-sections';
import {SeasonCalendar} from './season-calendar';
import {StockTimelineTable} from './stock-timeline-table';
import {SuggestedActions} from './suggested-actions';
import type {DashboardScope} from './use-dashboard-scope';

interface SectionInfo {
  label: string;
  title: string;
  description: string;
  icon: ReactNode;
  group: 'Season' | 'Stock' | 'Market';
}

const SECTIONS: Record<InsightSection, SectionInfo> = {
  calendar: {
    label: 'Season calendar',
    title: 'Season calendar',
    description: 'Every food against the twelve months of the year.',
    icon: <CalendarDays />,
    group: 'Season',
  },
  'in-season': {
    label: 'In season',
    title: 'In season now',
    description: 'Foods in season with more than two months to go.',
    icon: <Leaf />,
    group: 'Season',
  },
  leaving: {
    label: 'Leaving soon',
    title: 'Leaving season',
    description: 'Foods whose season ends this month or next, soonest first.',
    icon: <CalendarMinus />,
    group: 'Season',
  },
  coming: {
    label: 'Coming soon',
    title: 'Coming into season',
    description: 'Foods whose season starts within two months, soonest first.',
    icon: <CalendarPlus />,
    group: 'Season',
  },
  out: {
    label: 'Out of season',
    title: 'Out of season',
    description: 'Foods more than two months from their season, nearest first.',
    icon: <CalendarClock />,
    group: 'Season',
  },
  stock: {
    label: 'Stock timeline',
    title: 'What to stock, and when',
    description: 'Products by how soon their stock runs out.',
    icon: <PackageSearch />,
    group: 'Stock',
  },
  suggestions: {
    label: 'Suggested actions',
    title: 'Suggested actions',
    description: 'What the rules suggest, with the numbers behind each.',
    icon: <Sparkles />,
    group: 'Stock',
  },
  market: {
    label: 'Prices and scarcity',
    title: 'Market prices and scarcity',
    description: 'Commodity price moves, supply risks and buying opportunities.',
    icon: <LineChart />,
    group: 'Market',
  },
};

const GROUPS = ['Season', 'Stock', 'Market'] as const;

const PLANNED_MARKET = [
  'Biggest wholesale price moves, with the markets and evidence behind them',
  'Scarcity risks: supply shortfalls, logistics and policy, kept apart',
  'Buy-and-store opportunities, checked against storage cost and shelf life',
  'Harvest, arrival and cultural calendars by state and market',
  'Data freshness for every source, so you know how current each number is',
];

export interface InsightsModalProps {
  section: InsightSection | null;
  onSectionChange: (section: InsightSection) => void;
  onClose: () => void;
  scope: DashboardScope;
  summary: SeasonSummary;
  month: number;
  covers: StockCover[];
  periodDays: number | undefined;
  /** Which groups this admin can see. */
  canSeason: boolean;
  canCatalogue: boolean;
}

/** The large view behind every card's "View all": a section list on the left and the full detail on the right. */
export function InsightsModal({
  section,
  onSectionChange,
  onClose,
  scope,
  summary,
  month,
  covers,
  periodDays,
  canSeason,
  canCatalogue,
}: InsightsModalProps) {
  const allowed = (key: InsightSection) =>
    SECTIONS[key].group === 'Season' ? canSeason : canCatalogue;
  const info = section ? SECTIONS[section] : null;

  const seasonal = [...summary.inSeason, ...summary.leaving, ...summary.coming, ...summary.out];
  const content = (): ReactNode => {
    switch (section) {
      case 'calendar':
        return (
          <SeasonCalendar
            foods={[...seasonal, ...summary.yearRound, ...summary.unset]}
            month={month}
            empty="No foods yet."
          />
        );
      case 'in-season':
        return (
          <SeasonCalendar
            foods={summary.inSeason}
            month={month}
            empty="Nothing is in season with more than two months to go."
          />
        );
      case 'leaving':
        return (
          <SeasonCalendar
            foods={summary.leaving}
            month={month}
            empty="No season ends within two months."
          />
        );
      case 'coming':
        return (
          <SeasonCalendar
            foods={summary.coming}
            month={month}
            empty="No season starts within two months."
          />
        );
      case 'out':
        return (
          <SeasonCalendar
            foods={summary.out}
            month={month}
            empty="Every seasonal food is in season or about to be."
          />
        );
      case 'stock':
        return <StockTimelineTable covers={covers} periodDays={periodDays} />;
      case 'suggestions':
        return <SuggestedActions scope={scope} />;
      case 'market':
        return (
          <EmptyState
            icon={<TrendingUp />}
            title="Market data isn’t connected yet"
            description="Prices, supply and arrivals need data sources that haven’t been connected. Nothing here is estimated until they are."
            action={
              <ul className="mx-auto grid max-w-xl list-disc gap-1.5 pl-5 text-left text-body-sm text-ink-muted">
                {PLANNED_MARKET.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={section !== null} onOpenChange={open => (open ? undefined : onClose())}>
      <DialogContent className="h-[min(46rem,92dvh)] max-w-6xl grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 md:grid-cols-[15rem_minmax(0,1fr)] md:grid-rows-1">
        <nav
          aria-label="Sections"
          className="flex gap-1 overflow-x-auto border-b border-line bg-surface-sunken/50 p-3 md:grid md:content-start md:gap-4 md:overflow-y-auto md:border-b-0 md:border-r md:p-4"
        >
          {GROUPS.map(group => {
            const keys = INSIGHT_SECTIONS.filter(
              key => SECTIONS[key].group === group && allowed(key)
            );
            if (keys.length === 0) return null;
            return (
              <div key={group} className="flex gap-1 md:grid md:gap-1">
                <p className="hidden px-2 pb-1 text-label text-ink-muted md:block">{group}</p>
                {keys.map(key => (
                  <button
                    key={key}
                    type="button"
                    aria-current={section === key ? 'page' : undefined}
                    onClick={() => onSectionChange(key)}
                    className={cn(
                      'flex shrink-0 items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-body-sm transition-colors hover:bg-surface-sunken [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-muted',
                      section === key && 'bg-surface-sunken font-semibold'
                    )}
                  >
                    {SECTIONS[key].icon}
                    <span className="whitespace-nowrap">{SECTIONS[key].label}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="min-h-0 overflow-y-auto p-6 md:p-8">
          <header className="mb-6 flex flex-wrap items-start justify-between gap-3 pr-10">
            <div className="grid gap-1">
              <DialogTitle>{info?.title ?? 'Insights'}</DialogTitle>
              <DialogDescription>{info?.description ?? ''}</DialogDescription>
            </div>
            {section && SECTIONS[section].group === 'Season' ? (
              <Button asChild variant="outline" size="sm">
                <Link to={paths.foods}>Open foods</Link>
              </Button>
            ) : null}
          </header>
          {content()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
