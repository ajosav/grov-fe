import {CircleCheck, PackagePlus, Sparkles, TrendingDown} from 'lucide-react';
import {Link} from 'react-router';

import {useCatalogue, useCatalogueAnalytics} from '@grov/hooks';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Skeleton,
} from '@grov/ui';

import {buildSuggestions, type SuggestionKind} from '../../lib/dashboard/suggestions';
import {InsightCard} from './insight-card';
import type {DashboardScope} from './use-dashboard-scope';

const KIND: Record<
  SuggestionKind,
  {label: string; tone: 'palm' | 'sky'; icon: typeof PackagePlus}
> = {
  RESTOCK: {label: 'Restock', tone: 'palm', icon: PackagePlus},
  REVIEW_SALES: {label: 'Review', tone: 'sky', icon: TrendingDown},
};

export interface SuggestedActionsProps {
  scope: DashboardScope;
  /** How many to show. The large view shows all of them. */
  limit?: number;
  /** Shown as a card with "View all"; leave out to render the bare list (inside the large view). */
  onViewAll?: () => void;
}

/**
 * What to do next, each with the numbers that led to it. Rules-based today; the assistant will
 * explain them and add its own once AI is on (doc 38). Nothing is applied from here.
 */
export function SuggestedActions({scope, limit, onViewAll}: SuggestedActionsProps) {
  const base = {
    ...scope.range,
    storeId: scope.storeId,
    sort: 'sold',
    dir: 'desc',
    pageSize: 3,
  } as const;
  const out = useCatalogue({...base, view: 'out_of_stock'});
  const low = useCatalogue({...base, view: 'low_stock'});
  const analytics = useCatalogueAnalytics({...scope.range, storeId: scope.storeId});
  const loading = out.isPending || low.isPending || analytics.isPending;
  const all = buildSuggestions({
    outOfStock: out.data?.items ?? [],
    lowStock: low.data?.items ?? [],
    decliners: analytics.data?.decliners ?? [],
  });
  const suggestions = limit ? all.slice(0, limit) : all;

  const list = loading ? (
    <div className="grid gap-3">
      <Skeleton className="h-14" />
      <Skeleton className="h-14" />
    </div>
  ) : suggestions.length === 0 ? (
    <p className="flex items-center gap-3 text-body-sm text-ink-muted">
      <CircleCheck aria-hidden className="size-5 text-leaf-strong" />
      No suggestions right now. Stock and sales look steady.
    </p>
  ) : (
    <ul className="divide-y divide-line">
      {suggestions.map(suggestion => {
        const {label, tone, icon: Icon} = KIND[suggestion.kind];
        return (
          <li key={suggestion.key} className="grid gap-1 py-3 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={tone}>
                <Icon aria-hidden /> {label}
              </Badge>
              <p className="min-w-0 flex-1 text-body-sm font-semibold">{suggestion.title}</p>
              <Button asChild variant="outline" size="sm">
                <Link to={suggestion.to}>Review</Link>
              </Button>
            </div>
            <p className="text-body-sm text-ink-muted">{suggestion.rationale}</p>
            <Accordion type="single" collapsible>
              <AccordionItem value="why" className="border-b-0">
                <AccordionTrigger className="min-h-9 justify-start gap-2 py-1 text-body-sm">
                  Why this suggestion
                </AccordionTrigger>
                <AccordionContent>
                  <dl className="grid gap-x-10 gap-y-1 text-body-sm sm:grid-cols-2">
                    {suggestion.evidence.map(item => (
                      <div key={item.label} className="flex justify-between gap-3">
                        <dt className="text-ink-muted">{item.label}</dt>
                        <dd className="font-semibold tabular">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        );
      })}
    </ul>
  );

  if (!onViewAll) {
    return (
      <div className="grid gap-4">
        <p className="text-body-sm text-ink-muted">
          From your stock and sales for the period on the dashboard. Rules-based; AI explanations
          arrive once AI is on. Nothing changes until you open a suggestion and decide.
        </p>
        {list}
      </div>
    );
  }
  return (
    <InsightCard
      title={
        <span className="flex items-center gap-2">
          <Sparkles aria-hidden className="size-4 text-flame" /> Suggested actions
        </span>
      }
      tag="Rules-based"
      onViewAll={all.length > (limit ?? all.length) ? onViewAll : undefined}
    >
      {list}
    </InsightCard>
  );
}
