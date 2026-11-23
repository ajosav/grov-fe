import {cn} from '../utils/cn';

export function OrSeparator({label = 'or', className}: {label?: string; className?: string}) {
  return (
    <div className={cn('flex items-center gap-3 text-body-sm text-ink-muted', className)}>
      <span aria-hidden className="h-px flex-1 bg-line" />
      {label}
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  );
}
