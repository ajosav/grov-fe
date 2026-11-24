import {type ReactNode, useState} from 'react';

import {Search} from 'lucide-react';
import {useNavigate} from 'react-router';

import {useDebounce, useFoods} from '@grov/hooks';
import {PERMISSIONS} from '@grov/models';
import type {Food} from '@grov/models';
import {errorMessage, usePermissions} from '@grov/shared';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Skeleton,
} from '@grov/ui';

import {unitNoun} from '../../lib/units';
import {paths} from '../../paths';

/** "LEAFY_GREEN" → "Leafy green". */
const groupLabel = (group: string) => {
  const text = group.toLowerCase().replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const newProductFromFoodPath = (foodId: string) =>
  `${paths.newProduct}?foodId=${encodeURIComponent(foodId)}`;

export interface NewProductDialogProps {
  trigger: ReactNode;
}

/**
 * The first step of Add product: start from a food in the repository (name and unit come from
 * it, and the product is linked to it) or add a product from scratch. Picking either goes on to
 * the Add product page.
 */
export function NewProductDialog({trigger}: NewProductDialogProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {can} = usePermissions();

  const go = (to: string, food?: Food) => {
    setOpen(false);
    // The picked food is handed over so the next page doesn't fetch what's already on screen.
    void navigate(to, food ? {state: {food}} : undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl content-start">
        <DialogHeader>
          <DialogTitle>Add a product</DialogTitle>
          <DialogDescription>
            Start from a food so the product takes its name and unit and is linked to it, or add one
            from scratch.
          </DialogDescription>
        </DialogHeader>
        {open && can(PERMISSIONS.FOODS.READ) ? (
          <FoodPicker onPick={food => go(newProductFromFoodPath(food.id), food)} />
        ) : null}
        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-body-sm text-ink-muted">Not sold from a food in the repository?</p>
          <Button variant="outline" onClick={() => go(paths.newProduct)}>
            Add without a food
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FoodPicker({onPick}: {onPick: (food: Food) => void}) {
  const [text, setText] = useState('');
  const q = useDebounce(text.trim(), 300);
  const foods = useFoods({q: q || undefined});

  // Retired foods can't be sold from, so they are not offered.
  const rows = (foods.data?.pages.flatMap(page => page.data) ?? []).filter(
    food => food.status !== 'RETIRED'
  );

  return (
    <section className="grid gap-3" aria-label="Start from a food">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          type="search"
          aria-label="Search foods"
          placeholder="Search foods in any language"
          autoComplete="off"
          autoFocus
          className="h-10 pl-9"
          value={text}
          onChange={event => setText(event.target.value)}
        />
      </div>
      {foods.isPending ? (
        <Skeleton className="h-48" />
      ) : foods.isError ? (
        <Alert tone="danger" title="Couldn’t load foods">
          {errorMessage(foods.error)}
        </Alert>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-body text-ink-muted">
          {q ? 'No food matches that search.' : 'There are no foods in the repository yet.'}
        </p>
      ) : (
        <ul className="max-h-72 divide-y divide-line overflow-y-auto rounded-md border border-line">
          {rows.map(food => (
            <li key={food.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{food.name}</div>
                <div className="truncate text-body-sm text-ink-muted">
                  {groupLabel(food.foodGroup)} · counted in {unitNoun(food.baseUnit)}
                  {food.status === 'CANDIDATE' ? ' · not yet checked' : ''}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPick(food)}
                aria-label={`Create a product from ${food.name}`}
              >
                Use
              </Button>
            </li>
          ))}
        </ul>
      )}
      {foods.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            loading={foods.isFetchingNextPage}
            onClick={() => void foods.fetchNextPage()}
          >
            Show more
          </Button>
        </div>
      ) : null}
    </section>
  );
}
