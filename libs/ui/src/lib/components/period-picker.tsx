import {useState} from 'react';

import {CalendarRange} from 'lucide-react';

import {cn} from '../utils/cn';
import {
  longDay,
  PERIOD_PRESETS,
  type PeriodPreset,
  type PeriodValue,
  toIsoDay,
} from '../utils/period';
import {Badge} from './badge';
import {Button} from './button';
import {DatePicker} from './date-picker';
import {Field} from './field';
import {Popover, PopoverContent, PopoverTrigger} from './popover';

function presetLabel(value: PeriodValue) {
  if (value.preset === 'custom' && value.from && value.to) {
    return `${longDay(value.from)} – ${longDay(value.to)}`;
  }
  return PERIOD_PRESETS.find(p => p.value === value.preset)?.label ?? 'Last 30 days';
}

/** Today, 7, 30, 90 days, or a custom range (at most a year, from the server). */
export interface PeriodPickerProps {
  value: PeriodValue;
  onChange: (value: PeriodValue) => void;
}

export function PeriodPicker({value, onChange}: PeriodPickerProps) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<Date | undefined>(value.from ? new Date(value.from) : undefined);
  const [to, setTo] = useState<Date | undefined>(value.to ? new Date(value.to) : undefined);
  const invalid = Boolean(from && to && from > to);
  const pick = (preset: PeriodPreset) => {
    onChange({preset});
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <CalendarRange aria-hidden /> {presetLabel(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3">
        <div className="grid gap-1" role="group" aria-label="Period">
          {PERIOD_PRESETS.map(preset => (
            <button
              key={preset.value}
              type="button"
              onClick={() => pick(preset.value)}
              className={cn(
                'flex h-9 items-center justify-between rounded-sm px-3 text-left text-body-sm hover:bg-surface-sunken',
                value.preset === preset.value && 'bg-surface-sunken font-semibold'
              )}
            >
              {preset.label}
              {value.preset === preset.value ? <Badge tone="flame">Selected</Badge> : null}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-3 border-t border-line pt-3">
          <p className="text-label text-ink-muted">Custom range</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="From">
              <DatePicker value={from} onChange={setFrom} disabled={{after: new Date()}} />
            </Field>
            <Field label="To" error={invalid ? 'After the start' : undefined}>
              <DatePicker value={to} onChange={setTo} disabled={{after: new Date()}} />
            </Field>
          </div>
          <Button
            size="sm"
            disabled={!from || !to || invalid}
            onClick={() => {
              if (!from || !to) return;
              onChange({preset: 'custom', from: toIsoDay(from), to: toIsoDay(to)});
              setOpen(false);
            }}
          >
            Apply range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
