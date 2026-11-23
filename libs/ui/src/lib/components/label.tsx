import {type ComponentProps} from 'react';

import {Label as LabelPrimitive} from 'radix-ui';

import {cn} from '../utils/cn';

export function Label({className, ...props}: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-body-sm font-semibold text-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
        className
      )}
      {...props}
    />
  );
}
