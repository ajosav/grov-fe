import {type ReactNode} from 'react';

import {cn} from '../utils/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({icon, title, description, action, className}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
      {icon ? (
        <div className="flex size-14 items-center justify-center rounded-lg bg-flame-tint text-flame-strong [&_svg]:size-7">
          {icon}
        </div>
      ) : null}
      <h2 className="text-title-sm">{title}</h2>
      {description ? <p className="max-w-sm text-body text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
