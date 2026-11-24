import {useState} from 'react';

import {useCity, useStoreDeliveryConfig, useUpdateStore} from '@grov/hooks';
import type {AdminCity, AdminStoreDetail, EffectiveDeliveryConfig} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {Alert, Button, Skeleton, toast} from '@grov/ui';

import {
  type ConfigDraft,
  type ConfigKey,
  draftErrors,
  formatConfigValue,
  SOURCE_LABEL,
  toDraft,
  toPatch,
} from '../../lib/delivery-config';
import {DeliveryConfigFields, type InheritedValue} from './delivery-config-fields';

/** Store overrides on top of the city's defaults (ADR 0001 §1). */
export function StoreDeliverySettings({
  store,
  canManage,
}: {
  store: AdminStoreDetail;
  canManage: boolean;
}) {
  const effective = useStoreDeliveryConfig(store.id);
  const city = useCity(store.city.id);

  if (effective.isPending || city.isPending) return <Skeleton className="h-96" />;
  if (effective.isError || city.isError) {
    return (
      <Alert tone="danger" title="Couldn’t load delivery settings">
        {errorMessage(effective.error ?? city.error)}
      </Alert>
    );
  }
  return (
    <SettingsForm
      key={store.updatedAt}
      store={store}
      city={city.data}
      effective={effective.data}
      canManage={canManage}
    />
  );
}

function SettingsForm({
  store,
  city,
  effective,
  canManage,
}: {
  store: AdminStoreDetail;
  city: AdminCity;
  effective: EffectiveDeliveryConfig;
  canManage: boolean;
}) {
  const update = useUpdateStore();
  const initial = toDraft(store.configOverrides, effective.config);
  const [draft, setDraft] = useState<ConfigDraft>(initial);
  const [showErrors, setShowErrors] = useState(false);
  const errors = draftErrors(draft);
  const dirty = JSON.stringify(toPatch(draft)) !== JSON.stringify(toPatch(initial));
  const overrides = Object.keys(store.configOverrides).length;

  const inherited = inheritedValues(effective, city);

  const send = (configOverrides: ReturnType<typeof toPatch>) =>
    update.mutate(
      {id: store.id, body: {configOverrides}},
      {onSuccess: saved => toast.success(`Delivery settings for ${saved.name} saved`)}
    );

  const save = () => {
    setShowErrors(true);
    if (Object.keys(errors).length === 0) send(toPatch(draft));
  };

  return (
    <div className="grid max-w-4xl gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="text-title-sm">Delivery settings</h2>
          <p className="max-w-2xl text-body-sm text-ink-muted">
            {overrides === 0
              ? `Everything follows ${city.name}’s defaults. Switch a setting on to set it for this store only.`
              : `${overrides} of 7 set for this store. The rest follow ${city.name}’s defaults.`}
          </p>
        </div>
        {canManage && overrides > 0 ? (
          <Button variant="ghost" size="sm" disabled={update.isPending} onClick={() => send({})}>
            Use {city.name}’s defaults for all
          </Button>
        ) : null}
      </div>

      <DeliveryConfigFields
        draft={draft}
        onChange={setDraft}
        errors={showErrors ? errors : {}}
        inherited={inherited}
        inheritedFeeBasis={
          store.configOverrides.deliveryFeeBasis === undefined
            ? effective.config.deliveryFeeBasis
            : (city.config.deliveryFeeBasis ?? 'FIXED')
        }
        setLabel="Set for this store"
        readOnly={!canManage}
      />

      {update.isError ? <Alert tone="danger">{errorMessage(update.error)}</Alert> : null}
      {canManage ? (
        <div className="flex gap-3">
          <Button onClick={save} loading={update.isPending} disabled={!dirty}>
            Save settings
          </Button>
          {dirty ? (
            <Button variant="ghost" onClick={() => setDraft(initial)}>
              Discard
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * What each setting would be without this store's override. Not overridden:
 * the effective value and its source. Overridden: the city's value when it
 * sets one; otherwise the system default, whose value grov-be doesn't expose.
 */
function inheritedValues(
  effective: EffectiveDeliveryConfig,
  city: AdminCity
): Record<ConfigKey, InheritedValue> {
  const cityDefault = `${city.name} default`;
  const basis = city.config.deliveryFeeBasis ?? effective.config.deliveryFeeBasis;
  const entry = <K extends ConfigKey>(key: K): InheritedValue => {
    const source = effective.sources[key];
    if (source !== 'STORE') {
      return {
        text: formatConfigValue(key, effective.config[key], effective.config.deliveryFeeBasis),
        from: source === 'CITY' ? cityDefault : SOURCE_LABEL.DEFAULT,
      };
    }
    const fromCity = city.config[key];
    return fromCity === undefined
      ? {from: SOURCE_LABEL.DEFAULT}
      : {text: formatConfigValue(key, fromCity as never, basis), from: cityDefault};
  };
  return {
    deliveryDays: entry('deliveryDays'),
    deliveryWindow: entry('deliveryWindow'),
    leadDays: entry('leadDays'),
    editCutoff: entry('editCutoff'),
    deliveryFeeBasis: entry('deliveryFeeBasis'),
    deliveryFee: entry('deliveryFee'),
    minBasket: entry('minBasket'),
  };
}
