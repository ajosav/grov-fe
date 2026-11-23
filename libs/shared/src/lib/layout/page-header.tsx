import {type ReactNode} from 'react';

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({title, description, actions}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="grid gap-1">
        <h1 className="text-title-lg">{title}</h1>
        {description ? <p className="max-w-2xl text-body text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
