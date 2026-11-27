import {useEffect, useMemo, useState} from 'react';

import {ArrowLeftRight, Search} from 'lucide-react';
import {Link, useSearchParams} from 'react-router';

import {useDebounce, useStockMovements} from '@grov/hooks';
import {appConfig, PERMISSIONS, type StockMovementKind} from '@grov/models';
import {errorMessage, PageHeader} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  cn,
  EmptyState,
  Input,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import type {AdminRouteHandle} from '../../lib/access/route-access';
import {formatMovementQty, MOVEMENT_KIND} from '../../lib/stock/stock-format';
import {productPath} from '../../paths';
import type {Route} from './+types/movements';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Movements · ${appConfig.brandName} admin`}];

const RANGES = [
  {value: '7', label: '7 days'},
  {value: '30', label: '30 days'},
  {value: 'all', label: 'All time'},
] as const;
type Range = (typeof RANGES)[number]['value'];

const KINDS = Object.keys(MOVEMENT_KIND) as StockMovementKind[];
const ALL = 'all';

const time = new Intl.DateTimeFormat('en-NG', {dateStyle: 'medium', timeStyle: 'short'});

export default function StockMovements() {
  const [params, setParams] = useSearchParams();
  const kindParam = params.get('kind');
  const kind = KINDS.find(k => k === kindParam);
  const range: Range =
    params.get('range') === '7' ? '7' : params.get('range') === 'all' ? 'all' : '30';
  const urlQ = params.get('q') ?? '';

  const setParam = (key: string, value: string | undefined) =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      {replace: true}
    );

  const [text, setText] = useState(urlQ);
  const q = useDebounce(text.trim(), 300);
  useEffect(() => {
    if (q !== urlQ.trim()) setParam('q', q || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a settled search writes the URL
  }, [q]);

  // Computed once per range choice, so the request key stays stable between renders.
  const from = useMemo(
    () =>
      range === 'all' ? undefined : new Date(Date.now() - Number(range) * 86_400_000).toISOString(),
    [range]
  );
  const log = useStockMovements({
    ...(kind ? {kind} : {}),
    ...(urlQ ? {q: urlQ} : {}),
    ...(from ? {from} : {}),
    limit: 50,
  });
  const rows = log.data?.pages.flatMap(page => page.data) ?? [];

  return (
    <>
      <PageHeader
        title="Movements"
        description="Every change to stock at this store: receipts, sales, counts, write-offs and transfers."
      />
      <section
        aria-label="Stock movements"
        className="@container min-w-0 overflow-clip rounded-lg border border-line bg-surface"
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
          <div className="relative w-full sm:w-64">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            />
            <Input
              type="search"
              aria-label="Search movements"
              placeholder="Search product, SKU or reason"
              autoComplete="off"
              className="h-9 pl-9"
              value={text}
              onChange={event => setText(event.target.value)}
            />
          </div>
          <Select
            value={kind ?? ALL}
            onValueChange={value => setParam('kind', value === ALL ? undefined : value)}
          >
            <SelectTrigger aria-label="Movement type" className="h-9 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {KINDS.map(k => (
                <SelectItem key={k} value={k}>
                  {MOVEMENT_KIND[k].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Segmented<Range>
            size="sm"
            label="Period"
            value={range}
            onChange={value => setParam('range', value === '30' ? undefined : value)}
            options={[...RANGES]}
          />
        </div>

        {log.isPending ? (
          <div className="grid gap-2 p-4">
            {Array.from({length: 8}, (_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : log.isError ? (
          <Alert tone="danger" title="Couldn’t load movements" className="m-4">
            <div className="flex flex-wrap items-center gap-3">
              {errorMessage(log.error)}
              <Button variant="outline" size="sm" onClick={() => void log.refetch()}>
                Try again
              </Button>
            </div>
          </Alert>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<ArrowLeftRight />}
              title="No movements"
              description="Nothing matches. Try another type or a longer period."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="hidden @3xl:table-cell">Reason</TableHead>
                <TableHead className="hidden @4xl:table-cell">By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => {
                const info = MOVEMENT_KIND[row.kind];
                const value = Number(row.qty);
                return (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-body-sm text-ink-muted">
                      {time.format(new Date(row.createdAt))}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={productPath(row.productId, 'inventory')}
                        className="block truncate font-semibold underline-offset-4 hover:underline"
                      >
                        {row.productName}
                      </Link>
                      <div className="text-body-sm text-ink-muted">{row.sku}</div>
                    </TableCell>
                    <TableCell>
                      <Badge tone={info.tone} title={info.detail}>
                        {info.label}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-semibold tabular',
                        value < 0 && 'text-flame-strong'
                      )}
                    >
                      {formatMovementQty(row.qty, row.baseUnit)}
                    </TableCell>
                    <TableCell className="hidden max-w-64 truncate text-body-sm text-ink-muted @3xl:table-cell">
                      {row.reason ?? '—'}
                    </TableCell>
                    <TableCell className="hidden text-body-sm text-ink-muted @4xl:table-cell">
                      {row.actorName ?? 'System'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {log.hasNextPage ? (
          <div className="flex justify-center border-t border-line p-3">
            <Button
              variant="outline"
              size="sm"
              loading={log.isFetchingNextPage}
              onClick={() => void log.fetchNextPage()}
            >
              Load more
            </Button>
          </div>
        ) : null}
      </section>
    </>
  );
}
