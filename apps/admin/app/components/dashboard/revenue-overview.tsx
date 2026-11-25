import {useOrderStats} from '@grov/hooks';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  BarList,
  Button,
  formatNaira,
  Panel,
  Segmented,
  Skeleton,
  TrendChart,
} from '@grov/ui';

import {
  formatBps,
  formatCount,
  formatNairaCompact,
  shortDay,
} from '../../lib/catalogue/insight-format';
import {MetricCard} from './metric-card';
import {MealPlanNotice} from './order-filter-notice';
import type {DashboardScope} from './use-dashboard-scope';
import {type RevenueSourceFilter, sourceParam, useOrderFilters} from './use-order-filters';

const SOURCE_OPTIONS: readonly {value: RevenueSourceFilter; label: string}[] = [
  {value: 'ALL', label: 'All revenue'},
  {value: 'SAVINGS', label: 'Savings'},
  {value: 'PURCHASE', label: 'Direct purchase'},
  {value: 'MEAL_PLAN', label: 'Meal plans'},
];

const SOURCE_NAME = {SAVINGS: 'Paid from savings', PURCHASE: 'Paid directly'} as const;
const TYPE_NAME = {FOOD_PACKAGE: 'Food packages', FOOD_PRODUCT: 'Food products'} as const;
const CHART_HEIGHT = 200;

export interface RevenueOverviewProps {
  scope: DashboardScope;
}

/**
 * Food revenue for the same days and location as Orders, filtered by how it was paid. A line's
 * payment is split pro rata by how its order was paid, since one order can use savings and a card.
 */
export function RevenueOverview({scope}: RevenueOverviewProps) {
  const filters = useOrderFilters();
  const mealPlan = filters.source === 'MEAL_PLAN';
  const stats = useOrderStats(
    {
      ...scope.range,
      storeId: scope.storeId,
      source: sourceParam(filters.source),
    },
    {enabled: !mealPlan}
  );
  const data = mealPlan ? undefined : stats.data;
  const total = data?.bySource.reduce((sum, row) => sum + row.revenue.kobo, 0) ?? 0;
  const savings = data?.bySource.find(row => row.source === 'SAVINGS');
  const series = data?.series.map(point => ({x: point.day, value: point.revenue.kobo})) ?? [];

  return (
    <section aria-labelledby="dashboard-revenue-title" className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-0.5">
          <h2 id="dashboard-revenue-title" className="text-title-sm">
            Revenue
          </h2>
          <p className="text-body-sm text-ink-muted">
            Food sold in the period above, without delivery fees.
          </p>
        </div>
        <Segmented
          label="Revenue paid by"
          options={SOURCE_OPTIONS}
          value={filters.source}
          onChange={filters.setSource}
          size="sm"
        />
      </div>

      {mealPlan ? (
        <MealPlanNotice what="revenue" />
      ) : stats.isError ? (
        <Alert tone="danger" title="Couldn’t load revenue">
          <div className="flex flex-wrap items-center gap-3">
            {errorMessage(stats.error)}
            <Button variant="outline" size="sm" onClick={() => void stats.refetch()}>
              Try again
            </Button>
          </div>
        </Alert>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <MetricCard
            label="Revenue"
            className="lg:col-span-2"
            loading={!data}
            value={data ? formatNaira(data.revenue.value) : '—'}
            changeBps={data?.revenue.changeBps}
            hint={
              data
                ? `${formatCount(data.orders.value)} orders${
                    filters.source === 'ALL' ? '' : ', the part paid this way'
                  }`
                : undefined
            }
          >
            {!data ? (
              <Skeleton style={{height: CHART_HEIGHT}} />
            ) : series.every(point => point.value === 0) ? (
              <p className="text-body-sm text-ink-muted">No revenue in this period.</p>
            ) : (
              <TrendChart
                points={series}
                label="Revenue"
                height={CHART_HEIGHT}
                formatValue={v => formatNaira(v)}
                formatAxis={formatNairaCompact}
                formatX={shortDay}
              />
            )}
          </MetricCard>
          <div className="grid content-start gap-4">
            <Panel title="How it was paid">
              {!data ? (
                <Skeleton className="h-24" />
              ) : (
                <div className="grid gap-3">
                  <BarList
                    items={data.bySource.map(row => ({
                      key: row.source,
                      label: SOURCE_NAME[row.source],
                      value: row.revenue.kobo,
                      detail: formatNaira(row.revenue.kobo),
                    }))}
                    formatValue={v => formatNaira(v)}
                    empty="No revenue in this period."
                  />
                  {total > 0 && savings ? (
                    <p className="text-body-sm text-ink-muted">
                      {formatBps(Math.round((savings.revenue.kobo / total) * 10_000), 0)} paid from
                      savings.
                    </p>
                  ) : null}
                </div>
              )}
            </Panel>
            <Panel title="By what was bought">
              {!data ? (
                <Skeleton className="h-24" />
              ) : (
                <BarList
                  items={data.byItemType.map(row => ({
                    key: row.type,
                    label: TYPE_NAME[row.type],
                    value: row.revenue.kobo,
                    detail: formatNaira(row.revenue.kobo),
                  }))}
                  formatValue={v => formatNaira(v)}
                  empty="No revenue in this period."
                />
              )}
            </Panel>
          </div>
        </div>
      )}
    </section>
  );
}
