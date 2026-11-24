import type {CategoryTint} from '@grov/models';
import {Badge, type BadgeProps} from '@grov/ui';

import {CATEGORY_TINTS} from '../../lib/categories';

const TINT_TONE: Record<CategoryTint, BadgeProps['tone']> = {
  GRAIN: 'palm',
  PROTEIN: 'flame',
  PRODUCE: 'leaf',
  OIL: 'sky',
  PACKAGE: 'neutral',
};

export function CategoryTintBadge({tint}: {tint: CategoryTint}) {
  return <Badge tone={TINT_TONE[tint]}>{CATEGORY_TINTS[tint].label}</Badge>;
}

/** Active / Inactive for categories and products. Inactive things are hidden from shoppers. */
export function ActiveBadge({active, draft = false}: {active: boolean; draft?: boolean}) {
  if (draft) return <Badge tone="flame">Draft</Badge>;
  return active ? <Badge tone="leaf">Active</Badge> : <Badge tone="neutral">Inactive</Badge>;
}
