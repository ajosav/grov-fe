import type {AuditActionKind, AuditFacets} from '@grov/models';

export type AuditFilterField =
  'kind' | 'module' | 'action' | 'entity' | 'entityId' | 'actor' | 'store';
export type AuditFilterOperator = 'is' | 'not';

export interface AuditFilter {
  field: AuditFilterField;
  op: AuditFilterOperator;
  value: string;
}

export const AUDIT_FILTER_FIELDS: {field: AuditFilterField; label: string}[] = [
  {field: 'kind', label: 'Action type'},
  {field: 'module', label: 'Area'},
  {field: 'action', label: 'Action'},
  {field: 'entity', label: 'Record type'},
  {field: 'entityId', label: 'Record ID'},
  {field: 'actor', label: 'Actor'},
  {field: 'store', label: 'Store'},
];

export const KIND_LABEL: Record<AuditActionKind, string> = {
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  other: 'Other',
};

export const SYSTEM_ACTOR = 'system';

export const OPERATOR_LABEL: Record<AuditFilterOperator, string> = {is: 'is', not: 'is not'};

const FIELDS = new Set<string>(AUDIT_FILTER_FIELDS.map(f => f.field));

export const fieldLabel = (field: AuditFilterField) =>
  AUDIT_FILTER_FIELDS.find(f => f.field === field)?.label ?? field;

/** `kind:not:delete` as the API and the URL carry it. */
export const formatFilter = (filter: AuditFilter) => `${filter.field}:${filter.op}:${filter.value}`;

/** Anything malformed (an edited URL) is dropped rather than sent to the server. */
export function parseFilter(raw: string): AuditFilter | null {
  const first = raw.indexOf(':');
  const second = raw.indexOf(':', first + 1);
  if (first < 1 || second < 0) return null;
  const field = raw.slice(0, first);
  const op = raw.slice(first + 1, second);
  const value = raw.slice(second + 1);
  if (!FIELDS.has(field) || (op !== 'is' && op !== 'not') || !value) return null;
  return {field: field as AuditFilterField, op, value};
}

const MAX_FILTERS = 8;

/** The person the list is narrowed to ("Actor is X"), if there is one. */
export const personOf = (filters: readonly AuditFilter[]): string | null =>
  filters.find(f => f.field === 'actor' && f.op === 'is')?.value ?? null;

/** Narrows to one person (or none, with null), replacing any earlier "Actor is" filter. */
export function withPerson(filters: readonly AuditFilter[], value: string | null): AuditFilter[] {
  const rest = filters.filter(f => !(f.field === 'actor' && f.op === 'is'));
  return value ? [...rest, {field: 'actor', op: 'is', value}] : rest;
}

export function readFilters(params: URLSearchParams): AuditFilter[] {
  return params
    .getAll('f')
    .map(parseFilter)
    .filter((f): f is AuditFilter => f !== null)
    .slice(0, MAX_FILTERS);
}

export function writeFilters(next: URLSearchParams, filters: readonly AuditFilter[]) {
  next.delete('f');
  for (const filter of filters.slice(0, MAX_FILTERS)) next.append('f', formatFilter(filter));
}

export interface ValueOption {
  value: string;
  label: string;
}

/** What a field's value picker offers; null means free text. */
export function valueOptions(
  field: AuditFilterField,
  facets: AuditFacets | undefined
): ValueOption[] | null {
  switch (field) {
    case 'kind':
      return (Object.keys(KIND_LABEL) as AuditActionKind[]).map(value => ({
        value,
        label: KIND_LABEL[value],
      }));
    case 'module':
      return facets?.modules ?? [];
    case 'action':
      return facets?.actions ?? [];
    case 'entity':
      return facets?.entities ?? [];
    case 'actor':
      return [
        {value: SYSTEM_ACTOR, label: 'System (automatic)'},
        ...(facets?.actors.map(a => ({value: a.value, label: `${a.label} · ${a.email}`})) ?? []),
      ];
    case 'store':
      return facets?.stores ?? [];
    case 'entityId':
      return null;
  }
}

/** The value as people read it: a name, not an id. Falls back to the raw value. */
export function valueLabel(filter: AuditFilter, facets: AuditFacets | undefined): string {
  const found = valueOptions(filter.field, facets)?.find(o => o.value === filter.value);
  if (!found) return filter.value;
  return filter.field === 'actor' ? found.label.split(' · ')[0] || found.label : found.label;
}
