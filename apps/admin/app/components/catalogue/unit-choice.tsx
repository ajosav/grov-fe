import {Field, Segmented} from '@grov/ui';

import {BASE_UNIT_CODES, BASE_UNITS, type BaseUnit} from '../../lib/units';

const LABELS: Record<BaseUnit, string> = {g: 'By weight', ml: 'By volume', piece: 'By count'};

export interface UnitChoiceProps {
  /** `null` until the admin chooses: nothing is preselected. */
  value: BaseUnit | null;
  onChange: (unit: BaseUnit) => void;
  error?: string;
  disabled?: boolean;
}

/** What the product is counted in, chosen before any size is entered. */
export function UnitChoice({value, onChange, error, disabled}: UnitChoiceProps) {
  return (
    <Field
      label="How is this product sold?"
      error={error}
      hint={
        value ? BASE_UNITS[value].hint : 'Weight, volume, or a count of pieces, packs or bundles.'
      }
    >
      <Segmented<BaseUnit>
        label="How is this product sold?"
        value={value}
        onChange={unit => !disabled && onChange(unit)}
        options={BASE_UNIT_CODES.map(code => ({value: code, label: LABELS[code]}))}
      />
    </Field>
  );
}
