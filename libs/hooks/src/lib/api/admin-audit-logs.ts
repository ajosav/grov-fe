import {keepPreviousData, useInfiniteQuery, useMutation, useQuery} from '@tanstack/react-query';

import {type AuditLogListParams, type AuditLogParams, queryKeys, useApi} from '@grov/api';
import type {AuditLogItem} from '@grov/models';

const keys = queryKeys.adminAuditLogs;

/** Entries newest first, cursor-paginated. Changing the period or filters starts again. */
export function useAuditLogs(params: AuditLogParams & {limit?: number}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: keys.list(params),
    queryFn: ({pageParam}) => api.adminAuditLogs.list({...params, cursor: pageParam}),
    initialPageParam: undefined as AuditLogListParams['cursor'],
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  });
}

/** Totals, the chart series and top breakdowns for the same period and filters. */
export function useAuditStats(params: AuditLogParams) {
  const api = useApi();
  return useQuery({
    queryKey: keys.stats(params),
    queryFn: () => api.adminAuditLogs.stats(params),
    placeholderData: keepPreviousData,
  });
}

/** What the filter pickers can offer for the period. */
export function useAuditFacets(params: Pick<AuditLogParams, 'from' | 'to'>) {
  const api = useApi();
  return useQuery({
    queryKey: keys.facets(params),
    queryFn: () => api.adminAuditLogs.facets(params),
    staleTime: 60_000,
  });
}

export function useAuditLog(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: keys.detail(id ?? ''),
    queryFn: () => api.adminAuditLogs.detail(id ?? ''),
    enabled: Boolean(id),
    staleTime: Infinity,
  });
}

/** Most entries one export holds. */
export const AUDIT_EXPORT_CAP = 5000;

/** Every entry of the current period, filters and search, newest first, up to the cap. */
export function useExportAuditLogs() {
  const api = useApi();
  return useMutation({
    mutationFn: async (params: AuditLogParams) => {
      const rows: AuditLogItem[] = [];
      let cursor: string | undefined;
      let truncated = false;
      for (;;) {
        const page = await api.adminAuditLogs.list({...params, cursor, limit: 50});
        rows.push(...page.data);
        cursor = page.meta?.nextCursor ?? undefined;
        if (!cursor) break;
        if (rows.length >= AUDIT_EXPORT_CAP) {
          truncated = true;
          break;
        }
      }
      return {rows, truncated};
    },
  });
}
