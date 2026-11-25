import {Percent} from 'lucide-react';

import type {PriceMarkupValue} from '@grov/models';
import {PERMISSIONS} from '@grov/models';
import {Can} from '@grov/shared';
import {Button, Card} from '@grov/ui';

import {describeMarkup} from '../../../lib/catalogue/markups';

interface StoreMarkupCardProps {
  storeName: string;
  markup: PriceMarkupValue | undefined;
  isPending: boolean;
  isError: boolean;
  onChange: () => void;
}

/** Summary of the store-wide markup, with the one control that changes it. */
export function StoreMarkupCard({
  storeName,
  markup,
  isPending,
  isError,
  onChange,
}: StoreMarkupCardProps) {
  return (
    <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex items-start gap-3">
        <Percent aria-hidden className="mt-0.5 size-5 text-ink-muted" />
        <div className="grid gap-0.5">
          <span className="text-label">Store-wide markup</span>
          <p className="text-body-sm text-ink-muted">
            {isPending
              ? 'Loading…'
              : isError
                ? 'Couldn’t load the markups.'
                : markup && markup.kind !== 'NONE'
                  ? `${describeMarkup(markup)} on top of every base price at ${storeName}.`
                  : `Shoppers pay the base price at ${storeName}. Add a markup to charge more here.`}
          </p>
        </div>
      </div>
      <Can permission={PERMISSIONS.PRODUCTS.LISTINGS_WRITE}>
        <Button
          variant="outline"
          disabled={isPending || isError}
          onClick={onChange}
        >
          {markup && markup.kind !== 'NONE' ? 'Change markup' : 'Set markup'}
        </Button>
      </Can>
    </Card>
  );
}
