import {useState} from 'react';

import {Eye, MousePointerClick, ScanEye, ShoppingBasket, View} from 'lucide-react';

import {useProductPerformance} from '@grov/hooks';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TrendChart,
} from '@grov/ui';

import {
  formatBps,
  formatChange,
  formatCount,
  formatQty,
  longDay,
  periodParams,
  shortDay,
} from '../../../lib/catalogue/insight-format';
import {type ChartMetric, METRIC_OPTIONS, seriesFor} from './product-overview-tab';
import {type ProductReportProps, ProductReportToolbar} from './product-report-toolbar';

const NOT_TRACKED = 'Not tracked';

/**
 * Engagement, funnel, money and history for one product. Untracked events are shown as
 * untracked, never estimated.
 */
export function ProductAnalyticsTab({
  product,
  period,
  onPeriod,
  storeId,
  onStore,
  stores,
}: ProductReportProps) {
  const [trend, setTrend] = useState<ChartMetric>('sales');
  const performance = useProductPerformance(product.id, {...periodParams(period), storeId});
  const data = performance.data;

  if (performance.isError) {
    return (
      <Alert tone="danger" title="Couldn’t load analytics">
        <div className="flex flex-wrap items-center gap-3">
          {errorMessage(performance.error)}
          <Button variant="outline" size="sm" onClick={() => void performance.refetch()}>
            Try again
          </Button>
        </div>
      </Alert>
    );
  }

  const k = data?.kpis;
  const f = data?.financial;
  const series = data ? seriesFor(data, trend) : null;

  return (
    <div className="grid gap-4">
      <ProductReportToolbar
        title="Customer engagement"
        description={
          data
            ? `${longDay(data.period.from)} – ${longDay(data.period.to)} against ${longDay(data.period.previousFrom)} – ${longDay(data.period.previousTo)}`
            : undefined
        }
        period={period}
        onPeriod={onPeriod}
        storeId={storeId}
        onStore={onStore}
        stores={stores}
      />
      {storeId && data && !data.tracking.viewersByStore ? (
        <Alert tone="info" title="Views are not split by store">
          Sales and money are for the chosen store; viewers are for every store, because the shop
          records views per shopper.
        </Alert>
      ) : null}
      <StatStrip
        loading={!data}
        stats={[
          {
            key: 'impressions',
            label: 'Impressions',
            icon: <ScanEye />,
            value: NOT_TRACKED,
            hint: 'Listing impressions aren’t recorded',
          },
          {
            key: 'views',
            label: 'Product views',
            icon: <View />,
            value: NOT_TRACKED,
            hint: 'Only each shopper’s latest view is kept',
          },
          {
            key: 'viewers',
            label: 'Unique viewers',
            icon: <Eye />,
            tone: 'sky',
            value: formatCount(k?.viewers.value),
            changeBps: k?.viewers.changeBps,
          },
          {
            key: 'ctr',
            label: 'Click-through rate',
            icon: <MousePointerClick />,
            value: NOT_TRACKED,
            hint: 'Needs impressions',
          },
          {
            key: 'baskets',
            label: 'In baskets now',
            icon: <ShoppingBasket />,
            tone: 'palm',
            value: formatCount(data?.funnel.inBasketsNow),
            hint: 'Add-to-cart events aren’t recorded',
          },
        ]}
      />

      <div className="grid gap-4 @3xl:grid-cols-2">
        <Panel
          title="Purchase funnel"
          description="Shoppers at each step. Baskets are today’s, not the period’s."
        >
          {!data ? (
            <Skeleton className="h-40" />
          ) : (
            <Funnel
              steps={[
                {label: 'Viewed', value: data.funnel.viewers},
                {label: 'In a basket', value: data.funnel.inBasketsNow, hint: 'now'},
                {
                  label: 'Checkout started',
                  value: data.funnel.checkoutStarted,
                  hint: 'paid or not',
                },
                {label: 'Purchased', value: data.funnel.purchased},
              ]}
            />
          )}
        </Panel>
        <Panel
          title="Financial performance"
          description="Gross profit is revenue less the base price at the time of sale."
          flush
        >
          {!data || !f || !k ? (
            <Skeleton className="m-4 h-40" />
          ) : (
            <dl className="divide-y divide-line text-body-sm">
              {[
                ['Revenue', formatNaira(f.revenue.kobo), formatChange(k.revenue.changeBps)],
                [
                  'Gross profit',
                  formatNaira(f.grossProfit.kobo),
                  formatChange(k.grossProfit.changeBps),
                ],
                [
                  'Gross margin',
                  formatBps(f.marginBps),
                  k.costCoverageBps !== null && k.costCoverageBps < 10_000
                    ? `${formatBps(k.costCoverageBps, 0)} of revenue costed`
                    : null,
                ],
                [
                  'Average selling price',
                  f.averageSellingPrice ? formatNaira(f.averageSellingPrice.kobo) : '—',
                  'per order line',
                ],
                [
                  'Cancelled',
                  `${formatCount(f.cancelledOrders)} orders · ${formatNaira(f.cancelledRevenue.kobo)}`,
                  null,
                ],
                ['Unpaid', `${formatCount(f.unpaidOrders)} orders`, 'checkout started, not paid'],
                [
                  'Discounts',
                  f.discounts ? formatNaira(f.discounts.kobo) : 'Not recorded per line',
                  null,
                ],
                [
                  'Refunds',
                  f.refunds ? formatNaira(f.refunds.kobo) : 'Not recorded per product',
                  null,
                ],
              ].map(([label, value, note]) => (
                <div key={label} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="text-right">
                    <span className="font-semibold tabular">{value}</span>
                    {note ? <span className="ml-2 text-ink-muted">{note}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Panel>
      </div>

      <Panel
        title="Historical trend"
        description={
          k
            ? `Against the previous period: sold ${formatChange(k.qtySold.changeBps) ?? 'n/a'}, revenue ${formatChange(k.revenue.changeBps) ?? 'n/a'}, conversion ${formatBps(k.conversionBps)} (was ${formatBps(k.previousConversionBps)}).`
            : undefined
        }
        actions={
          <Segmented<ChartMetric>
            label="Trend"
            value={trend}
            onChange={setTrend}
            options={METRIC_OPTIONS.slice(0, 4)}
            size="sm"
          />
        }
      >
        {!series ? (
          <Skeleton className="h-60" />
        ) : (
          <TrendChart
            points={series.points}
            label={series.label}
            formatValue={series.format}
            formatAxis={series.axis}
            formatX={shortDay}
          />
        )}
      </Panel>

      <Panel
        title="By location"
        description="Stores you can see that list, stock or sold it."
        flush
      >
        {!data ? (
          <Skeleton className="m-4 h-32" />
        ) : data.byStore.length === 0 ? (
          <p className="p-4 text-body-sm text-ink-muted">No store lists, stocks or sold it yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead>Listed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byStore.map(row => (
                <TableRow key={row.storeId}>
                  <TableCell className="font-semibold">{row.storeName}</TableCell>
                  <TableCell className="text-right tabular">
                    {formatNaira(row.revenue.kobo)}
                  </TableCell>
                  <TableCell className="text-right tabular text-ink-muted">
                    {formatChange(
                      row.previousRevenue.kobo
                        ? Math.round(
                            ((row.revenue.kobo - row.previousRevenue.kobo) /
                              row.previousRevenue.kobo) *
                              10_000
                          )
                        : null
                    ) ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular">
                    {formatQty(row.qty, product.baseUnit)}
                  </TableCell>
                  <TableCell className="text-right tabular">{formatCount(row.orders)}</TableCell>
                  <TableCell className="text-right tabular">
                    {row.availableQty === null
                      ? 'Not counted'
                      : formatQty(row.availableQty, product.baseUnit)}
                  </TableCell>
                  <TableCell>{row.listed ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </div>
  );
}
