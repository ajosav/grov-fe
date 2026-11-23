/**
 * Sample maths behind the "Watch the plan add up" builder. Illustration only:
 * real plans use live prices for the household's store (the server computes
 * every real total). Ported unchanged from the original page.
 */
import type {ChipKind} from './price-chip';

export type Band = 'ad' | 'te' | 'ki' | 'li';
export type Counts = Record<Band, number>;
export type Weeks = 1 | 2 | 4;

export const MAX_PER_BAND = 8;
const WEIGHT: Counts = {ad: 1, te: 1, ki: 0.7, li: 0.45}; // portion weight per age band (sample)
const UNIT = 9575; // sample ₦ per weighted person-week
export const DROP_FEE = 4000; // placeholder delivery fee per drop
const SHARES: Record<number, number[]> = {
  1: [1],
  2: [0.6, 0.4],
  3: [0.5, 0.25, 0.25],
  4: [68400 / 168500, 34100 / 168500, 32900 / 168500, 33100 / 168500],
};
const DATES: Record<number, string[]> = {
  1: ['Sat 17 Oct'],
  2: ['Sat 17 Oct', 'Sat 31 Oct'],
  3: ['Sat 17 Oct', 'Sat 31 Oct', 'Sat 14 Nov'],
  4: ['Sat 17 Oct', 'Sat 24 Oct', 'Sat 31 Oct', 'Sat 7 Nov'],
};
const CUTOFF: Record<string, string> = {
  'Sat 24 Oct': 'Thu 22 Oct',
  'Sat 31 Oct': 'Thu 29 Oct',
  'Sat 7 Nov': 'Thu 5 Nov',
  'Sat 14 Nov': 'Thu 12 Nov',
};

/** D24: a week comes in 1 drop, two weeks in up to 2, a month in up to 4. */
export const maxDrops = (weeks: Weeks): number => (weeks === 1 ? 1 : weeks === 2 ? 2 : 4);

export function canStep(counts: Counts, band: Band, delta: number): boolean {
  const next = counts[band] + delta;
  if (next < 0 || next > MAX_PER_BAND) return false;
  // Someone 13+ must stay in the house.
  if (delta < 0 && (band === 'ad' || band === 'te') && counts.ad + counts.te + delta < 1)
    return false;
  return true;
}

const qty = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const kg = (x: number) => `${Math.max(0.5, Math.round(x * 2) / 2)} kg`;

export interface PlanLine {
  name: string;
  amount: string;
  price: number;
  status?: ChipKind;
}

export interface Plan {
  people: string;
  period: string;
  dropsHint: string;
  lines: PlanLine[];
  food: number;
  feesLabel: string;
  fees: number;
  total: number;
  budget: {kind: 'none' | 'above' | 'under' | 'on'; difference: number; budget: number};
  drops: {date: string; note: string; amount: number}[];
}

export function computePlan(counts: Counts, weeks: Weeks, drops: number, budget: number): Plan {
  const u =
    counts.ad * WEIGHT.ad + counts.te * WEIGHT.te + counts.ki * WEIGHT.ki + counts.li * WEIGHT.li;
  const people = counts.ad + counts.te + counts.ki + counts.li;
  let food = Math.round((u * weeks * UNIT) / 500) * 500;
  const fees = drops * DROP_FEE;
  const k = (u * weeks) / 17.6;

  const der = Math.max(1, Math.round(k * 5));
  const bk = der >= 5 ? Math.round((der / 5) * 2) / 2 : 0;
  const beans = Math.max(1, Math.round(k * 3));
  const garri = Math.max(1, Math.round(k * 2));
  const eggs = Math.round(k * 2);
  const staples: PlanLine[] = [
    {
      name: 'Rice, local parboiled',
      amount: kg(bk ? bk * 4.5 : der * 0.9),
      price: bk ? bk * 21000 : der * 4300,
      status: 'lock',
    },
    {name: 'Brown beans', amount: kg(beans * 0.9), price: beans * 2800, status: 'est'},
    {name: 'Garri, white', amount: kg(garri * 1.3), price: garri * 2600, status: 'upd'},
    {
      name: 'Eggs',
      amount: eggs >= 1 ? `${qty(eggs, 'crate', 'crates')} (${eggs * 30})` : 'half crate (15)',
      price: (eggs >= 1 ? eggs : 0.5) * 5900,
      status: 'lock',
    },
  ];
  const shown = staples.reduce((sum, line) => sum + line.price, 0);
  const items = Math.round(12 + u * weeks * 1.5);
  // Small plans: staples never exceed ~60% of food, so the rest of the basket stays visible.
  food = Math.max(food, Math.round(shown / 0.6 / 500) * 500);
  const total = food + fees;

  const lines: PlanLine[] = [
    ...staples,
    {
      name: 'Proteins, fresh produce, oils and more',
      amount: `${items - 4} more items, each with its price status`,
      price: Math.max(0, food - shown),
    },
  ];

  const share = SHARES[drops] ?? [1];
  const dates = weeks === 2 && drops === 2 ? ['Sat 17 Oct', 'Sat 24 Oct'] : (DATES[drops] ?? []);
  let left = total;
  const dropRows = dates.map((date, i) => {
    const amount =
      i === drops - 1 ? left : Math.round((food * (share[i] ?? 0) + DROP_FEE) / 100) * 100;
    left -= amount;
    return {date, note: i === 0 ? 'First drop' : `Edit until ${CUTOFF[date] ?? ''}, 6pm`, amount};
  });

  return {
    people: qty(people, 'person', 'people'),
    period: weeks === 1 ? '17 – 23 Oct' : weeks === 2 ? '17 – 30 Oct' : '17 Oct – 15 Nov',
    dropsHint:
      weeks === 1
        ? 'A week comes in 1 drop'
        : weeks === 2
          ? 'Up to 2 in two weeks'
          : 'Up to 4 in a month',
    lines,
    food,
    feesLabel: `${qty(drops, 'drop', 'drops')} × ₦${DROP_FEE.toLocaleString('en-NG')}`,
    fees,
    total,
    budget: !budget
      ? {kind: 'none', difference: 0, budget}
      : total > budget
        ? {kind: 'above', difference: total - budget, budget}
        : total < budget
          ? {kind: 'under', difference: budget - total, budget}
          : {kind: 'on', difference: 0, budget},
    drops: dropRows,
  };
}
