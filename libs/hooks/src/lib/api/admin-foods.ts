import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys, useApi} from '@grov/api';

/** Foods, newest first, searchable in any language (cursor-paginated). Retired foods are left to the caller. */
export function useFoods(filters: {q?: string} = {}, options: {enabled?: boolean} = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.adminFoods.list(filters),
    queryFn: ({pageParam}) => api.adminFoods.list({...filters, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
    enabled: options.enabled ?? true,
  });
}

/** One food, to start a product from it. Pass no id to stay idle. */
export function useFood(foodId: string | null | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.adminFoods.detail(foodId ?? ''),
    queryFn: () => api.adminFoods.get(foodId as string),
    enabled: Boolean(foodId),
  });
}

/**
 * Link a product to a food as the last brand. The endpoint replaces the whole list, so this
 * reads the current one first and appends. A product that already supplies another food is a 409.
 */
export function useLinkProductToFood() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({foodId, productId}: {foodId: string; productId: string}) => {
      const current = await api.adminFoods.products(foodId);
      const ids = current.map(link => link.productId);
      if (ids.includes(productId)) return current;
      return api.adminFoods.setProducts(foodId, [...ids, productId]);
    },
    onSuccess: (_links, {foodId}) =>
      queryClient.invalidateQueries({queryKey: queryKeys.adminFoods.products(foodId)}),
  });
}
