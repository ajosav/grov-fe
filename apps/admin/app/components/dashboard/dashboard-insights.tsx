import {useSearchParams} from 'react-router';

import {PERMISSIONS} from '@grov/models';
import {usePermissions} from '@grov/shared';

import {ComingSoonCard} from './coming-soon-card';
import {InsightsModal} from './insights-modal';
import {type InsightSection, readInsightSection} from './insights-sections';
import {SeasonListCard} from './season-list-card';
import {SeasonSummaryCard} from './season-summary-card';
import {StockTimelineCard} from './stock-timeline-card';
import {SuggestedActions} from './suggested-actions';
import type {DashboardScope} from './use-dashboard-scope';
import {useSeasonalFoods} from './use-seasonal-foods';
import {useStockTimeline} from './use-stock-timeline';

export interface DashboardInsightsProps {
  scope: DashboardScope;
  firstName?: string;
}

/**
 * The top of the home page: what the season means, what to stock and when, what is coming into
 * and going out of season, and what the rules suggest. "View all" on any card opens the large view
 * (`?insight=<section>`, so a section can be shared). Market intelligence joins as data arrives.
 */
export function DashboardInsights({scope, firstName}: DashboardInsightsProps) {
  const {can} = usePermissions();
  const canSeason = can(PERMISSIONS.FOODS.READ);
  const canCatalogue = can(PERMISSIONS.PRODUCTS.READ);
  const [params, setParams] = useSearchParams();
  const section = readInsightSection(params.get('insight'));
  const open = (next: InsightSection | null) =>
    setParams(
      previous => {
        const copy = new URLSearchParams(previous);
        if (next) copy.set('insight', next);
        else copy.delete('insight');
        return copy;
      },
      {replace: true, preventScrollReset: true}
    );

  const season = useSeasonalFoods(canSeason);
  const stock = useStockTimeline(scope, canCatalogue);

  return (
    <div className="grid gap-4">
      {canSeason ? (
        <SeasonSummaryCard
          firstName={firstName}
          summary={season.summary}
          month={season.month}
          loading={season.loading}
          failed={Boolean(season.error)}
          onOpen={open}
        />
      ) : null}
      {canCatalogue ? (
        <StockTimelineCard
          covers={stock.covers}
          periodDays={stock.periodDays}
          loading={stock.loading}
          error={stock.error}
          onRetry={() => void stock.refetch()}
          onViewAll={() => open('stock')}
        />
      ) : null}
      {canSeason ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SeasonListCard
            title="In season now"
            kind="in-season"
            foods={[...season.summary.inSeason]}
            loading={season.loading}
            empty="Nothing is in season with more than two months to go."
            onViewAll={() => open('in-season')}
          />
          <SeasonListCard
            title="Going out of season"
            kind="leaving"
            foods={season.summary.leaving}
            loading={season.loading}
            empty="No season ends within two months."
            onViewAll={() => open('leaving')}
          />
        </div>
      ) : null}
      {canSeason || canCatalogue ? (
        <div className="grid gap-4 md:grid-cols-2">
          {canSeason ? (
            <SeasonListCard
              title="Coming into season"
              kind="coming"
              foods={season.summary.coming}
              loading={season.loading}
              empty="No season starts within two months."
              onViewAll={() => open('coming')}
            />
          ) : null}
          {canCatalogue ? (
            <SuggestedActions scope={scope} limit={3} onViewAll={() => open('suggestions')} />
          ) : null}
        </div>
      ) : null}
      {canCatalogue ? (
        <div className="grid gap-4 md:grid-cols-2">
          <ComingSoonCard
            title="Market prices"
            description="Wholesale price moves for the foods you sell, with the evidence behind each."
            planned={['Price moves', 'Unusual prices', 'Price vs market']}
            onViewAll={() => open('market')}
          />
          <ComingSoonCard
            title="Scarcity and opportunities"
            description="Where supply is tight, and what is worth buying ahead of the season."
            planned={['Scarcity risks', 'Buy and store', 'Harvest calendar']}
            onViewAll={() => open('market')}
          />
        </div>
      ) : null}

      <InsightsModal
        section={section}
        onSectionChange={open}
        onClose={() => open(null)}
        scope={scope}
        summary={season.summary}
        month={season.month}
        covers={stock.covers}
        periodDays={stock.periodDays}
        canSeason={canSeason}
        canCatalogue={canCatalogue}
      />
    </div>
  );
}
