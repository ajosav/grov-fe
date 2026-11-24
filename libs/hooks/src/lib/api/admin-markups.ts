import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {type MarkupScopeInput, queryKeys, useApi} from '@grov/api';
import type {PriceMarkupValue} from '@grov/models';

/** The active store's markups in force, one per scope. Switching store refreshes them. */
export function useStoreMarkups() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.adminListings.markups,
    queryFn: () => api.adminMarkups.list(),
  });
}

/** A markup changes every price at the store, so shoppers' prices and the markup list refresh. */
function useMarkupsWritten() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({queryKey: queryKeys.adminListings.markups});
}

/** Set (or clear, with kind NONE) a markup for the whole store, a category or one size. */
export function useSetMarkup() {
  const api = useApi();
  const written = useMarkupsWritten();
  return useMutation({
    mutationFn: ({
      scope,
      markup,
      idempotencyKey,
    }: {
      scope: MarkupScopeInput;
      markup: PriceMarkupValue;
      idempotencyKey: string;
    }) => api.adminMarkups.set(scope, markup, idempotencyKey),
    onSuccess: written,
  });
}

/** One markup for every size of a product at the active store. */
export function useSetProductMarkup() {
  const api = useApi();
  const written = useMarkupsWritten();
  return useMutation({
    mutationFn: ({productId, markup}: {productId: string; markup: PriceMarkupValue}) =>
      api.adminMarkups.setForProduct(productId, markup),
    onSuccess: written,
  });
}
