import {useState} from 'react';

import {
  ArrowRight,
  BadgePercent,
  Banknote,
  Eye,
  PackageCheck,
  ReceiptText,
  TrendingUp,
} from 'lucide-react';

import {useProductPerformance} from '@grov/hooks';
import type {ProductPerformance} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  formatNaira,
  Funnel,
  Panel,
  Segmented,
  Skeleton,
  StatStrip,
  TrendChart,
  type TrendPoint,
} from '@grov/ui';

import {
  formatBps,
  formatCount,
  formatNairaCompact,
  formatQty,
  longDay,
  periodParams,
  shortDay,
} from '../../../lib/catalogue/insight-format';
import {ActivityFeed} from '../activity/activity-feed';
import {AiNotAvailablePanel} from '../ai/ai-not-available';
import {type ProductReportProps, ProductReportToolbar} from './product-report-toolbar';

export type ChartMetric = 'views' | 'sales' | 'revenue' | 'conversion' | 'stock';
type Tab = 'overview' | 'analytics' | 'inventory' | 'pricing' | 'information';

export interface ProductOverviewTabProps extends ProductReportProps {
  onTab: (tab: Tab) => void;
}

interface Series {
  points: TrendPoint[];
  label: string;
  format: (v: number) => string;
  axis?: (v: number) => string;
}

/** Daily points for the chosen metric; one unit per chart (one axis). */
export function seriesFor(data: ProductPerformance, metric: ChartMetric): Series {
  const unit = data.baseUnit;
  switch (metric) {
    case 'views':
      return {
        label: 'Viewers',
        points: data.series.map(p => ({x: p.day, value: p.viewers})),
        format: formatCount,
      };
    case 'sales':
      return {
        label: 'Sold',
        points: data.series.map(p => ({x: p.day, value: p.qty})),
        format: v => formatQty(v, unit),
      };
    case 'revenue':
      return {
        label: 'Revenue',
        points: data.series.map(p => ({x: p.day, value: p.revenue.kobo})),
        format: v => formatNaira(v),
        axis: formatNairaCompact,
      };
    case 'conversion':
      return {
        label: 'Orders per 100 viewers',
        points: data.series.map(p => ({
          x: p.day,
          value: p.viewers ? Math.round((p.orders / p.viewers) * 1000) / 10 : 0,
        })),
        format: v => v.toLocaleString('en-NG', {maximumFractionDigits: 1}),
      };
    case 'stock':
      return {
        label: 'Stock in',
        points: data.series.map(p => ({x: p.day, value: p.stockIn, previous: p.stockOut})),
        format: v => formatQty(v, unit),
      };
  }
}

export const METRIC_OPTIONS: {value: ChartMetric; label: string}[] = [
  {value: 'revenue', label: 'Revenue'},
  {value: 'sales', label: 'Sales'},
  {value: 'views', label: 'Views'},
  {value: 'conversion', label: 'Conversion'},
  {value: 'stock', label: 'Stock'},
];

/** The product at a glance: key numbers, the trend and funnel, and an insight rail and the activity feed. */
export function ProductOverviewTab({
  product,
  period,
  onPeriod,
  storeId,
  onStore,
  stores,
  onTab,
}: ProductOverviewTabProps) {
  const [metric, setMetric] = useState<ChartMetric>('revenue');
  const performance = useProductPerformance(product.id, {...periodParams(period), storeId});
  const data = performance.data;
  const k = data?.kpis;
  const series = data ? seriesFor(data, metric) : null;

  return (
    <div className="grid gap-4">
      <ProductReportToolbar
        title="Quick stats"
        description={
          data
            ? `${longDay(data.period.from)} – ${longDay(data.period.to)}, compared with the ${data.period.days} days before`
            : undefined
        }
        period={period}
        onPeriod={onPeriod}
        storeId={storeId}
        onStore={onStore}
        stores={stores}
      />
      {performance.isError ? (
        <Alert tone="danger" title="Couldn’t load performance">
          <div className="flex flex-wrap items-center gap-3">
            {errorMessage(performance.error)}
            <Button variant="outline" size="sm" onClick={() => void performance.refetch()}>
              Try again
            </Button>
          </div>
        </Alert>
      ) : (
        <StatStrip
          loading={!k}
          stats={[
            {
              key: 'revenue',
              label: 'Revenue',
              icon: <Banknote />,
              tone: 'flame',
              value: k ? formatNaira(k.revenue.value) : '—',
              changeBps: k?.revenue.changeBps,
              onSelect: () => setMetric('revenue'),
              selected: metric === 'revenue',
            },
            {
              key: 'profit',
              label: 'Gross profit',
              icon: <TrendingUp />,
              tone: 'leaf',
              value: k ? formatNaira(k.grossProfit.value) : '—',
              changeBps: k?.grossProfit.changeBps,
              hint: k ? `${formatBps(k.marginBps)} over base price` : undefined,
            },
            {
              key: 'sold',
              label: 'Units sold',
              icon: <PackageCheck />,
              tone: 'palm',
              value: formatQty(k?.qtySold.value, product.baseUnit),
              changeBps: k?.qtySold.changeBps,
              onSelect: () => setMetric('sales'),
              selected: metric === 'sales',
            },
            {
              key: 'orders',
              label: 'Orders',
              icon: <ReceiptText />,
              tone: 'sky',
              value: formatCount(k?.orders.value),
              changeBps: k?.orders.changeBps,
              hint: k ? `${formatCount(k.buyers.value)} shoppers` : undefined,
            },
            {
              key: 'views',
              label: 'Unique viewers',
              icon: <Eye />,
              tone: 'neutral',
              value: formatCount(k?.viewers.value),
              changeBps: k?.viewers.changeBps,
              onSelect: () => setMetric('views'),
              selected: metric === 'views',
            },
            {
              key: 'conversion',
              label: 'Conversion',
              icon: <BadgePercent />,
              tone: 'neutral',
              value: formatBps(k?.conversionBps),
              hint: 'Buyers ÷ viewers',
              onSelect: () => setMetric('conversion'),
              selected: metric === 'conversion',
            },
          ]}
        />
      )}

      <div className="grid gap-4">
        <Panel
          title={`${series?.label ?? 'Trend'} by day`}
          actions={
            <Segmented<ChartMetric>
              label="Chart metric"
              value={metric}
              onChange={setMetric}
              options={METRIC_OPTIONS}
              size="sm"
            />
          }
        >
          {!data || !series ? (
            <Skeleton className="h-60" />
          ) : (
            <TrendChart
              points={series.points}
              label={series.label}
              previousLabel={metric === 'stock' ? 'Stock out' : undefined}
              formatValue={series.format}
              formatAxis={series.axis}
              formatX={shortDay}
            />
          )}
        </Panel>

        <div className="grid gap-4 @3xl:grid-cols-2">
          <Panel
            title="Purchase funnel"
            description="Shoppers at each step. Baskets are today’s, not the period’s."
            actions={
              <Button variant="ghost" size="sm" onClick={() => onTab('analytics')}>
                Full analytics <ArrowRight aria-hidden />
              </Button>
            }
          >
            {!data ? (
              <Skeleton className="h-32" />
            ) : (
              <Funnel
                steps={[
                  {label: 'Viewed', value: data.funnel.viewers},
                  {label: 'In a basket', value: data.funnel.inBasketsNow, hint: 'now'},
                  {label: 'Checkout started', value: data.funnel.checkoutStarted},
                  {label: 'Purchased', value: data.funnel.purchased},
                ]}
              />
            )}
          </Panel>
          <AiNotAvailablePanel />
        </div>
        <ActivityFeed productId={product.id} />
      </div>
    </div>
  );
}
