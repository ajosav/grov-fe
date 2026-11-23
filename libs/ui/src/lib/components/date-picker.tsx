import {useState} from 'react';

import {format} from 'date-fns';
import {CalendarDays} from 'lucide-react';

import {cn} from '../utils/cn';
import {Calendar, type CalendarProps} from './calendar';
import {inputClasses} from './input';
import {Popover, PopoverContent, PopoverTrigger} from './popover';

export interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  /** Days that can't be picked (react-day-picker matcher). */
  disabled?: CalendarProps['disabled'];
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
}

/** Field + calendar popover. Shows DD/MM/YYYY (non-negotiable 8). Use inside `<Field>`. */
export function DatePicker({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  disabled,
  className,
  ...aria
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        {...aria}
        className={cn(
          inputClasses,
          'items-center justify-between text-left',
          !value && 'text-ink-muted',
          className
        )}
      >
        {value ? format(value, 'dd/MM/yyyy') : placeholder}
        <CalendarDays aria-hidden className="size-5 text-ink-muted" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          disabled={disabled}
          onSelect={date => {
            onChange(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
