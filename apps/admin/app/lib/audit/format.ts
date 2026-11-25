import {format} from 'date-fns';

import type {AuditStats} from '@grov/models';

const number = (value: number) => value.toLocaleString('en-NG');

export const formatCount = number;

/** Basis points as a percentage with two decimals: 10000 → "100.00%". */
export function formatChange(bps: number): string {
  return `${(Math.abs(bps) / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

type Bucket = AuditStats['range']['bucket'];

/** Chart axis label: the day for daily buckets, day and hour otherwise. */
export function bucketLabel(bucket: Bucket, iso: string): string {
  const at = new Date(iso);
  return bucket === 'DAY' ? format(at, 'dd/MM') : format(at, 'dd/MM HH:mm');
}

/** Tooltip heading: the bucket's start, with the year. */
export function bucketTitle(bucket: Bucket, iso: string): string {
  const at = new Date(iso);
  return bucket === 'DAY' ? format(at, 'dd/MM/yyyy') : format(at, 'dd/MM/yyyy HH:mm');
}
