import {useEffect, useMemo} from 'react';

import {useFoods} from '@grov/hooks';

import {lagosMonth, summariseSeason} from '../../lib/dashboard/season';

/**
 * Every active food, sorted by what the season means today. Reads all pages of the food list
 * (the list is cursor-paginated), so `loading` stays true until the last page arrives.
 */
export function useSeasonalFoods(enabled: boolean) {
  const foods = useFoods({}, {enabled});
  const {hasNextPage, isFetchingNextPage, fetchNextPage} = foods;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const month = lagosMonth(new Date());
  const pages = foods.data?.pages;
  const summary = useMemo(
    () =>
      summariseSeason(
        (pages ?? [])
          .flatMap(page => page.data)
          .filter(food => food.status === 'ACTIVE')
          .map(food => ({id: food.id, name: food.name, seasonMonths: food.seasonMonths})),
        month
      ),
    [pages, month]
  );
  return {
    summary,
    month,
    loading: enabled && (foods.isPending || Boolean(hasNextPage)),
    error: foods.error,
    refetch: foods.refetch,
  };
}
