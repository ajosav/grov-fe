import {type ComponentProps} from 'react';

import {RadioGroup as RadioGroupPrimitive} from 'radix-ui';

import {cn} from '../utils/cn';

export function RadioGroup({className, ...props}: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn('grid gap-3', className)} {...props} />;
}

export function RadioGroupItem({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        'peer flex size-5 shrink-0 items-center justify-center rounded-pill border border-line-strong bg-surface outline-none',
        'focus-visible:ring-4 focus-visible:ring-flame/20 disabled:cursor-not-allowed disabled:opacity-60',
        'data-[state=checked]:border-ink',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="block size-2.5 rounded-pill bg-ink" />
    </RadioGroupPrimitive.Item>
  );
}
