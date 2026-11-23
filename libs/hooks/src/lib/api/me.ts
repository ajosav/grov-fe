import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {isApiError, queryKeys, useApi} from '@grov/api';
import type {Me, UpdateMeBody} from '@grov/models';

/**
 * The signed-in person, or `null` when signed out. This is the one source of
 * truth for "am I signed in", gates and access; there is no token in JS to read.
 */
export function useMe() {
  const api = useApi();
  return useQuery<Me | null>({
    queryKey: queryKeys.me,
    queryFn: async () => {
      try {
        return await api.me.get();
      } catch (error) {
        if (isApiError(error) && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
    retry: (count, error) => !(isApiError(error) && error.status < 500) && count < 2,
  });
}

export function useUpdateMe() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateMeBody) => api.me.update(body),
    onSuccess: me => queryClient.setQueryData(queryKeys.me, me),
  });
}

/** Public bootstrap config (legal versions, flags). Cached for the session. */
export function useClientConfig() {
  const api = useApi();
  return useQuery({queryKey: queryKeys.config, queryFn: api.config.get, staleTime: Infinity});
}
