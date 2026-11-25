import {useState} from 'react';

import {
  BadgePercent,
  Banknote,
  CircleSlash,
  Eye,
  FilePen,
  Layers,
  PackageCheck,
  PackageMinus,
  ReceiptText,
  TrendingUp,
  Users,
} from 'lucide-react';
import {Link, useNavigate, useSearchParams} from 'react-router';

import {useCatalogueAnalytics, useCatalogueSummary, useMyStores} from '@grov/hooks';
import {appConfig, PERMISSIONS} from '@grov/models';
import {errorMessage, PageHeader} from '@grov/shared';
import {
  Alert,
  BarList,
  Button,
  formatNaira,
  Panel,
  PeriodPicker,
  Segmented,
  Skeleton,
  StatStrip,
  TrendChart,
} from '@grov/ui';

import {ActivityFeed} from '../../components/catalogue/activity/activity-feed';
import {RankedProducts} from '../../components/catalogue/analytics/ranked-products';
import {ProductsSectionNav} from '../../components/catalogue/products/products-section-nav';
import {StoreFilter} from '../../components/common/store-filter';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {
  formatBps,
  formatChange,
  formatCount,
  formatNairaCompact,
  longDay,
  periodParams,
  readPeriod,
  shortDay,
  writePeriod,
} from '../../lib/catalogue/insight-format';
import {paths} from '../../paths';
import type {Route} from './+types/analytics';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Product analytics · ${appConfig.brandName} admin`},
];

type Trend = 'revenue' | 'orders' | 'viewers';

function change(revenue: number, previous: number) {
  return previous ? Math.round(((revenue - previous) / previous) * 10_000) : null;
}

/** Catalogue-wide sales, profit and engagement, against the previous period of the same length. */
export default function ProductAnalytics() {
  const [params, setParams] = useSearchParams();
  const period = readPeriod(params);
  const storeId = params.get('storeId') ?? undefined;
  const [trend, setTrend] = useState<Trend>('revenue');
  const [ranking, setRanking] = useState<'top' | 'decline'>('top');
  const [breakdown, setBreakdown] = useState<'category' | 'store'>('category');
  const stores = useMyStores();
  const analytics = useCatalogueAnalytics({...periodParams(period), storeId});
  const data = analytics.data;
  const summary = useCatalogueSummary({storeId}).data;
  const navigate = useNavigate();
  /** A count opens the product list already filtered to what it counts. */
  const openProducts = (query: string) =>
    void navigate({pathname: paths.products, search: query ? `?${query}` : ''});

  const set = (patch: (next: URLSearchParams) => void) =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        patch(next);
        return next;
      },
      {replace: true}
    );

  const points =
    data?.series.map(p => ({
      x: p.day,
      value: trend === 'revenue' ? p.revenue.kobo : trend === 'orders' ? p.orders : p.viewers,
    })) ?? [];

  return (
    <>
      <PageHeader
        title="Product analytics"
        description="Sales, profit and shopper engagement across the catalogue."
        actions={
          <>
            <StoreFilter
              value={storeId}
              stores={stores.data?.stores}
              onChange={id => set(p => (id ? p.set('storeId', id) : p.delete('storeId')))}
            />
            <PeriodPicker value={period} onChange={value => set(p => writePeriod(p, value))} />
          </>
        }
      />
      <ProductsSectionNav />

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
        <div className="grid gap-4">
          {data ? (
            <p className="text-body-sm text-ink-muted">
              {longDay(data.period.from)} – {longDay(data.period.to)} against{' '}
              {longDay(data.period.previousFrom)} – {longDay(data.period.previousTo)}, by order
              date.
              {storeId ? ' Viewer counts cover every store.' : ''}
            </p>
          ) : null}
          <StatStrip
            loading={!data || !summary}
            stats={[
              {
                key: 'revenue',
                label: 'Revenue',
                icon: <Banknote />,
                tone: 'flame',
                value: data ? formatNaira(data.revenue.value) : '—',
                changeBps: data?.revenue.changeBps,
                onSelect: () => setTrend('revenue'),
                selected: trend === 'revenue',
              },
              {
                key: 'profit',
                label: 'Gross profit',
                icon: <TrendingUp />,
                tone: 'leaf',
                value: data ? formatNaira(data.grossProfit.value) : '—',
                changeBps: data?.grossProfit.changeBps,
                hint:
                  data?.costCoverageBps !== null &&
                  data?.costCoverageBps !== undefined &&
                  data.costCoverageBps < 10_000
                    ? `${formatBps(data.costCoverageBps, 0)} of revenue costed`
                    : 'Over base price',
              },
              {
                key: 'orders',
                label: 'Orders',
                icon: <ReceiptText />,
                tone: 'sky',
                value: formatCount(data?.orders.value),
                changeBps: data?.orders.changeBps,
                onSelect: () => setTrend('orders'),
                selected: trend === 'orders',
              },
              {
                key: 'buyers',
                label: 'Buyers',
                icon: <Users />,
                value: formatCount(data?.buyers.value),
                changeBps: data?.buyers.changeBps,
              },
              {
                key: 'viewers',
                label: 'Viewers',
                icon: <Eye />,
                value: formatCount(data?.viewers.value),
                changeBps: data?.viewers.changeBps,
                onSelect: () => setTrend('viewers'),
                selected: trend === 'viewers',
              },
              {
                key: 'conversion',
                label: 'Conversion',
                icon: <BadgePercent />,
                tone: 'palm',
                value: formatBps(data?.conversionBps),
                hint: data ? `${formatCount(data.productsSold)} products sold` : undefined,
              },
              {
                key: 'total',
                label: 'Total products',
                icon: <Layers />,
                tone: 'sky',
                value: formatCount(summary?.total),
                onSelect: () => openProducts(''),
              },
              {
                key: 'published',
                label: 'Published',
                icon: <PackageCheck />,
                tone: 'leaf',
                value: formatCount(summary?.published),
                hint: summary ? `${formatCount(summary.inactive)} unpublished` : undefined,
                onSelect: () => openProducts('status=published'),
              },
              {
                key: 'drafts',
                label: 'Drafts',
                icon: <FilePen />,
                value: formatCount(summary?.drafts),
                onSelect: () => openProducts('status=draft'),
              },
              {
                key: 'low',
                label: 'Low stock',
                icon: <PackageMinus />,
                tone: 'palm',
                value: formatCount(summary?.lowStock),
                onSelect: () => openProducts('view=low_stock'),
              },
              {
                key: 'out',
                label: 'Out of stock',
                icon: <CircleSlash />,
                tone: 'flame',
                value: formatCount(summary?.outOfStock),
                onSelect: () => openProducts('view=out_of_stock'),
              },
            ]}
          />

          <Panel
            title={`${trend === 'revenue' ? 'Revenue' : trend === 'orders' ? 'Orders' : 'Viewers'} by day`}
            actions={
              <Segmented<Trend>
                label="Trend"
                value={trend}
                onChange={setTrend}
                options={[
                  {value: 'revenue', label: 'Revenue'},
                  {value: 'orders', label: 'Orders'},
                  {value: 'viewers', label: 'Viewers'},
                ]}
                size="sm"
              />
            }
          >
            {!data ? (
              <Skeleton className="h-60" />
            ) : (
              <TrendChart
                points={points}
                label={trend === 'revenue' ? 'Revenue' : trend === 'orders' ? 'Orders' : 'Viewers'}
                formatValue={trend === 'revenue' ? v => formatNaira(v) : formatCount}
                formatAxis={trend === 'revenue' ? formatNairaCompact : undefined}
                formatX={shortDay}
              />
            )}
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel
              title={ranking === 'top' ? 'Top products by revenue' : 'Biggest declines'}
              actions={
                <Segmented<'top' | 'decline'>
                  label="Ranking"
                  value={ranking}
                  onChange={setRanking}
                  options={[
                    {value: 'top', label: 'Top'},
                    {value: 'decline', label: 'Declining'},
                  ]}
                  size="sm"
                />
              }
            >
              {!data ? (
                <Skeleton className="h-40" />
              ) : ranking === 'top' ? (
                <RankedProducts items={data.topProducts} empty="No sales in this period." />
              ) : (
                <RankedProducts
                  items={data.decliners}
                  empty="Nothing sold less than before."
                  showDecline
                />
              )}
            </Panel>
            <Panel
              title={breakdown === 'category' ? 'Revenue by category' : 'Revenue by location'}
              actions={
                <Segmented<'category' | 'store'>
                  label="Breakdown"
                  value={breakdown}
                  onChange={setBreakdown}
                  options={[
                    {value: 'category', label: 'Category'},
                    {value: 'store', label: 'Location'},
                  ]}
                  size="sm"
                />
              }
            >
              {!data ? (
                <Skeleton className="h-40" />
              ) : (
                <BarList
                  formatValue={v => formatNaira(v)}
                  items={(breakdown === 'category' ? data.byCategory : data.byStore).map(row => ({
                    key: row.id,
                    label: `${row.name} · ${breakdown === 'category' ? `${formatCount(row.products)} products` : `${formatCount(row.orders)} orders`}`,
                    value: row.revenue.kobo,
                    detail: `${formatNaira(row.revenue.kobo)} ${formatChange(change(row.revenue.kobo, row.previousRevenue.kobo)) ?? ''}`,
                  }))}
                />
              )}
            </Panel>
          </div>
          <ActivityFeed />
          <p className="text-body-sm text-ink-muted">
            Open a product from the{' '}
            <Link to={paths.products} className="underline underline-offset-4">
              catalogue
            </Link>{' '}
            for its funnel, stock and pricing.
          </p>
        </div>
      )}
    </>
  );
}
