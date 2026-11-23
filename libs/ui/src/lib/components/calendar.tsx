import {type ComponentProps} from 'react';

import {ChevronLeft, ChevronRight} from 'lucide-react';
import {DayPicker} from 'react-day-picker';

import {cn} from '../utils/cn';

export type CalendarProps = ComponentProps<typeof DayPicker>;

export function Calendar({className, classNames, showOutsideDays = true, ...props}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={1}
      className={cn('text-body-sm', className)}
      classNames={{
        months: 'relative flex flex-col gap-4 sm:flex-row',
        month: 'grid gap-3',
        month_caption: 'flex h-10 items-center justify-center text-label',
        nav: 'absolute inset-x-0 top-0 flex h-10 items-center justify-between',
        button_previous:
          'flex size-10 items-center justify-center rounded-pill hover:bg-surface-sunken disabled:opacity-40',
        button_next:
          'flex size-10 items-center justify-center rounded-pill hover:bg-surface-sunken disabled:opacity-40',
        month_grid: 'border-collapse',
        weekdays: 'flex',
        weekday: 'w-10 text-chip font-semibold text-ink-muted',
        week: 'mt-1 flex',
        day: 'size-10 p-0 text-center',
        day_button:
          'size-10 rounded-pill tabular outline-none hover:bg-surface-sunken focus-visible:ring-4 focus-visible:ring-flame/20',
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary-hover',
        today: '[&>button]:font-extrabold [&>button]:underline',
        outside: 'text-ink-muted opacity-50',
        disabled: 'text-ink-muted opacity-40 [&>button]:hover:bg-transparent',
        range_middle: '[&>button]:rounded-none [&>button]:bg-flame-tint [&>button]:text-ink',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({orientation}) =>
          orientation === 'left' ? (
            <ChevronLeft aria-hidden className="size-5" />
          ) : (
            <ChevronRight aria-hidden className="size-5" />
          ),
      }}
      {...props}
    />
  );
}
