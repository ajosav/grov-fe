import {type HTMLAttributes} from 'react';

import {cn} from '../utils/cn';

/** A keyboard key or shortcut, e.g. `<Kbd>⌘K</Kbd>`. */
export function Kbd({className, ...props}: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-6 items-center justify-center rounded-sm border border-line bg-surface px-1.5 font-sans text-chip text-ink-muted',
        className
      )}
      {...props}
    />
  );
}
