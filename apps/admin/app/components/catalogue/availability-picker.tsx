import {useMyStores} from '@grov/hooks';
import {usePermissions} from '@grov/shared';
import {Field, MultiCombobox, Segmented} from '@grov/ui';

import type {AvailabilityChoice} from '../../lib/product-details';
import {hasAllStores} from '../../lib/stores';

export interface AvailabilityPickerProps {
  value: AvailabilityChoice;
  onChange: (value: AvailabilityChoice) => void;
  error?: string;
  /** Editing: the options add stores; they never take a product off one. */
  editing?: boolean;
  disabled?: boolean;
}

type Mode = AvailabilityChoice['mode'];

/** Where a product is sold. A product is sold at a store only once it has an active listing there (ADR 0001 §4). */
export function AvailabilityPicker({
  value,
  onChange,
  error,
  editing,
  disabled,
}: AvailabilityPickerProps) {
  const stores = useMyStores();
  const {access} = usePermissions();
  const everyStore = hasAllStores(access?.admin);
  const options: {value: Mode; label: string}[] = [
    {value: 'none', label: editing ? 'No change' : 'Not listed yet'},
    ...(everyStore ? [{value: 'all' as const, label: 'All stores'}] : []),
    {value: 'stores', label: 'Chosen stores'},
  ];

  return (
    <div className="grid gap-4">
      <Field label="List at" error={value.mode === 'stores' ? error : undefined}>
        <Segmented<Mode>
          label="List at"
          value={value.mode}
          onChange={mode => !disabled && onChange({...value, mode})}
          options={options}
        />
      </Field>
      <p className="text-body-sm text-ink-muted">
        {value.mode === 'all'
          ? 'Listed at every active store now, and at every store added later.'
          : value.mode === 'stores'
            ? 'Listed at the stores you choose. Other stores can list it later from Store listings.'
            : editing
              ? 'Leaves the current listings as they are. Pause or remove a listing from Store listings.'
              : 'Saved as a product only. No store sells it until you list it, here or from Store listings.'}
      </p>
      {value.mode === 'stores' ? (
        <Field label="Stores" error={error}>
          <MultiCombobox
            value={value.storeIds}
            onChange={storeIds => onChange({...value, storeIds})}
            loading={stores.isPending}
            placeholder="Choose stores"
            searchPlaceholder="Search stores"
            emptyText={stores.isError ? 'Couldn’t load stores.' : 'No stores found.'}
            options={(stores.data?.stores ?? []).map(store => ({
              value: store.id,
              label: store.status === 'ACTIVE' ? store.name : `${store.name} (inactive)`,
            }))}
          />
        </Field>
      ) : null}
    </div>
  );
}
