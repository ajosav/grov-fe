import {RefreshCw} from 'lucide-react';

import {useMyStores, useOrderStats, useProductAnalyticsRefresh} from '@grov/hooks';
import {errorMessage} from '@grov/shared';
import {Alert, Button, formatNaira, PeriodPicker, Segmented} from '@grov/ui';

import {formatCount, longDay} from '../../lib/catalogue/insight-format';
import {StoreFilter} from '../common/store-filter';
import {MetricCard} from './metric-card';
import {MealPlanNotice} from './order-filter-notice';
import {OrderPatternCard} from './order-pattern-card';
import type {DashboardScope} from './use-dashboard-scope';
import {itemTypeParam, type OrderTypeFilter, useOrderFilters} from './use-order-filters';

const TYPE_OPTIONS: readonly {value: OrderTypeFilter; label: string}[] = [
  {value: 'ALL', label: 'All orders'},
  {value: 'FOOD_PACKAGE', label: 'Food packages'},
  {value: 'FOOD_PRODUCT', label: 'Food products'},
  {value: 'MEAL_PLAN', label: 'Meal plans'},
];

export interface OrdersOverviewProps {
  scope: DashboardScope;
}

/**
 * Orders over a date range, by what was bought, then when people order. The period and location
 * are the dashboard's, so Analytics above and Revenue below always cover the same days.
 */
export function OrdersOverview({scope}: OrdersOverviewProps) {
  const stores = useMyStores();
  const filters = useOrderFilters();
  const {refresh, refreshing} = useProductAnalyticsRefresh();
  const mealPlan = filters.type === 'MEAL_PLAN';
  const stats = useOrderStats(
    {
      ...scope.range,
      storeId: scope.storeId,
      itemType: itemTypeParam(filters.type),
    },
    {enabled: !mealPlan}
  );
  const data = mealPlan ? undefined : stats.data;
  const typeRow = (type: 'FOOD_PACKAGE' | 'FOOD_PRODUCT') =>
    data?.byItemType.find(row => row.type === type);

  return (
    <section aria-labelledby="dashboard-orders-title" className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-0.5">
          <h2 id="dashboard-orders-title" className="text-title-sm">
            Orders
          </h2>
          {data ? (
            <p className="text-body-sm text-ink-muted">
              {longDay(data.period.from)} – {longDay(data.period.to)} against{' '}
              {longDay(data.period.previousFrom)} – {longDay(data.period.previousTo)}, by order
              date. Paid orders only.
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

      <Segmented
        label="Orders of"
        options={TYPE_OPTIONS}
        value={filters.type}
        onChange={filters.setType}
        size="sm"
        className="justify-self-start"
      />

      {mealPlan ? (
        <MealPlanNotice what="orders" />
      ) : stats.isError ? (
        <Alert tone="danger" title="Couldn’t load orders">
          <div className="flex flex-wrap items-center gap-3">
            {errorMessage(stats.error)}
            <Button variant="outline" size="sm" onClick={() => void stats.refetch()}>
              Try again
            </Button>
          </div>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Orders"
              loading={!data}
              value={formatCount(data?.orders.value)}
              changeBps={data?.orders.changeBps}
            />
            <MetricCard
              label="Average order"
              loading={!data}
              value={data ? formatNaira(data.averageOrder.value) : '—'}
              changeBps={data?.averageOrder.changeBps}
              hint={data ? 'Food, delivery fees excluded' : undefined}
            />
            <MetricCard
              label="Food packages"
              loading={!data}
              value={formatCount(typeRow('FOOD_PACKAGE')?.orders)}
              hint={data ? formatNaira(typeRow('FOOD_PACKAGE')?.revenue.kobo ?? 0) : undefined}
            />
            <MetricCard
              label="Food products"
              loading={!data}
              value={formatCount(typeRow('FOOD_PRODUCT')?.orders)}
              hint={data ? formatNaira(typeRow('FOOD_PRODUCT')?.revenue.kobo ?? 0) : undefined}
            />
          </div>
          <OrderPatternCard pattern={data?.pattern} />
        </>
      )}
    </section>
  );
}
