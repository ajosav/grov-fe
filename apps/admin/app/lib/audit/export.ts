import type {AuditLogItem} from '@grov/models';

import {formatMomentSeconds} from '../format/dates';
import {subjectKindLabel, subjectName} from './subject';

export const EXPORT_HEADERS = [
  'Time (WAT)',
  'Time (UTC)',
  'Action',
  'Action code',
  'Kind',
  'Area',
  'Resource type',
  'Resource name',
  'Resource ID',
  'Actor email',
  'Actor name',
  'Actor roles',
  'Store',
  'IP address',
  'Request ID',
];

/** One CSV row per entry, in the column order of `EXPORT_HEADERS`. */
export function exportRows(rows: readonly AuditLogItem[]): (string | null)[][] {
  return [
    EXPORT_HEADERS,
    ...rows.map(row => [
      formatMomentSeconds(row.at),
      row.at,
      row.label,
      row.action,
      row.kind,
      row.moduleLabel,
      subjectKindLabel(row),
      subjectName(row),
      row.subject.id ?? row.entityId ?? null,
      row.actor?.email ?? 'System',
      row.actor?.name ?? null,
      row.actor?.roles.join('; ') ?? null,
      row.storeName,
      row.ip ?? null,
      row.requestId ?? null,
    ]),
  ];
}

export function exportFileName(now = new Date()): string {
  return `audit-logs-${now.toISOString().slice(0, 10)}.csv`;
}
