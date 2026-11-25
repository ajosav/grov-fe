import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys, useApi} from '@grov/api';
import type {Category, CreateCategoryBody, UpdateCategoryBody} from '@grov/models';

/** All categories, inactive ones too. Small and rarely changing, so a longer stale time. */
export function useCategories() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.adminCategories.list,
    queryFn: () => api.adminCategories.list(),
    staleTime: 5 * 60_000,
  });
}

/** A category change shows in the category list and in every product row that names it. */
function useCategoryWritten() {
  const queryClient = useQueryClient();
  return async (_category: Category) => {
    await Promise.all([
      queryClient.invalidateQueries({queryKey: queryKeys.adminCategories.all}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminProducts.all}),
    ]);
  };
}

export function useCreateCategory() {
  const api = useApi();
  const written = useCategoryWritten();
  return useMutation({
    /** `idempotencyKey`: created when the admin opens the form, reused on retry (data.md). */
    mutationFn: ({body, idempotencyKey}: {body: CreateCategoryBody; idempotencyKey: string}) =>
      api.adminCategories.create(body, idempotencyKey),
    onSuccess: written,
  });
}

export function useUpdateCategory() {
  const api = useApi();
  const written = useCategoryWritten();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: UpdateCategoryBody}) =>
      api.adminCategories.update(id, body),
    onSuccess: written,
  });
}

export function useDeleteCategory() {
  const api = useApi();
  const written = useCategoryWritten();
  return useMutation({
    mutationFn: (id: string) => api.adminCategories.remove(id),
    onSuccess: written,
  });
}
