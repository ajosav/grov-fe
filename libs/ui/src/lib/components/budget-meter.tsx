import {cn} from '../utils/cn';
import {formatNaira} from '../utils/money';
import {Button} from './button';

export interface BudgetMeterProps {
  totalKobo: number;
  budgetKobo?: number | null;
  label?: string;
  onFit?: () => void;
  onAddBudget?: () => void;
  className?: string;
}

export function BudgetMeter({
  totalKobo,
  budgetKobo,
  label = 'Plan total',
  onFit,
  onAddBudget,
  className,
}: BudgetMeterProps) {
  const hasBudget = typeof budgetKobo === 'number' && budgetKobo > 0;
  const over = hasBudget ? Math.max(0, totalKobo - budgetKobo) : 0;
  const scale = hasBudget ? Math.max(totalKobo, budgetKobo) : totalKobo;
  const within = hasBudget ? Math.min(totalKobo, budgetKobo) / scale : 1;
  const overRatio = hasBudget ? over / scale : 0;

  return (
    <div className={cn('grid gap-3', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-body-sm font-semibold text-ink-muted">{label}</span>
        <span className="tabular font-display text-title-lg">{formatNaira(totalKobo)}</span>
      </div>
      <div
        className="flex h-3 overflow-hidden rounded-pill bg-surface-sunken"
        role="img"
        aria-label={
          hasBudget
            ? over > 0
              ? `${formatNaira(over)} above your ${formatNaira(budgetKobo)} budget`
              : `${formatNaira(budgetKobo - totalKobo)} left in your ${formatNaira(budgetKobo)} budget`
            : 'No budget set'
        }
      >
        <div className="h-full bg-ink" style={{width: `${within * 100}%`}} />
        {overRatio > 0 ? (
          <div
            className="h-full bg-ink-muted/60"
            style={{
              width: `${overRatio * 100}%`,
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent 0 4px, var(--surface-sunken) 4px 7px)',
            }}
          />
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-body-sm">
        {hasBudget ? (
          over > 0 ? (
            <span>
              <span className="font-semibold">{formatNaira(over)} above</span> your{' '}
              {formatNaira(budgetKobo)} budget
            </span>
          ) : (
            <span>
              <span className="font-semibold">{formatNaira(budgetKobo - totalKobo)} left</span> in
              your {formatNaira(budgetKobo)} budget
            </span>
          )
        ) : (
          <span className="text-ink-muted">
            No budget set. That’s fine; the plan stands on its own.
          </span>
        )}
        {hasBudget && over > 0 && onFit ? (
          <Button variant="link" size="sm" onClick={onFit}>
            See ways to fit
          </Button>
        ) : null}
        {!hasBudget && onAddBudget ? (
          <Button variant="link" size="sm" onClick={onAddBudget}>
            Add a budget
          </Button>
        ) : null}
      </div>
    </div>
  );
}
