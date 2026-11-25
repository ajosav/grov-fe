import {useMemo, useState} from 'react';

import {Download, RefreshCw} from 'lucide-react';
import {useSearchParams} from 'react-router';

import {
  AUDIT_EXPORT_CAP,
  useAuditFacets,
  useAuditLogs,
  useAuditStats,
  useDebounce,
  useExportAuditLogs,
} from '@grov/hooks';
import {appConfig, PERMISSIONS} from '@grov/models';
import {errorMessage, PageHeader} from '@grov/shared';
import {Alert, Button, ColumnChart, Panel, PeriodPicker, Skeleton, toast} from '@grov/ui';

import {AuditDetailDialog} from '../../components/audit/audit-detail-dialog';
import {AuditFilterBar} from '../../components/audit/audit-filter-bar';
import {AuditStatCard} from '../../components/audit/audit-stat-card';
import {AuditTable} from '../../components/audit/audit-table';
import {AuditToolbar} from '../../components/audit/audit-toolbar';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {exportFileName, exportRows} from '../../lib/audit/export';
import {
  type AuditFilter,
  formatFilter,
  personOf,
  readFilters,
  withPerson,
  writeFilters,
} from '../../lib/audit/filters';
import {bucketLabel, bucketTitle, formatCount} from '../../lib/audit/format';
import {auditRange, readAuditPeriod, writeAuditPeriod} from '../../lib/audit/range';
import {downloadText, toCsv} from '../../lib/catalogue/csv';
import type {Route} from './+types/audit-logs';

export const handle = {
  requires: {allOf: [PERMISSIONS.AUDIT.LOGS_READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Audit logs · ${appConfig.brandName} admin`},
];

const PAGE_SIZE = 25;

export default function AuditLogs() {
  const [params, setParams] = useSearchParams();
  const period = readAuditPeriod(params);
  const filters = readFilters(params);
  const [typed, setTyped] = useState(params.get('q') ?? '');
  const q = useDebounce(typed.trim(), 300);
  // Presets end "now". Fixing that moment keeps the queries steady between renders;
  // Refresh moves it.
  const [anchor, setAnchor] = useState(() => new Date());
  const [openId, setOpenId] = useState<string | null>(null);

  const range = useMemo(
    () => auditRange(period, anchor),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `period` is rebuilt each render from these
    [period.preset, period.from, period.to, anchor]
  );
  const filterParams = filters.map(formatFilter);
  const query = {...range, ...(q ? {q} : {}), filters: filterParams};

  const stats = useAuditStats(query);
  const logs = useAuditLogs({...query, limit: PAGE_SIZE});
  const facets = useAuditFacets(range);
  const exporter = useExportAuditLogs();

  const update = (apply: (next: URLSearchParams) => void) =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        apply(next);
        return next;
      },
      {replace: true}
    );

  const rows = logs.data?.pages.flatMap(page => page.data) ?? [];
  const bucket = stats.data?.range.bucket ?? 'DAY';
  const series = stats.data?.series ?? [];
  const refreshing = stats.isFetching || logs.isFetching;

  return (
    <>
      <PageHeader
        title="Audit logs"
        description="See the history of changes made within the admin console."
      />

      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <AuditToolbar
          search={typed}
          onSearch={text => {
            setTyped(text);
            update(search => {
              if (text.trim()) search.set('q', text.trim());
              else search.delete('q');
            });
          }}
          person={personOf(filters)}
          onPerson={value => update(search => writeFilters(search, withPerson(filters, value)))}
          facets={facets.data}
        />
        <div className="flex items-center gap-2">
          <PeriodPicker
            value={period}
            onChange={value => update(search => writeAuditPeriod(search, value))}
          />
          <Button
            variant="outline"
            size="sm"
            loading={exporter.isPending}
            onClick={() =>
              exporter.mutate(query, {
                onSuccess: ({rows, truncated}) => {
                  downloadText(toCsv(exportRows(rows)), exportFileName());
                  if (truncated) {
                    toast.info(
                      `Exported the latest ${AUDIT_EXPORT_CAP.toLocaleString()} entries. Narrow the period or filters to export the rest.`
                    );
                  } else {
                    toast.success(`Exported ${rows.length.toLocaleString()} entries`);
                  }
                },
                onError: error => toast.error(errorMessage(error)),
              })
            }
          >
            <Download aria-hidden /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 px-0"
            aria-label="Refresh"
            disabled={refreshing}
            onClick={() => setAnchor(new Date())}
          >
            <RefreshCw aria-hidden className={refreshing ? 'animate-spin' : undefined} />
          </Button>
        </div>
      </div>
      <div className="mb-5">
        <AuditFilterBar
          filters={filters}
          facets={facets.data}
          onChange={(next: AuditFilter[]) => update(search => writeFilters(search, next))}
        />
      </div>

      {stats.isError ? (
        <Alert tone="danger" title="Couldn’t load the summary" className="mb-5">
          {errorMessage(stats.error)}
        </Alert>
      ) : (
        <div className="mb-5 grid gap-5">
          <Panel
            title="Actions over time"
            actions={
              stats.data ? (
                <span className="text-body-sm text-ink-muted tabular">
                  {formatCount(stats.data.actions.value)} in this period
                </span>
              ) : null
            }
          >
            {stats.isPending ? (
              <Skeleton className="h-56" />
            ) : (
              <ColumnChart
                label="Actions"
                points={series.map(point => ({x: point.at, value: point.actions}))}
                formatX={x => bucketLabel(bucket, x)}
                formatTitle={x => bucketTitle(bucket, x)}
              />
            )}
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AuditStatCard
              title="Total actions"
              loading={stats.isPending}
              metric={stats.data?.actions}
              trend={series.map(p => p.actions)}
              breakdown={stats.data?.breakdowns.actions ?? []}
              breakdownTitle="Most frequent actions"
            />
            <AuditStatCard
              title="Unique actors"
              loading={stats.isPending}
              metric={stats.data?.actors}
              trend={series.map(p => p.actors)}
              breakdown={stats.data?.breakdowns.actors ?? []}
              breakdownTitle="Most active people"
            />
            <AuditStatCard
              title="Records changed"
              loading={stats.isPending}
              metric={stats.data?.entities}
              trend={series.map(p => p.entities)}
              breakdown={stats.data?.breakdowns.entities ?? []}
              breakdownTitle="Most changed record types"
            />
            <AuditStatCard
              title="Areas touched"
              loading={stats.isPending}
              metric={stats.data?.modules}
              trend={series.map(p => p.modules)}
              breakdown={stats.data?.breakdowns.modules ?? []}
              breakdownTitle="Busiest areas"
            />
          </div>
        </div>
      )}

      <Panel flush>
        <AuditTable
          rows={rows}
          loading={logs.isPending}
          error={logs.isError ? logs.error : null}
          hasFilters={filters.length > 0 || q !== ''}
          hasMore={Boolean(logs.hasNextPage)}
          loadingMore={logs.isFetchingNextPage}
          onLoadMore={() => void logs.fetchNextPage()}
          onOpen={setOpenId}
        />
      </Panel>

      <AuditDetailDialog id={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
