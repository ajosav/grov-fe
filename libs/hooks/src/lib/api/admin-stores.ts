import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys, useApi} from '@grov/api';
import type {
  AdminStoreDetail,
  CoverageCheckBody,
  CreateStoreBody,
  SetDeliveryZoneBody,
  StoreStatus,
  UpdateStoreBody,
} from '@grov/models';

export interface StoreFilters {
  status?: StoreStatus;
  cityId?: string;
}

/** Stores this admin may act on, newest first (cursor-paginated). */
export function useStores(filters: StoreFilters = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.adminStores.list(filters),
    queryFn: ({pageParam}) => api.adminStores.list({...filters, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
  });
}

export function useStore(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.adminStores.detail(id ?? ''),
    queryFn: () => api.adminStores.get(id ?? ''),
    enabled: Boolean(id),
  });
}

/** The delivery config that applies to a store, and where each field comes from. */
export function useStoreDeliveryConfig(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.adminStores.deliveryConfig(id ?? ''),
    queryFn: () => api.adminStores.deliveryConfig(id ?? ''),
    enabled: Boolean(id),
  });
}

/**
 * Store changes show in the list, the store menu (`my-stores`) and the city's
 * store count, so all three refresh after any write.
 */
function useStoreWritten() {
  const queryClient = useQueryClient();
  return async (store: AdminStoreDetail) => {
    queryClient.setQueryData(queryKeys.adminStores.detail(store.id), store);
    await Promise.all([
      queryClient.invalidateQueries({queryKey: queryKeys.adminStores.lists}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminStores.deliveryConfig(store.id)}),
      queryClient.invalidateQueries({queryKey: queryKeys.admin.myStores}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminCities.all}),
    ]);
  };
}

export function useCreateStore() {
  const api = useApi();
  const written = useStoreWritten();
  return useMutation({
    /** `idempotencyKey`: created when the admin opens the form, reused on retry (data.md). */
    mutationFn: ({body, idempotencyKey}: {body: CreateStoreBody; idempotencyKey: string}) =>
      api.adminStores.create(body, idempotencyKey),
    onSuccess: written,
  });
}

export function useUpdateStore() {
  const api = useApi();
  const written = useStoreWritten();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: UpdateStoreBody}) =>
      api.adminStores.update(id, body),
    onSuccess: written,
  });
}

export function useSetDeliveryZone() {
  const api = useApi();
  const written = useStoreWritten();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: SetDeliveryZoneBody}) =>
      api.adminStores.setDeliveryZone(id, body),
    onSuccess: written,
  });
}

/** Which stores cover a pin, and which one serves it. A read, sent as POST; nothing to cache. */
export function useCoverageCheck() {
  const api = useApi();
  return useMutation({
    mutationFn: (body: CoverageCheckBody) => api.adminStores.checkCoverage(body),
  });
}
