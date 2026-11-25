import {useState} from 'react';

import {Search} from 'lucide-react';

import {cn, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@grov/ui';

import {type FoodSeason, MONTH_LABELS} from '../../lib/dashboard/season';
import {SeasonBadge} from './season-badge';

export interface SeasonCalendarProps {
  foods: FoodSeason[];
  /** Month 1–12 in Lagos, outlined in every row. */
  month: number;
  empty: string;
}

/** Foods against the twelve months: shaded where the food is in season, outlined for this month. */
export function SeasonCalendar({foods, month, empty}: SeasonCalendarProps) {
  const [query, setQuery] = useState('');
  const shown = foods.filter(food => food.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="grid gap-3">
      <div className="relative max-w-xs">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          aria-label="Search foods"
          placeholder="Search foods"
          value={query}
          onChange={event => setQuery(event.target.value)}
          className="h-10 pl-9"
        />
      </div>
      {shown.length === 0 ? (
        <p className="text-body-sm text-ink-muted">{query ? 'No food matches that.' : empty}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Food</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Season</TableHead>
              {MONTH_LABELS.map((label, index) => (
                <TableHead
                  key={label}
                  className={cn('px-1 text-center', index + 1 === month && 'text-ink')}
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map(food => (
              <TableRow key={food.id}>
                <TableCell className="font-semibold">{food.name}</TableCell>
                <TableCell>
                  <SeasonBadge status={food.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-ink-muted tabular">
                  {food.window || '—'}
                </TableCell>
                {MONTH_LABELS.map((label, index) => {
                  const inSeason = food.months.includes(index + 1);
                  return (
                    <TableCell key={label} className="px-1">
                      <span
                        className={cn(
                          'block h-5 min-w-6 rounded-sm',
                          inSeason ? 'bg-leaf' : 'bg-surface-sunken',
                          index + 1 === month && 'ring-2 ring-ink'
                        )}
                      >
                        <span className="sr-only">
                          {label}: {inSeason ? 'in season' : 'not in season'}
                        </span>
                      </span>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
