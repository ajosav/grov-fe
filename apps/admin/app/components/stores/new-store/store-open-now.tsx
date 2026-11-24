import {Controller, type Control} from 'react-hook-form';

import {Card, Switch} from '@grov/ui';

import type {NewStoreValues} from '../../../lib/stores/new-store';

interface StoreOpenNowProps {
  control: Control<NewStoreValues>;
}

/** Whether the store starts serving as soon as it is added. */
export function StoreOpenNow({control}: StoreOpenNowProps) {
  return (
    <Card className="p-5">
      <Controller
        control={control}
        name="openNow"
        render={({field}) => (
          <div className="flex items-start gap-3">
            <Switch
              id="open-now"
              aria-describedby="open-now-hint"
              checked={field.value}
              onCheckedChange={field.onChange}
              className="mt-0.5"
            />
            <span className="grid gap-0.5">
              <label htmlFor="open-now" className="text-label">
                Serve customers straight away
              </label>
              <span id="open-now-hint" className="text-body-sm text-ink-muted">
                Leave off to finish setting up first: zone, delivery settings, stock and staff.
                Until it’s active, no address is served by this store.
              </span>
            </span>
          </div>
        )}
      />
    </Card>
  );
}
