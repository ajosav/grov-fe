import type {Category, CategoryTint} from '@grov/models';

export const CATEGORY_TINTS: Record<CategoryTint, {label: string; hint: string}> = {
  GRAIN: {label: 'Grains', hint: 'Rice, beans, garri, flour. Dry goods.'},
  PROTEIN: {label: 'Protein', hint: 'Meat, fish, eggs. Prices go stale sooner.'},
  PRODUCE: {label: 'Produce', hint: 'Vegetables, fruit, tubers. Prices go stale sooner.'},
  OIL: {label: 'Oils and sauces', hint: 'Palm oil, groundnut oil, tomato paste.'},
  PACKAGE: {label: 'Packaged', hint: 'Seasoning, drinks, snacks.'},
};

export const CATEGORY_TINT_KEYS = Object.keys(CATEGORY_TINTS) as CategoryTint[];

export interface CategoryRow {
  category: Category;
  depth: 0 | 1;
  childCount: number;
}

export function categoryRows(categories: readonly Category[]): CategoryRow[] {
  const ids = new Set(categories.map(category => category.id));
  const children = new Map<string, Category[]>();
  const roots: Category[] = [];
  for (const category of categories) {
    if (category.parentId && ids.has(category.parentId)) {
      const siblings = children.get(category.parentId) ?? [];
      siblings.push(category);
      children.set(category.parentId, siblings);
    } else {
      roots.push(category);
    }
  }
  return roots.flatMap(root => {
    const kids = children.get(root.id) ?? [];
    return [
      {category: root, depth: 0 as const, childCount: kids.length},
      ...kids.map(kid => ({category: kid, depth: 1 as const, childCount: 0})),
    ];
  });
}

export function categoryPath(id: string | null | undefined, categories: readonly Category[]) {
  const found = categories.find(category => category.id === id);
  if (!found) return null;
  const parent = categories.find(category => category.id === found.parentId);
  return parent ? `${parent.name} › ${found.name}` : found.name;
}
