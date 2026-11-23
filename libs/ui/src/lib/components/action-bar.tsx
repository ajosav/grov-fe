import {type ReactNode} from 'react';

import {cn} from '../utils/cn';
import {Money} from './money';

export interface ActionBarProps {
  /** What is paid now (integer kobo, from the server). */
  amountKobo: number;
  label?: string;
  /** Secondary line under the amount ("Delivery Sat 10am–2pm"). */
  sub?: ReactNode;
  /** The next step, usually one `<Button size="lg">`. */
  action: ReactNode;
  className?: string;
}

/**
 * Sticky bottom bar on plan, basket and checkout (design system "ActionBar"):
 * the amount and the next step. Respects the bottom safe area.
 */
export function ActionBar({amountKobo, label = 'To pay', sub, action, className}: ActionBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 -mx-4 flex items-center gap-4 border-t border-line glass-strong px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:mx-0 sm:rounded-lg sm:border',
        className
      )}
    >
      <div className="grid min-w-0 flex-1">
        <span className="text-body-sm text-ink-muted">{label}</span>
        <Money kobo={amountKobo} className="font-display text-title-lg" />
        {sub ? <span className="truncate text-body-sm text-ink-muted">{sub}</span> : null}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
