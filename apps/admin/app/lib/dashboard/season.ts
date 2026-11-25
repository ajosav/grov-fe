export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Full month names, for sentences ("what November means"). */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export type SeasonStatus = 'IN_SEASON' | 'LEAVING' | 'COMING' | 'OUT' | 'YEAR_ROUND' | 'UNSET';

/** A season ending (or starting) within this many months is "leaving" (or "coming"). This month counts as the first. */
export const SOON_MONTHS = 2;

export interface SeasonFood {
  id: string;
  name: string;
  /** Months 1–12 the food is in season; null when nobody has set it. */
  seasonMonths: number[] | null;
}

export interface FoodSeason {
  id: string;
  name: string;
  months: number[];
  status: SeasonStatus;
  /** "Jun–Nov", "Nov–Feb, Jun", "All year". */
  window: string;
  /** In season now: months left including this one. */
  monthsLeft: number | null;
  /** In season now: the last month of this run (1–12). */
  endMonth: number | null;
  /** Out of season: months until it starts (1–11). */
  startsIn: number | null;
  /** Out of season: the month it starts (1–12). */
  startMonth: number | null;
}

/** The month (1–12) in Lagos, where the business runs. */
export function lagosMonth(now: Date): number {
  return Number(
    new Intl.DateTimeFormat('en-GB', {month: 'numeric', timeZone: 'Africa/Lagos'}).format(now)
  );
}

const wrap = (month: number) => ((((month - 1) % 12) + 12) % 12) + 1;

/** "Jun–Nov", with a run that crosses New Year as "Nov–Feb". */
export function seasonWindow(months: readonly number[]): string {
  const set = new Set(months.filter(m => m >= 1 && m <= 12));
  if (set.size === 0) return '';
  if (set.size === 12) return 'All year';
  const starts = [...set].filter(m => !set.has(wrap(m - 1))).sort((a, b) => a - b);
  return starts
    .map(start => {
      let end = start;
      while (set.has(wrap(end + 1))) end = wrap(end + 1);
      const from = MONTH_LABELS[start - 1];
      return end === start ? from : `${from}–${MONTH_LABELS[end - 1]}`;
    })
    .join(', ');
}

export function foodSeason(food: SeasonFood, month: number): FoodSeason {
  const months = [...new Set(food.seasonMonths ?? [])].filter(m => m >= 1 && m <= 12);
  const base = {
    id: food.id,
    name: food.name,
    months,
    window: seasonWindow(months),
    monthsLeft: null,
    endMonth: null,
    startsIn: null,
    startMonth: null,
  };
  if (months.length === 0) return {...base, status: 'UNSET'};
  if (months.length === 12) return {...base, status: 'YEAR_ROUND'};
  if (months.includes(month)) {
    let monthsLeft = 1;
    while (monthsLeft < 12 && months.includes(wrap(month + monthsLeft))) monthsLeft += 1;
    return {
      ...base,
      status: monthsLeft <= SOON_MONTHS ? 'LEAVING' : 'IN_SEASON',
      monthsLeft,
      endMonth: wrap(month + monthsLeft - 1),
    };
  }
  let startsIn = 1;
  while (!months.includes(wrap(month + startsIn))) startsIn += 1;
  return {
    ...base,
    status: startsIn <= SOON_MONTHS ? 'COMING' : 'OUT',
    startsIn,
    startMonth: wrap(month + startsIn),
  };
}

export interface SeasonSummary {
  /** In season with more than two months to go. */
  inSeason: FoodSeason[];
  leaving: FoodSeason[];
  coming: FoodSeason[];
  out: FoodSeason[];
  yearRound: FoodSeason[];
  unset: FoodSeason[];
  /** Foods with a season set (everything but year-round and unset). */
  seasonal: number;
}

const byName = (a: FoodSeason, b: FoodSeason) => a.name.localeCompare(b.name, 'en');

/** Sorts foods into what the season means today. Leaving: soonest to end first. Coming: soonest to start first. */
export function summariseSeason(foods: readonly SeasonFood[], month: number): SeasonSummary {
  const all = foods.map(food => foodSeason(food, month));
  const pick = (status: SeasonStatus) => all.filter(f => f.status === status);
  const inSeason = pick('IN_SEASON').sort(byName);
  const leaving = pick('LEAVING').sort(
    (a, b) => (a.monthsLeft ?? 0) - (b.monthsLeft ?? 0) || byName(a, b)
  );
  const coming = pick('COMING').sort(
    (a, b) => (a.startsIn ?? 0) - (b.startsIn ?? 0) || byName(a, b)
  );
  const out = pick('OUT').sort((a, b) => (a.startsIn ?? 0) - (b.startsIn ?? 0) || byName(a, b));
  return {
    inSeason,
    leaving,
    coming,
    out,
    yearRound: pick('YEAR_ROUND').sort(byName),
    unset: pick('UNSET').sort(byName),
    seasonal: inSeason.length + leaving.length + coming.length + out.length,
  };
}

/** One factual sentence about the season. It states counts, never what prices will do. */
export function seasonSentence(summary: SeasonSummary): string {
  if (summary.seasonal === 0) {
    return 'No food has a season set yet, so there is nothing to compare with the calendar.';
  }
  const inNow = summary.inSeason.length + summary.leaving.length;
  const head = `${inNow} of ${summary.seasonal} seasonal foods are in season`;
  const tail: string[] = [];
  if (summary.leaving.length)
    tail.push(
      `${summary.leaving.length} ${summary.leaving.length === 1 ? 'ends' : 'end'} within two months`
    );
  if (summary.coming.length)
    tail.push(
      `${summary.coming.length} ${summary.coming.length === 1 ? 'starts' : 'start'} within two months`
    );
  return tail.length ? `${head}; ${tail.join(' and ')}.` : `${head}.`;
}
