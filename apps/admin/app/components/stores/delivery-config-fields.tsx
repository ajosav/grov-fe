import {type ReactNode, useId} from 'react';

import type {DeliveryConfig} from '@grov/models';
import {AmountInput, cn, Input, Segmented, Switch} from '@grov/ui';

import {
  CONFIG_HINT,
  CONFIG_KEYS,
  CONFIG_LABEL,
  type ConfigDraft,
  type ConfigKey,
  formatConfigValue,
  WEEKDAY_LABEL,
  WEEKDAYS,
} from '../../lib/stores/delivery-config';

export interface InheritedValue {
  text?: string;
  from: string;
}

export interface DeliveryConfigFieldsProps {
  draft: ConfigDraft;
  onChange: (draft: ConfigDraft) => void;
  errors?: Partial<Record<ConfigKey, string>>;
  inherited: Record<ConfigKey, InheritedValue>;
  setLabel: string;
  /** The fee basis that applies when this level doesn't set one. */
  inheritedFeeBasis?: DeliveryConfig['deliveryFeeBasis'];
  readOnly?: boolean;
}

export function DeliveryConfigFields({
  draft,
  onChange,
  errors = {},
  inherited,
  setLabel,
  inheritedFeeBasis = 'FIXED',
  readOnly,
}: DeliveryConfigFieldsProps) {
  const basis = draft.deliveryFeeBasis.set ? draft.deliveryFeeBasis.value : inheritedFeeBasis;
  const update = <K extends ConfigKey>(key: K, next: Partial<ConfigDraft[K]>) =>
    onChange({...draft, [key]: {...draft[key], ...next}});

  return (
    <div className="divide-y divide-line rounded-md border border-line">
      {CONFIG_KEYS.map(key => (
        <SettingRow
          key={key}
          configKey={key}
          set={draft[key].set}
          onSetChange={set => update(key, {set})}
          setLabel={setLabel}
          inherited={inherited[key]}
          error={errors[key]}
          readOnly={readOnly}
        >
          <SettingEditor
            configKey={key}
            draft={draft}
            basis={basis}
            onValue={value => update(key, {value} as Partial<ConfigDraft[typeof key]>)}
            disabled={readOnly}
          />
        </SettingRow>
      ))}
    </div>
  );
}

function SettingRow({
  configKey,
  set,
  onSetChange,
  setLabel,
  inherited,
  error,
  readOnly,
  children,
}: {
  configKey: ConfigKey;
  set: boolean;
  onSetChange: (set: boolean) => void;
  setLabel: string;
  inherited: InheritedValue;
  error?: string;
  readOnly?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      className="grid gap-3 p-4 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-6"
    >
      <div className="grid content-start gap-0.5">
        <p id={`${id}-label`} className="text-label">
          {CONFIG_LABEL[configKey]}
        </p>
        <p className="text-body-sm text-ink-muted">{CONFIG_HINT[configKey]}</p>
      </div>
      <div className="grid content-start gap-3">
        <label className="flex items-center gap-3 text-body-sm">
          <Switch checked={set} onCheckedChange={onSetChange} disabled={readOnly} />
          {setLabel}
        </label>
        {set ? (
          <>
            {children}
            {error ? (
              <p role="alert" className="text-body-sm text-danger">
                {error}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-body-sm text-ink-muted">
            {inherited.text ? (
              <>
                <span className="text-ink">{inherited.text}</span> · {inherited.from}
              </>
            ) : (
              inherited.from
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function SettingEditor({
  configKey,
  draft,
  basis,
  onValue,
  disabled,
}: {
  configKey: ConfigKey;
  draft: ConfigDraft;
  basis: DeliveryConfig['deliveryFeeBasis'];
  onValue: (value: DeliveryConfig[ConfigKey]) => void;
  disabled?: boolean;
}) {
  const label = CONFIG_LABEL[configKey];
  const compact = 'h-10';
  switch (configKey) {
    case 'deliveryDays': {
      const days = draft.deliveryDays.value;
      return (
        <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map(day => {
            const on = days.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={on}
                disabled={disabled}
                onClick={() =>
                  onValue(
                    on
                      ? days.filter(d => d !== day)
                      : WEEKDAYS.filter(d => d === day || days.includes(d))
                  )
                }
                className={cn(
                  'h-9 min-w-12 rounded-pill border px-3 text-body-sm font-semibold transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                  'pointer-coarse:min-h-11',
                  on
                    ? 'border-night bg-night text-on-night'
                    : 'border-line-strong/40 text-ink-muted hover:text-ink'
                )}
              >
                {WEEKDAY_LABEL[day]}
              </button>
            );
          })}
        </div>
      );
    }
    case 'deliveryWindow': {
      const w = draft.deliveryWindow.value;
      return (
        <div className="flex items-center gap-2">
          <Input
            type="time"
            aria-label="Window starts"
            value={w.start}
            disabled={disabled}
            onChange={e => onValue({...w, start: e.target.value})}
            className={cn(compact, 'w-32')}
          />
          <span className="text-body-sm text-ink-muted">to</span>
          <Input
            type="time"
            aria-label="Window ends"
            value={w.end}
            disabled={disabled}
            onChange={e => onValue({...w, end: e.target.value})}
            className={cn(compact, 'w-32')}
          />
        </div>
      );
    }
    case 'leadDays':
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={14}
            aria-label={label}
            value={draft.leadDays.value}
            disabled={disabled}
            onChange={e => onValue(e.target.valueAsNumber)}
            className={cn(compact, 'w-24 tabular')}
          />
          <span className="text-body-sm text-ink-muted">days after ordering</span>
        </div>
      );
    case 'editCutoff': {
      const c = draft.editCutoff.value;
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={7}
            aria-label="Days before delivery"
            value={c.daysBefore}
            disabled={disabled}
            onChange={e => onValue({...c, daysBefore: e.target.valueAsNumber})}
            className={cn(compact, 'w-20 tabular')}
          />
          <span className="text-body-sm text-ink-muted">days before, at</span>
          <Input
            type="time"
            aria-label="Cut-off time"
            value={c.time}
            disabled={disabled}
            onChange={e => onValue({...c, time: e.target.value})}
            className={cn(compact, 'w-32')}
          />
        </div>
      );
    }
    case 'deliveryFeeBasis':
      return (
        <Segmented
          label={label}
          value={draft.deliveryFeeBasis.value}
          onChange={value => (disabled ? undefined : onValue(value))}
          options={[
            {value: 'FIXED', label: 'Fixed'},
            {value: 'PER_KM', label: 'Per km'},
          ]}
          size="sm"
        />
      );
    case 'deliveryFee':
    case 'minBasket': {
      const money = draft[configKey].value;
      const perKm = configKey === 'deliveryFee' && basis === 'PER_KM';
      return (
        <div className="flex items-center gap-2">
          <div className="w-44">
            <AmountInput
              aria-label={label}
              valueKobo={money.kobo}
              onChangeKobo={kobo => onValue({kobo: kobo ?? 0, currency: 'NGN'})}
              disabled={disabled}
              className={compact}
            />
          </div>
          {perKm ? <span className="text-body-sm text-ink-muted">per km</span> : null}
        </div>
      );
    }
    default:
      return null;
  }
}

/** "Sat · City default" style values for each inherited setting. */
export function inheritedFrom(
  values: Partial<DeliveryConfig>,
  from: (key: ConfigKey) => string
): Record<ConfigKey, InheritedValue> {
  const basis = values.deliveryFeeBasis ?? 'FIXED';
  const entry = <K extends ConfigKey>(key: K): InheritedValue => {
    const value = values[key] as DeliveryConfig[K] | undefined;
    return {
      text: value === undefined ? undefined : formatConfigValue(key, value, basis),
      from: from(key),
    };
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
