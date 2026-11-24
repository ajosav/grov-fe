import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys, useApi} from '@grov/api';
import type {AdminCity, CreateCityBody, UpdateCityBody} from '@grov/models';

/** Every city, with its delivery defaults. Few rows and rarely changed. */
export function useCities(enabled = true) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.adminCities.list,
    queryFn: api.adminCities.list,
    staleTime: 5 * 60_000,
    enabled,
  });
}

export function useCity(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.adminCities.detail(id ?? ''),
    queryFn: () => api.adminCities.get(id ?? ''),
    enabled: Boolean(id),
  });
}

/** A city's name and defaults show on its stores, so store queries refresh too. */
function useCityWritten() {
  const queryClient = useQueryClient();
  return async (city: AdminCity) => {
    queryClient.setQueryData(queryKeys.adminCities.detail(city.id), city);
    await Promise.all([
      queryClient.invalidateQueries({queryKey: queryKeys.adminCities.list}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminStores.all}),
    ]);
  };
}

export function useCreateCity() {
  const api = useApi();
  const written = useCityWritten();
  return useMutation({
    /** `idempotencyKey`: created when the admin opens the form, reused on retry (data.md). */
    mutationFn: ({body, idempotencyKey}: {body: CreateCityBody; idempotencyKey: string}) =>
      api.adminCities.create(body, idempotencyKey),
    onSuccess: written,
  });
}

export function useUpdateCity() {
  const api = useApi();
  const written = useCityWritten();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: UpdateCityBody}) =>
      api.adminCities.update(id, body),
    onSuccess: written,
  });
}
