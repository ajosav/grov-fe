import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';

import {type ListingStateFilter, queryKeys, useApi} from '@grov/api';
import type {PutListingBody} from '@grov/models';

export interface ListingFilters {
  state?: ListingStateFilter;
}

/** The active store's listings, oldest first (cursor-paginated). Switching store refreshes them. */
export function useListings(filters: ListingFilters = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.adminListings.list(filters),
    queryFn: ({pageParam}) => api.adminListings.list({...filters, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
  });
}

/** Any listing change moves rows between the state filters, so every list is refreshed. */
function useListingsWritten() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({queryKey: queryKeys.adminListings.all}),
      // The product lists and a product's own listings change with it.
      queryClient.invalidateQueries({queryKey: queryKeys.adminProducts.lists}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminProducts.listings}),
    ]);
}

/** List a product, pause or resume it, or set its minimum order (replaces the listing). */
export function usePutListing() {
  const api = useApi();
  const written = useListingsWritten();
  return useMutation({
    mutationFn: ({productId, body}: {productId: string; body: PutListingBody}) =>
      api.adminListings.put(productId, body),
    onSuccess: written,
  });
}

export function useDelistProduct() {
  const api = useApi();
  const written = useListingsWritten();
  return useMutation({
    mutationFn: (productId: string) => api.adminListings.delist(productId),
    onSuccess: written,
  });
}

/** List the source store's active products here. Listings that already exist are left alone. */
export function useCopyListings() {
  const api = useApi();
  const written = useListingsWritten();
  return useMutation({
    mutationFn: (sourceStoreId: string) => api.adminListings.copyFrom(sourceStoreId),
    onSuccess: written,
  });
}
