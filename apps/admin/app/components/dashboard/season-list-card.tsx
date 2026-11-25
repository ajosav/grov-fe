import {CircleCheck} from 'lucide-react';

import {Skeleton} from '@grov/ui';

import {type FoodSeason, MONTH_LABELS} from '../../lib/dashboard/season';
import {InsightCard} from './insight-card';

export type SeasonListKind = 'in-season' | 'leaving' | 'coming';

const ROWS = 5;

function detail(food: FoodSeason, kind: SeasonListKind): string {
  if (kind === 'leaving' && food.endMonth) {
    return `Last month: ${MONTH_LABELS[food.endMonth - 1]}`;
  }
  if (kind === 'coming' && food.startMonth) {
    return `Starts ${MONTH_LABELS[food.startMonth - 1]}`;
  }
  return food.window;
}

export interface SeasonListCardProps {
  title: string;
  kind: SeasonListKind;
  foods: FoodSeason[];
  loading: boolean;
  empty: string;
  onViewAll: () => void;
}

/** The first few foods in one season group, with when it ends or starts. */
export function SeasonListCard({
  title,
  kind,
  foods,
  loading,
  empty,
  onViewAll,
}: SeasonListCardProps) {
  return (
    <InsightCard title={title} onViewAll={onViewAll} viewAllLabel="View all">
      {loading ? (
        <div className="grid gap-2">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      ) : foods.length === 0 ? (
        <p className="flex items-center gap-2 text-body-sm text-ink-muted">
          <CircleCheck aria-hidden className="size-4" /> {empty}
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {foods.slice(0, ROWS).map(food => (
            <li key={food.id} className="flex items-center justify-between gap-3 py-2 text-body-sm">
              <span className="min-w-0 truncate font-semibold">{food.name}</span>
              <span className="shrink-0 text-ink-muted tabular">{detail(food, kind)}</span>
            </li>
          ))}
        </ul>
      )}
    </InsightCard>
  );
}
