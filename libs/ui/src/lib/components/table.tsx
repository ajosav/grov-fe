import {type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes} from 'react';

import {cn} from '../utils/cn';

/** Dense admin tables (the admin uses calm surfaces, no wash). */
export function Table({className, ...props}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-sm border border-line bg-surface">
      <table className={cn('w-full caption-bottom text-body-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({className, ...props}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-surface-sunken', className)} {...props} />;
}

export function TableBody({className, ...props}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({className, ...props}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('border-b border-line hover:bg-surface-sunken/60', className)} {...props} />
  );
}

export function TableHead({className, ...props}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-11 px-4 text-left align-middle text-chip uppercase tracking-wide text-ink-muted',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({className, ...props}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-middle', className)} {...props} />;
}
