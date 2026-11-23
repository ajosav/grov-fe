import {cn} from '../utils/cn';
import {formatNaira, type FormatNairaOptions} from '../utils/money';

export interface MoneyProps extends FormatNairaOptions {
  /** Integer kobo from the API. Never compute totals in the client. */
  kobo: number;
  className?: string;
}

export function Money({kobo, className, ...options}: MoneyProps) {
  return (
    <span data-money className={cn('tabular whitespace-nowrap', className)}>
      {formatNaira(kobo, options)}
    </span>
  );
}
