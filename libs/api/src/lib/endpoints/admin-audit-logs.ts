import type {AuditFacets, AuditLogDetail, AuditLogItem, AuditStats} from '@grov/models';

import type {ApiClient} from '../client';

/** The period (instants) and filters every audit view shares. Filters read `field:is|not:value`. */
export interface AuditLogParams {
  from?: string;
  to?: string;
  /** Words to look for; every word must match. */
  q?: string;
  filters?: readonly string[];
}

export interface AuditLogListParams extends AuditLogParams {
  cursor?: string;
  limit?: number;
}

/** Repeated `filter=` keys: the server reads a list from repeats, not from `filter[]`. */
function query(params: AuditLogListParams): URLSearchParams {
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.q) search.set('q', params.q);
  if (params.cursor) search.set('cursor', params.cursor);
  if (params.limit) search.set('limit', String(params.limit));
  for (const filter of params.filters ?? []) search.append('filter', filter);
  return search;
}

/** `/v1/admin/audit-logs`: the history of changes made in the admin console. */
export function adminAuditLogsApi(client: ApiClient) {
  const base = '/v1/admin/audit-logs';
  return {
    list: (params: AuditLogListParams = {}) =>
      client.requestEnvelope<AuditLogItem[]>({method: 'get', url: base, params: query(params)}),
    stats: (params: AuditLogParams = {}) =>
      client.request<AuditStats>({method: 'get', url: `${base}/stats`, params: query(params)}),
    facets: (params: Pick<AuditLogParams, 'from' | 'to'> = {}) =>
      client.request<AuditFacets>({method: 'get', url: `${base}/facets`, params: query(params)}),
    detail: (id: string) =>
      client.request<AuditLogDetail>({method: 'get', url: `${base}/${encodeURIComponent(id)}`}),
  };
}
