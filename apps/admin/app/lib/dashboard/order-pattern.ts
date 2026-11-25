import type {OrderBucket, OrderPattern} from '@grov/models';

export const PATTERN_SCALES = ['day', 'week', 'month'] as const;
export type PatternScale = (typeof PATTERN_SCALES)[number];

export const PATTERN_OPTIONS: readonly {value: PatternScale; label: string}[] = [
  {value: 'day', label: 'Day'},
  {value: 'week', label: 'Week'},
  {value: 'month', label: 'Month'},
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** "12am", "7pm": an hour of the day. */
function hourLabel(hour: number): string {
  const suffix = hour < 12 ? 'am' : 'pm';
  return `${hour % 12 === 0 ? 12 : hour % 12}${suffix}`;
}

/** The short label on the chart axis for one bucket. */
export function bucketLabel(scale: PatternScale, bucket: number): string {
  if (scale === 'day') return hourLabel(bucket);
  if (scale === 'week') return (WEEKDAYS[bucket - 1] ?? '').slice(0, 3);
  return String(bucket);
}

/** The full name for a tooltip or a sentence: "7pm to 8pm", "Friday", "the 20th". */
export function bucketTitle(scale: PatternScale, bucket: number): string {
  if (scale === 'day') return `${hourLabel(bucket)} to ${hourLabel((bucket + 1) % 24)}`;
  if (scale === 'week') return WEEKDAYS[bucket - 1] ?? '';
  return `Day ${bucket} of the month`;
}

const ORDINAL = new Intl.PluralRules('en', {type: 'ordinal'});
const SUFFIX: Record<string, string> = {one: 'st', two: 'nd', few: 'rd', other: 'th'};

function ordinal(n: number): string {
  return `${n}${SUFFIX[ORDINAL.select(n)] ?? 'th'}`;
}

export interface Busiest {
  bucket: number;
  orders: number;
  /** Share of all orders in the period, 0 to 1. */
  share: number;
}

/** The bucket with the most orders, or `null` when nothing was ordered. Ties go to the earlier bucket. */
export function busiest(buckets: readonly OrderBucket[]): Busiest | null {
  const total = buckets.reduce((sum, b) => sum + b.orders, 0);
  if (total === 0) return null;
  let top = buckets[0];
  for (const bucket of buckets) {
    if (top && bucket.orders > top.orders) top = bucket;
  }
  return top ? {bucket: top.bucket, orders: top.orders, share: top.orders / total} : null;
}

/** "Most orders come in on Fridays (24%)." Counts only, no explanation of why. */
export function patternSentence(scale: PatternScale, buckets: readonly OrderBucket[]): string {
  const top = busiest(buckets);
  if (!top) return 'No orders in this period.';
  const share = `${Math.round(top.share * 100)}% of orders`;
  if (scale === 'day') return `Orders peak from ${bucketTitle('day', top.bucket)} (${share}).`;
  if (scale === 'week') return `${bucketTitle('week', top.bucket)} is the busiest day (${share}).`;
  return `The ${ordinal(top.bucket)} is the busiest day of the month (${share}).`;
}

export function pickPattern(pattern: OrderPattern, scale: PatternScale): OrderBucket[] {
  return pattern[scale];
}
