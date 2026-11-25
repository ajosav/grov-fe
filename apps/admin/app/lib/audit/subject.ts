import type {AuditLogItem, AuditSubject} from '@grov/models';

import {paths, productPath, storePath} from '../../paths';

const KIND_LABEL: Record<AuditSubject['kind'], string> = {
  product: 'Product',
  store: 'Store',
  category: 'Category',
  city: 'City',
  role: 'Role',
  staff: 'Staff member',
  invite: 'Staff invite',
  food: 'Food',
  meal: 'Meal',
  allergen: 'Allergen',
  unit: 'Unit',
  file: 'File',
  other: 'Record',
};

type Subjected = Pick<AuditLogItem, 'subject' | 'entityType' | 'action' | 'entityId'>;

/** "Product", "Staff member"… For an unknown kind, the entity type made readable. */
export function subjectKindLabel(item: Subjected): string {
  if (item.subject.kind !== 'other') return KIND_LABEL[item.subject.kind];
  const text = item.entityType.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** The name to show; falls back to a short id, then to a plain "Unnamed …". */
export function subjectName(item: Subjected): string {
  if (item.subject.name) return item.subject.name;
  const id = item.subject.id ?? item.entityId;
  return id ? `Unnamed ${subjectKindLabel(item).toLowerCase()} · ${id.slice(0, 8)}` : '—';
}

/** Where the record can be opened; null when it has no page or no longer exists. */
export function subjectLink(item: Subjected): string | null {
  if (/\.(deleted|removed)$/.test(item.action)) return null;
  const {kind, id, name} = item.subject;
  const entity = item.entityType;
  switch (kind) {
    case 'product':
      if (!id) return null;
      if (entity === 'stock') return productPath(id, 'inventory');
      if (entity === 'price' || entity === 'price_markup') return productPath(id, 'pricing');
      return productPath(id);
    case 'store':
      return id ? storePath(id) : null;
    case 'staff':
      return name ? `${paths.staff}?q=${encodeURIComponent(name)}` : paths.staff;
    case 'invite':
      return `${paths.staff}?tab=invites`;
    case 'role':
      return paths.roles;
    case 'city':
      return paths.cities;
    case 'category':
      return paths.categories;
    case 'food':
      return paths.foods;
    case 'meal':
      return paths.meals;
    default:
      return null;
  }
}
