import {CircleCheck} from 'lucide-react';
import {Link} from 'react-router';

import {errorMessage} from '@grov/shared';
import {Button, Skeleton} from '@grov/ui';

import type {StockCover} from '../../lib/dashboard/stock-timeline';
import {productPath} from '../../paths';
import {InsightCard} from './insight-card';
import {CoverBadge, CoverBar} from './stock-cover-bar';

const ROWS = 5;

export interface StockTimelineCardProps {
  covers: StockCover[];
  periodDays: number | undefined;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  onViewAll: () => void;
}

/** What to stock, and by when: products by how soon their stock runs out. */
export function StockTimelineCard({
  covers,
  periodDays,
  loading,
  error,
  onRetry,
  onViewAll,
}: StockTimelineCardProps) {
  const urgent = covers.filter(c => c.status === 'OUT' || c.status === 'ORDER_NOW').length;
  return (
    <InsightCard title="What to stock, and when" onViewAll={onViewAll} viewAllLabel="View timeline">
      {loading ? (
        <div className="grid gap-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : error ? (
        <div className="flex flex-wrap items-center gap-3 text-body-sm text-ink-muted">
          {errorMessage(error)}
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : covers.length === 0 ? (
        <p className="flex items-center gap-2 text-body-sm text-ink-muted">
          <CircleCheck aria-hidden className="size-4" /> Nothing to time yet. Products show here
          once stores count them and they sell.
        </p>
      ) : (
        <>
          <p className="text-body-sm text-ink-muted">
            {urgent
              ? `${urgent} ${urgent === 1 ? 'product needs' : 'products need'} ordering now.`
              : 'Nothing needs ordering right now.'}
          </p>
          <ul className="grid gap-4">
            {covers.slice(0, ROWS).map(cover => (
              <li key={cover.id} className="flex items-center gap-4">
                <Link
                  to={productPath(cover.id, 'inventory')}
                  className="min-w-0 flex-1 underline-offset-4 hover:underline"
                >
                  <CoverBar cover={cover} />
                </Link>
                <span className="hidden w-24 shrink-0 justify-end sm:flex">
                  <CoverBadge status={cover.status} />
                </span>
              </li>
            ))}
          </ul>
          <p className="text-chip font-normal text-ink-muted">
            Days left = stock available ÷ average daily sales
            {periodDays ? ` over the last ${periodDays} days` : ''}. Order lead time isn’t set yet,
            so leave extra.
          </p>
        </>
      )}
    </InsightCard>
  );
}
