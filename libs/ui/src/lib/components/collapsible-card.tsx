import {type ReactNode, useState} from 'react';

import {ChevronDown} from 'lucide-react';
import {Collapsible} from 'radix-ui';

import {cn} from '../utils/cn';

export interface CollapsibleCardProps {
  title: ReactNode;
  /** Shown in the header next to the chevron (a total, a count). */
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

/** Card whose body folds away (stock-list groups, order details). */
export function CollapsibleCard({
  title,
  summary,
  defaultOpen = true,
  children,
  className,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className={cn('rounded-sm border border-line bg-surface shadow-glass', className)}
    >
      <Collapsible.Trigger className="flex min-h-14 w-full items-center gap-3 px-5 text-left outline-none focus-visible:outline-2 focus-visible:outline-focus">
        <span className="flex-1 text-title-sm">{title}</span>
        {summary ? <span className="text-body-sm text-ink-muted">{summary}</span> : null}
        <ChevronDown
          aria-hidden
          className={cn('size-5 text-ink-muted transition-transform', open && 'rotate-180')}
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="border-t border-line px-5 py-4">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
