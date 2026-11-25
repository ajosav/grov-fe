import {
  keepPreviousData,
  useInfiniteQuery,
  useIsFetching,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  type ActivityParams,
  type AnalyticsPeriodParams,
  type CatalogueParams,
  type OrderStatsParams,
  queryKeys,
  useApi,
} from '@grov/api';

const keys = queryKeys.adminProductAnalytics;

/** Catalogue header counts (published, drafts, inactive, stock states). */
export function useCatalogueSummary(params: AnalyticsPeriodParams = {}) {
  const api = useApi();
  return useQuery({
    queryKey: keys.summary(params),
    queryFn: () => api.adminProductAnalytics.summary(params),
  });
}

/** Re-reads every catalogue figure on screen (summary, analytics, activity, product reports). */
export function useProductAnalyticsRefresh() {
  const queryClient = useQueryClient();
  const refreshing = useIsFetching({queryKey: keys.all}) > 0;
  return {
    refreshing,
    refresh: () => queryClient.invalidateQueries({queryKey: keys.all}),
  };
}

/** Products with period metrics: numbered pages, sorted and filtered by the server. */
export function useCatalogue(params: CatalogueParams) {
  const api = useApi();
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => api.adminProductAnalytics.catalogue(params),
    placeholderData: keepPreviousData,
  });
}

export function useCatalogueAnalytics(params: AnalyticsPeriodParams = {}) {
  const api = useApi();
  return useQuery({
    queryKey: keys.analytics(params),
    queryFn: () => api.adminProductAnalytics.analytics(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Orders and revenue over a range: counts, revenue by item type and by how orders were paid, and
 * when people order. Pass `enabled: false` to stay idle (no permission, or a filter with no data).
 */
export function useOrderStats(params: OrderStatsParams = {}, options: {enabled?: boolean} = {}) {
  const api = useApi();
  return useQuery({
    queryKey: keys.orderStats(params),
    queryFn: () => api.adminProductAnalytics.orderStats(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

/** Timeline, newest first (cursor-paginated). One product with `productId`. */
export function useProductActivity(params: Omit<ActivityParams, 'cursor'> = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: keys.activity(params),
    queryFn: ({pageParam}) => api.adminProductAnalytics.activity({...params, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
  });
}

export function useProductPerformance(id: string | undefined, params: AnalyticsPeriodParams = {}) {
  const api = useApi();
  return useQuery({
    queryKey: keys.performance(id ?? '', params),
    queryFn: () => api.adminProductAnalytics.performance(id ?? '', params),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });
}

export function useProductStock(id: string | undefined, storeId?: string) {
  const api = useApi();
  return useQuery({
    queryKey: keys.stock(id ?? '', storeId),
    queryFn: () => api.adminProductAnalytics.stock(id ?? '', storeId),
    enabled: Boolean(id),
  });
}

export function useProductPricing(id: string | undefined, storeId?: string) {
  const api = useApi();
  return useQuery({
    queryKey: keys.pricing(id ?? '', storeId),
    queryFn: () => api.adminProductAnalytics.pricing(id ?? '', storeId),
    enabled: Boolean(id),
  });
}

/** The base-price CSV import (`pricing.base-prices`): upload, then start the background import. */
export const PRICE_IMPORT_KIND = 'pricing.base-prices';

export function useStartPriceImport() {
  const api = useApi();
  return useMutation({
    mutationFn: async (input: {
      file: File;
      userId: string;
      dryRun: boolean;
      idempotencyKey: string;
    }) => {
      const stored = await api.adminProductAnalytics.uploadImportFile(input.file, input.userId);
      return api.adminProductAnalytics.startImport(
        {kind: PRICE_IMPORT_KIND, filePath: stored.path, dryRun: input.dryRun},
        input.idempotencyKey
      );
    },
  });
}

const RUNNING = new Set(['PENDING', 'VALIDATING', 'PROCESSING']);

/** Polls an import every 2 s while it runs; refreshes prices and the catalogue when it ends. */
export function useImportJob(id: string | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: keys.importJob(id ?? ''),
    queryFn: async () => {
      const job = await api.adminProductAnalytics.importJob(id ?? '');
      if (!RUNNING.has(job.status)) {
        await Promise.all([
          queryClient.invalidateQueries({queryKey: keys.catalogue}),
          queryClient.invalidateQueries({queryKey: keys.productAll}),
          queryClient.invalidateQueries({queryKey: queryKeys.adminProducts.all}),
        ]);
      }
      return job;
    },
    enabled: Boolean(id),
    refetchInterval: query =>
      query.state.data && !RUNNING.has(query.state.data.status) ? false : 2000,
  });
}

/** Every row of the current catalogue filter, for export (at most 1,000). */
export function useExportCatalogue() {
  const api = useApi();
  return useMutation({
    mutationFn: async (params: CatalogueParams) => {
      const first = await api.adminProductAnalytics.catalogue({...params, page: 1, pageSize: 100});
      const pages = Math.min(10, Math.ceil(first.total / 100));
      const rest = await Promise.all(
        Array.from({length: Math.max(0, pages - 1)}, (_, i) =>
          api.adminProductAnalytics.catalogue({...params, page: i + 2, pageSize: 100})
        )
      );
      return [first, ...rest].flatMap(page => page.items);
    },
  });
}
