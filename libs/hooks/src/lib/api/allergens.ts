import {useQuery} from '@tanstack/react-query';

import {queryKeys, useApi} from '@grov/api';

/** Active allergens, for the label allergen picker. Reference data: cached for a while. */
export function useAllergens() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.allergens,
    queryFn: () => api.allergens.list(),
    staleTime: 10 * 60_000,
  });
}
