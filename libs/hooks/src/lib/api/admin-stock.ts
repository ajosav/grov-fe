import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {queryKeys, type StockMovementParams, type StockOverviewParams, useApi} from '@grov/api';
import type {StockSettingsBody} from '@grov/models';

const keys = queryKeys.adminStock;

/** Products the active store counts, with sales pace, days of cover and what to buy. */
export function useStockOverview(params: StockOverviewParams) {
  const api = useApi();
  return useQuery({
    queryKey: keys.overview(params),
    queryFn: () => api.adminStock.overview(params),
    placeholderData: keepPreviousData,
  });
}

/** Counts by restock status, stock value and recent flow at the active store. */
export function useStockSummary() {
  const api = useApi();
  return useQuery({queryKey: keys.summary, queryFn: () => api.adminStock.summary()});
}

/** The movement log, newest first (cursor-paginated). */
export function useStockMovements(params: Omit<StockMovementParams, 'cursor'> = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: keys.movements(params),
    queryFn: ({pageParam}) => api.adminStock.movements({...params, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
  });
}

/**
 * Stock changed: every stock list and figure refreshes, and so do the catalogue's stock states
 * and a product's inventory tab, which read the same numbers.
 */
export function useStockWritten() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({queryKey: keys.all}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminProductAnalytics.all}),
    ]);
}

/** Low threshold, lead time or cover target; `null` clears one. */
export function useSetStockSettings() {
  const api = useApi();
  const written = useStockWritten();
  return useMutation({
    mutationFn: ({productId, body}: {productId: string; body: StockSettingsBody}) =>
      api.adminStock.settings(productId, body),
    onSuccess: written,
  });
}
