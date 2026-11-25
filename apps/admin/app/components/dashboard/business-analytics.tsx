import {RefreshCw} from 'lucide-react';
import {Link} from 'react-router';

import {useCatalogueAnalytics, useMyStores, useProductAnalyticsRefresh} from '@grov/hooks';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  formatNaira,
  Panel,
  PeriodPicker,
  Skeleton,
  Sparkline,
  TrendChart,
} from '@grov/ui';

import {
  formatBps,
  formatCount,
  formatNairaCompact,
  longDay,
  shortDay,
} from '../../lib/catalogue/insight-format';
import {paths} from '../../paths';
import {RankedProducts} from '../catalogue/analytics/ranked-products';
import {StoreFilter} from '../common/store-filter';
import {MetricCard} from './metric-card';
import type {DashboardScope} from './use-dashboard-scope';

export interface BusinessAnalyticsProps {
  scope: DashboardScope;
}

const CHART_HEIGHT = 200;

/**
 * How the business is doing: sales, orders and shoppers against the previous period of the same
 * length, and which products carry or lose it. The same numbers as product analytics, in brief.
 */
export function BusinessAnalytics({scope}: BusinessAnalyticsProps) {
  const stores = useMyStores();
  const analytics = useCatalogueAnalytics({...scope.range, storeId: scope.storeId});
  const {refresh, refreshing} = useProductAnalyticsRefresh();
  const data = analytics.data;

  const revenue = data?.series.map(p => ({x: p.day, value: p.revenue.kobo})) ?? [];
  const orders = data?.series.map(p => ({x: p.day, value: p.orders})) ?? [];
  const viewers = data?.series.map(p => p.viewers) ?? [];
  const costed =
    data?.costCoverageBps !== null &&
    data?.costCoverageBps !== undefined &&
    data.costCoverageBps < 10_000
      ? `${formatBps(data.costCoverageBps, 0)} of revenue costed`
      : 'Over base price';

  return (
    <section aria-labelledby="dashboard-analytics-title" className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-0.5">
          <h2 id="dashboard-analytics-title" className="text-title-sm">
            Analytics
          </h2>
          {data ? (
            <p className="text-body-sm text-ink-muted">
              {longDay(data.period.from)} – {longDay(data.period.to)} against{' '}
              {longDay(data.period.previousFrom)} – {longDay(data.period.previousTo)}, by order
              date.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StoreFilter
            value={scope.storeId}
            stores={stores.data?.stores}
            onChange={scope.setStoreId}
          />
          <PeriodPicker value={scope.period} onChange={scope.setPeriod} />
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Refresh the numbers"
            disabled={refreshing}
            onClick={() => void refresh()}
          >
            <RefreshCw
              aria-hidden
              className={refreshing ? 'animate-spin motion-reduce:animate-none' : undefined}
            />
          </Button>
        </div>
      </div>

      {analytics.isError ? (
        <Alert tone="danger" title="Couldn’t load analytics">
          <div className="flex flex-wrap items-center gap-3">
            {errorMessage(analytics.error)}
            <Button variant="outline" size="sm" onClick={() => void analytics.refetch()}>
              Try again
            </Button>
          </div>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <MetricCard
              label="Revenue"
              loading={!data}
              value={data ? formatNaira(data.revenue.value) : '—'}
              changeBps={data?.revenue.changeBps}
            >
              {!data ? (
                <Skeleton style={{height: CHART_HEIGHT}} />
              ) : revenue.every(p => p.value === 0) ? (
                <p className="text-body-sm text-ink-muted">No sales in this period.</p>
              ) : (
                <TrendChart
                  points={revenue}
                  label="Revenue"
                  height={CHART_HEIGHT}
                  formatValue={v => formatNaira(v)}
                  formatAxis={formatNairaCompact}
                  formatX={shortDay}
                />
              )}
            </MetricCard>
            <MetricCard
              label="Orders"
              loading={!data}
              value={formatCount(data?.orders.value)}
              changeBps={data?.orders.changeBps}
            >
              {!data ? (
                <Skeleton style={{height: CHART_HEIGHT}} />
              ) : orders.every(p => p.value === 0) ? (
                <p className="text-body-sm text-ink-muted">No orders in this period.</p>
              ) : (
                <TrendChart
                  points={orders}
                  label="Orders"
                  height={CHART_HEIGHT}
                  formatValue={formatCount}
                  formatX={shortDay}
                />
              )}
            </MetricCard>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Gross profit"
              loading={!data}
              value={data ? formatNaira(data.grossProfit.value) : '—'}
              changeBps={data?.grossProfit.changeBps}
              hint={data ? costed : undefined}
            />
            <MetricCard
              label="Buyers"
              loading={!data}
              value={formatCount(data?.buyers.value)}
              changeBps={data?.buyers.changeBps}
              hint={data ? 'Shoppers who ordered' : undefined}
            />
            <MetricCard
              label="Viewers"
              loading={!data}
              value={formatCount(data?.viewers.value)}
              changeBps={data?.viewers.changeBps}
            >
              <Sparkline values={viewers} />
            </MetricCard>
            <MetricCard
              label="Conversion"
              loading={!data}
              value={formatBps(data?.conversionBps)}
              hint={data ? `${formatCount(data.productsSold)} products sold` : undefined}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel
              title="Best sellers"
              actions={
                <Button asChild variant="ghost" size="sm">
                  <Link to={`${paths.products}?view=best_performing`}>See all</Link>
                </Button>
              }
            >
              {!data ? (
                <Skeleton className="h-40" />
              ) : (
                <RankedProducts
                  items={data.topProducts.slice(0, 5)}
                  empty="No sales in this period."
                />
              )}
            </Panel>
            <Panel
              title="Selling less than before"
              actions={
                <Button asChild variant="ghost" size="sm">
                  <Link to={`${paths.products}?view=declining`}>See all</Link>
                </Button>
              }
            >
              {!data ? (
                <Skeleton className="h-40" />
              ) : (
                <RankedProducts
                  items={data.decliners.slice(0, 5)}
                  empty="Nothing sold less than before."
                  showDecline
                />
              )}
            </Panel>
          </div>
        </>
      )}
    </section>
  );
}
