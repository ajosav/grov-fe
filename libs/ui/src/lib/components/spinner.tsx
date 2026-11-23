import {LoaderCircle} from 'lucide-react';

import {cn} from '../utils/cn';

export interface SpinnerProps {
  className?: string;
  /** Announced to screen readers. Pass an empty string when a parent already says it is busy. */
  label?: string;
}

export function Spinner({className, label = 'Loading'}: SpinnerProps) {
  return (
    <span role={label ? 'status' : undefined} className="inline-flex">
      <LoaderCircle aria-hidden className={cn('size-5 animate-spin', className)} />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
